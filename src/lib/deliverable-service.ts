/**
 * Deliverable Service — the one place deliverables are created, versioned, and
 * transitioned. Mirrors the conventions of `@/lib/project-service`:
 *   - accepts a base Prisma client or a `$transaction` client (`Db`),
 *   - never writes activity directly — every meaningful mutation logs through
 *     the single Timeline Service (`@/lib/timeline-service`),
 *   - keeps file bytes out of the DB: uploads go through the replaceable storage
 *     abstraction (`@/lib/storage`); rows store only the opaque `storageKey`.
 *
 * "Every upload automatically creates a timeline event" — enforced here so no
 * caller can add a version without the timeline recording it.
 *
 * Server-only.
 */

import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage";
import { timelineService } from "@/lib/timeline-service";
import {
  PROJECT_ACTIVITY_VERB,
  DELIVERABLE_KIND,
  DELIVERABLE_STATUS,
} from "@/constants/project";
import type {
  Deliverable,
  DeliverableVersion,
  DeliverableStatus,
} from "@/types/project";

type Db = PrismaClient | Prisma.TransactionClient;

/* ── Row → domain mappers ──────────────────────────────────────────────────── */

type VersionRow = {
  id: string;
  deliverableId: string;
  version: number;
  storageKey: string | null;
  fileName: string | null;
  contentType: string | null;
  sizeBytes: number | null;
  externalUrl: string | null;
  note: string | null;
  uploadedById: string | null;
  createdAt: Date;
};

type DeliverableRow = {
  id: string;
  projectId: string;
  phaseId: string | null;
  kind: string;
  title: string;
  description: string | null;
  status: string;
  clientVisible: boolean;
  currentVersion: number;
  uploadedById: string | null;
  createdAt: Date;
  updatedAt: Date;
  versions: VersionRow[];
};

function toVersion(row: VersionRow): DeliverableVersion {
  return {
    id: row.id,
    deliverableId: row.deliverableId,
    version: row.version,
    storageKey: row.storageKey,
    fileName: row.fileName,
    contentType: row.contentType,
    sizeBytes: row.sizeBytes,
    externalUrl: row.externalUrl,
    note: row.note,
    uploadedById: row.uploadedById,
    createdAt: row.createdAt.toISOString(),
  };
}

function toDeliverable(row: DeliverableRow): Deliverable {
  return {
    id: row.id,
    projectId: row.projectId,
    phaseId: row.phaseId,
    kind: row.kind as Deliverable["kind"],
    title: row.title,
    description: row.description,
    status: row.status as DeliverableStatus,
    clientVisible: row.clientVisible,
    currentVersion: row.currentVersion,
    uploadedById: row.uploadedById,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    versions: [...row.versions].sort((a, b) => b.version - a.version).map(toVersion),
  };
}

const withVersions = {
  versions: { orderBy: { version: "desc" as const } },
};

/* ── Inputs ────────────────────────────────────────────────────────────────── */

export interface UploadFileInput {
  projectId: string;
  phaseId?: string | null;
  title: string;
  description?: string | null;
  clientVisible?: boolean;
  fileName: string;
  contentType: string;
  data: Buffer;
  note?: string | null;
  actorId?: string | null;
}

export interface AddLinkInput {
  projectId: string;
  phaseId?: string | null;
  title: string;
  description?: string | null;
  clientVisible?: boolean;
  externalUrl: string;
  note?: string | null;
  actorId?: string | null;
}

export interface AddVersionInput {
  deliverableId: string;
  fileName?: string;
  contentType?: string;
  data?: Buffer;
  externalUrl?: string;
  note?: string | null;
  actorId?: string | null;
}

/* ── Reads ─────────────────────────────────────────────────────────────────── */

/** All deliverables for a project (admin view), newest first. */
export async function listProjectDeliverables(
  projectId: string,
  db: Db = prisma
): Promise<Deliverable[]> {
  const rows = await db.deliverable.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    include: withVersions,
  });
  return rows.map(toDeliverable);
}

/** Client-visible deliverables for a project (read-only client view). */
export async function listClientDeliverables(
  projectId: string,
  db: Db = prisma
): Promise<Deliverable[]> {
  const rows = await db.deliverable.findMany({
    where: { projectId, clientVisible: true },
    orderBy: { createdAt: "desc" },
    include: withVersions,
  });
  return rows.map(toDeliverable);
}

/** One deliverable with full version history, or null. */
export async function getDeliverable(
  deliverableId: string,
  db: Db = prisma
): Promise<Deliverable | null> {
  const row = await db.deliverable.findUnique({
    where: { id: deliverableId },
    include: withVersions,
  });
  return row ? toDeliverable(row) : null;
}

/** Resolve a single version (for download), or null. */
export async function getVersion(
  versionId: string,
  db: Db = prisma
): Promise<DeliverableVersion | null> {
  const row = await db.deliverableVersion.findUnique({ where: { id: versionId } });
  return row ? toVersion(row) : null;
}

/** Read stored bytes for a file version. Throws for link versions. */
export async function readVersionBytes(version: DeliverableVersion): Promise<Buffer> {
  if (!version.storageKey) {
    throw new Error("readVersionBytes: version has no stored file (link deliverable).");
  }
  return getStorage().get(version.storageKey);
}

/* ── Writes ────────────────────────────────────────────────────────────────── */

/**
 * Create a NEW file deliverable with its first version. Writes bytes to storage,
 * then persists deliverable + version in a transaction, then logs the upload.
 */
export async function uploadFileDeliverable(input: UploadFileInput): Promise<Deliverable> {
  const title = input.title.trim();
  if (!title) throw new Error("uploadFileDeliverable: title is required.");
  if (input.data.byteLength === 0) throw new Error("uploadFileDeliverable: empty file.");

  const stored = await getStorage().put({
    keyPrefix: `projects/${input.projectId}`,
    fileName: input.fileName,
    contentType: input.contentType,
    data: input.data,
  });

  const deliverable = await prisma.$transaction(async (tx) => {
    const created = await tx.deliverable.create({
      data: {
        projectId: input.projectId,
        phaseId: input.phaseId ?? null,
        kind: DELIVERABLE_KIND.FILE,
        title,
        description: input.description?.trim() || null,
        status: DELIVERABLE_STATUS.PENDING,
        clientVisible: input.clientVisible ?? true,
        currentVersion: 1,
        uploadedById: input.actorId ?? null,
        versions: {
          create: {
            version: 1,
            storageKey: stored.storageKey,
            fileName: input.fileName,
            contentType: stored.contentType,
            sizeBytes: stored.sizeBytes,
            note: input.note?.trim() || null,
            uploadedById: input.actorId ?? null,
          },
        },
      },
      include: withVersions,
    });

    await logUpload(tx, created.projectId, title, 1, input.actorId ?? null, created.id);
    return created;
  });

  return toDeliverable(deliverable);
}

/**
 * Create a NEW link deliverable (external URL, no stored bytes) with version 1.
 */
export async function addLinkDeliverable(input: AddLinkInput): Promise<Deliverable> {
  const title = input.title.trim();
  const url = input.externalUrl.trim();
  if (!title) throw new Error("addLinkDeliverable: title is required.");
  if (!url) throw new Error("addLinkDeliverable: externalUrl is required.");

  const deliverable = await prisma.$transaction(async (tx) => {
    const created = await tx.deliverable.create({
      data: {
        projectId: input.projectId,
        phaseId: input.phaseId ?? null,
        kind: DELIVERABLE_KIND.LINK,
        title,
        description: input.description?.trim() || null,
        status: DELIVERABLE_STATUS.PENDING,
        clientVisible: input.clientVisible ?? true,
        currentVersion: 1,
        uploadedById: input.actorId ?? null,
        versions: {
          create: {
            version: 1,
            externalUrl: url,
            note: input.note?.trim() || null,
            uploadedById: input.actorId ?? null,
          },
        },
      },
      include: withVersions,
    });

    await logUpload(tx, created.projectId, title, 1, input.actorId ?? null, created.id);
    return created;
  });

  return toDeliverable(deliverable);
}

/**
 * Append a new version to an existing deliverable and bump `currentVersion`.
 * Adding a new version resets review status to `pending` (fresh artifact needs
 * re-review). Logs the upload.
 */
export async function addDeliverableVersion(input: AddVersionInput): Promise<Deliverable> {
  const existing = await prisma.deliverable.findUnique({
    where: { id: input.deliverableId },
    select: { id: true, projectId: true, title: true, kind: true, currentVersion: true },
  });
  if (!existing) throw new Error("addDeliverableVersion: deliverable not found.");

  const nextVersion = existing.currentVersion + 1;
  const isFile = existing.kind === DELIVERABLE_KIND.FILE;

  let storageKey: string | null = null;
  let fileName: string | null = null;
  let contentType: string | null = null;
  let sizeBytes: number | null = null;
  let externalUrl: string | null = null;

  if (isFile) {
    if (!input.data || input.data.byteLength === 0 || !input.fileName) {
      throw new Error("addDeliverableVersion: file version requires a non-empty file.");
    }
    const stored = await getStorage().put({
      keyPrefix: `projects/${existing.projectId}`,
      fileName: input.fileName,
      contentType: input.contentType ?? "application/octet-stream",
      data: input.data,
    });
    storageKey = stored.storageKey;
    fileName = input.fileName;
    contentType = stored.contentType;
    sizeBytes = stored.sizeBytes;
  } else {
    const url = input.externalUrl?.trim();
    if (!url) throw new Error("addDeliverableVersion: link version requires externalUrl.");
    externalUrl = url;
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.deliverableVersion.create({
      data: {
        deliverableId: existing.id,
        version: nextVersion,
        storageKey,
        fileName,
        contentType,
        sizeBytes,
        externalUrl,
        note: input.note?.trim() || null,
        uploadedById: input.actorId ?? null,
      },
    });
    const row = await tx.deliverable.update({
      where: { id: existing.id },
      data: { currentVersion: nextVersion, status: DELIVERABLE_STATUS.PENDING },
      include: withVersions,
    });

    await logUpload(
      tx,
      existing.projectId,
      existing.title,
      nextVersion,
      input.actorId ?? null,
      existing.id
    );
    return row;
  });

  return toDeliverable(updated);
}

/**
 * Approve or reject a deliverable (admin review). Logs the status change through
 * the Timeline Service. No-op if the status is unchanged.
 */
export async function setDeliverableStatus(
  deliverableId: string,
  status: DeliverableStatus,
  actorId: string | null = null,
  db: Db = prisma
): Promise<Deliverable> {
  const existing = await db.deliverable.findUnique({
    where: { id: deliverableId },
    select: { id: true, projectId: true, title: true, status: true },
  });
  if (!existing) throw new Error("setDeliverableStatus: deliverable not found.");

  if (existing.status !== status) {
    await db.deliverable.update({ where: { id: deliverableId }, data: { status } });
    await timelineService.log(
      {
        projectId: existing.projectId,
        verb: PROJECT_ACTIVITY_VERB.DELIVERABLE_STATUS_CHANGED,
        message: `Deliverable "${existing.title}" ${status}.`,
        actorId,
        metadata: { deliverableId, from: existing.status, to: status },
      },
      db
    );
  }

  const row = await db.deliverable.findUniqueOrThrow({
    where: { id: deliverableId },
    include: withVersions,
  });
  return toDeliverable(row);
}

/* ── Internal ──────────────────────────────────────────────────────────────── */

/** Log an upload to the timeline. Used by every create/version path. */
async function logUpload(
  db: Db,
  projectId: string,
  title: string,
  version: number,
  actorId: string | null,
  deliverableId: string
): Promise<void> {
  await timelineService.log(
    {
      projectId,
      verb: PROJECT_ACTIVITY_VERB.DELIVERABLE_UPLOADED,
      message:
        version === 1
          ? `Deliverable "${title}" uploaded.`
          : `Deliverable "${title}" updated to v${version}.`,
      actorId,
      metadata: { deliverableId, version },
    },
    db
  );
}
