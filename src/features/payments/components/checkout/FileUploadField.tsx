"use client";

/**
 * Frontend-only file upload UI. Captures file metadata (name/size/type) into
 * checkout state for display and later submission — no storage/network upload
 * happens here (that's Files/R2 in a later sprint, per docs/BACKEND.md §9).
 */

import { useRef } from "react";
import { motion } from "framer-motion";
import { File, Upload, X } from "lucide-react";
import type { CheckoutFileRef } from "@/types/checkout";
import { cn } from "@/lib/utils";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUploadField({
  files,
  onChange,
}: {
  files: CheckoutFileRef[];
  onChange: (files: CheckoutFileRef[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const additions: CheckoutFileRef[] = Array.from(fileList).map((f) => ({
      id: `${f.name}-${f.size}-${f.lastModified}`,
      name: f.name,
      sizeBytes: f.size,
      type: f.type || "application/octet-stream",
    }));
    // De-dupe by id (same name+size+lastModified).
    const existingIds = new Set(files.map((f) => f.id));
    onChange([...files, ...additions.filter((f) => !existingIds.has(f.id))]);
  };

  const removeFile = (id: string) => onChange(files.filter((f) => f.id !== id));

  return (
    <div>
      <span className="mb-1.5 flex items-center justify-between text-sm font-medium text-ink-soft">
        Reference files
        <span className="text-xs font-normal text-ink-faint">Optional</span>
      </span>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-line bg-base/50 px-6 py-8 text-center transition-colors",
          "hover:border-royal/40 hover:bg-surface"
        )}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-royal/10 text-royal">
          <Upload className="h-4 w-4" />
        </span>
        <span className="text-sm font-medium text-ink-soft">
          Drop files here, or click to browse
        </span>
        <span className="text-xs text-ink-faint">
          Briefs, brand assets, references — any format
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file) => (
            <motion.li
              key={file.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-2.5"
            >
              <File className="h-4 w-4 shrink-0 text-ink-faint" />
              <span className="flex-1 truncate text-sm text-ink-soft">{file.name}</span>
              <span className="shrink-0 text-xs text-ink-faint">{formatSize(file.sizeBytes)}</span>
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                aria-label={`Remove ${file.name}`}
                className="shrink-0 text-ink-faint transition-colors hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
