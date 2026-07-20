/**
 * POST /api/admin/deliverables — admin-only deliverable upload.
 *
 * Accepts multipart/form-data so real files can be uploaded from the admin UI.
 * Fields:
 *   - kind: "file" | "link"
 *   - projectId (required), phaseId (optional)
 *   - title (required), description (optional), clientVisible ("true"/"false")
 *   - deliverableId (optional) — when present, append a new VERSION instead of
 *     creating a new deliverable
 *   - file: the upload (kind="file"); or externalUrl (kind="link")
 *   - note (optional)
 *
 * All bytes flow through the storage abstraction via the deliverable service,
 * which also logs the upload to the Timeline Service. Node runtime (Prisma + fs).
 */

import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import {
  uploadFileDeliverable,
  addLinkDeliverable,
  addDeliverableVersion,
} from "@/lib/deliverable-service";
import { DELIVERABLE_KIND, DELIVERABLE_MAX_UPLOAD_BYTES } from "@/constants/project";

export const runtime = "nodejs";

function bad(message: string, status = 400) {
  return NextResponse.json({ error: { message } }, { status });
}

export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return bad("Forbidden: admin access required.", 403);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return bad("Expected multipart/form-data.");
  }

  const kind = String(form.get("kind") ?? DELIVERABLE_KIND.FILE);
  const projectId = String(form.get("projectId") ?? "").trim();
  const deliverableId = (form.get("deliverableId") as string | null)?.trim() || null;
  const phaseRaw = (form.get("phaseId") as string | null)?.trim();
  const phaseId = phaseRaw ? phaseRaw : null;
  const title = String(form.get("title") ?? "").trim();
  const description = (form.get("description") as string | null)?.trim() || null;
  const note = (form.get("note") as string | null)?.trim() || null;
  const clientVisible = String(form.get("clientVisible") ?? "true") !== "false";

  if (!projectId && !deliverableId) return bad("projectId or deliverableId is required.");

  try {
    // ── New version of an existing deliverable ──────────────────────────────
    if (deliverableId) {
      if (kind === DELIVERABLE_KIND.LINK) {
        const externalUrl = String(form.get("externalUrl") ?? "").trim();
        if (!externalUrl) return bad("externalUrl is required for a link version.");
        const result = await addDeliverableVersion({
          deliverableId,
          externalUrl,
          note,
          actorId: admin.id,
        });
        return NextResponse.json({ data: result }, { status: 201 });
      }
      const file = form.get("file");
      if (!(file instanceof File) || file.size === 0) return bad("A non-empty file is required.");
      if (file.size > DELIVERABLE_MAX_UPLOAD_BYTES) return bad("File exceeds the 25MB limit.", 413);
      const result = await addDeliverableVersion({
        deliverableId,
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        data: Buffer.from(await file.arrayBuffer()),
        note,
        actorId: admin.id,
      });
      return NextResponse.json({ data: result }, { status: 201 });
    }

    // ── New deliverable ─────────────────────────────────────────────────────
    if (!title) return bad("title is required.");

    if (kind === DELIVERABLE_KIND.LINK) {
      const externalUrl = String(form.get("externalUrl") ?? "").trim();
      if (!externalUrl) return bad("externalUrl is required for a link deliverable.");
      const result = await addLinkDeliverable({
        projectId,
        phaseId,
        title,
        description,
        clientVisible,
        externalUrl,
        note,
        actorId: admin.id,
      });
      return NextResponse.json({ data: result }, { status: 201 });
    }

    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) return bad("A non-empty file is required.");
    if (file.size > DELIVERABLE_MAX_UPLOAD_BYTES) return bad("File exceeds the 25MB limit.", 413);
    const result = await uploadFileDeliverable({
      projectId,
      phaseId,
      title,
      description,
      clientVisible,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      data: Buffer.from(await file.arrayBuffer()),
      note,
      actorId: admin.id,
    });
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    console.error("[api/admin/deliverables] upload failed:", error);
    return bad("Upload failed.", 500);
  }
}
