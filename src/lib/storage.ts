/**
 * Storage abstraction — the ONE seam every module uses to persist and read
 * uploaded bytes. Deliberately provider-agnostic: the deliverable service talks
 * only to the `StorageProvider` interface, never to a concrete backend, so the
 * local-disk implementation here can be swapped for S3 / R2 / Supabase later
 * without touching callers (Sprint 13 constraint: local storage only, provider
 * must be replaceable).
 *
 * A `storageKey` is an opaque, provider-relative identifier (e.g.
 * "projects/<projectId>/<cuid>-<filename>"). Callers persist the key; only this
 * module knows how a key maps to physical bytes.
 *
 * Server-only (uses node:fs). Do NOT import from client components.
 */

import { createHash, randomBytes } from "node:crypto";
import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";

export interface StoredObject {
  storageKey: string;
  sizeBytes: number;
  contentType: string;
}

export interface PutObjectInput {
  /** Logical folder within the store (e.g. "projects/<id>"). */
  keyPrefix: string;
  /** Original filename — used to derive extension + a human-readable key tail. */
  fileName: string;
  contentType: string;
  data: Buffer;
}

/**
 * The replaceable storage contract. A future cloud provider implements the same
 * three methods; nothing else in the app changes.
 */
export interface StorageProvider {
  put(input: PutObjectInput): Promise<StoredObject>;
  get(storageKey: string): Promise<Buffer>;
  delete(storageKey: string): Promise<void>;
}

/** Turn an arbitrary filename into a safe, collision-resistant key segment. */
function safeKeySegment(fileName: string): string {
  const ext = path.extname(fileName).slice(0, 12);
  const base = path
    .basename(fileName, path.extname(fileName))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const rand = randomBytes(6).toString("hex");
  return `${base || "file"}-${rand}${ext}`;
}

/**
 * Local filesystem provider — writes under `<root>` (default `.storage/` at the
 * project root, git-ignored). Keys are stored relative to the root; absolute
 * paths are resolved on read and guarded against traversal outside the root.
 */
class LocalStorageProvider implements StorageProvider {
  private readonly root: string;

  constructor(root: string) {
    this.root = path.resolve(root);
  }

  private resolve(storageKey: string): string {
    const abs = path.resolve(this.root, storageKey);
    if (abs !== this.root && !abs.startsWith(this.root + path.sep)) {
      throw new Error("storage: key escapes storage root.");
    }
    return abs;
  }

  async put(input: PutObjectInput): Promise<StoredObject> {
    const prefix = input.keyPrefix.replace(/^\/+|\/+$/g, "");
    const storageKey = `${prefix}/${safeKeySegment(input.fileName)}`;
    const abs = this.resolve(storageKey);
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(abs, input.data);
    return {
      storageKey,
      sizeBytes: input.data.byteLength,
      contentType: input.contentType,
    };
  }

  async get(storageKey: string): Promise<Buffer> {
    return readFile(this.resolve(storageKey));
  }

  async delete(storageKey: string): Promise<void> {
    await unlink(this.resolve(storageKey)).catch(() => {
      /* already gone — deletion is idempotent */
    });
  }
}

let cached: StorageProvider | null = null;

/**
 * Resolve the active storage provider. Currently always local-disk; swapping in
 * a cloud provider is a one-line change here (gate on an env var / config) and
 * requires NO changes at any call site.
 */
export function getStorage(): StorageProvider {
  if (!cached) {
    const root = process.env.LOCAL_STORAGE_DIR ?? path.join(process.cwd(), ".storage");
    cached = new LocalStorageProvider(root);
  }
  return cached;
}

/** Stable content hash (for future dedupe/integrity); not persisted yet. */
export function contentHash(data: Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}
