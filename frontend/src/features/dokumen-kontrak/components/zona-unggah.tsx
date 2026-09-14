// ============================================================
// ZonaUnggah — area drag & drop / klik untuk pilih file
// Mendukung PDF, JPG, PNG, WEBP sesuai api.md 6.1
// Aksesibel: keyboard navigable, aria-label, role="button"
// ============================================================

"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "motion/react";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import {
  TIPE_FILE_DIDUKUNG,
  UKURAN_MAKS_LABEL,
} from "../types";

interface PropsZonaUnggah {
  file: File | null;
  onPilihFile: (file: File) => void;
  onHapusFile: () => void;
  errorFile?: string;
  disabled?: boolean;
}

export function ZonaUnggah({
  file,
  onPilihFile,
  onHapusFile,
  errorFile,
  disabled = false,
}: PropsZonaUnggah) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sedangDrag, setSedangDrag] = useState(false);

  const tanganiFile = useCallback(
    (fileBaru: File) => {
      if (disabled) return;
      onPilihFile(fileBaru);
    },
    [disabled, onPilihFile]
  );

  const tanganiDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setSedangDrag(true);
  }, [disabled]);

  const tanganiDragLeave = useCallback(() => {
    setSedangDrag(false);
  }, []);

  const tanganiDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setSedangDrag(false);
      if (disabled) return;
      const fileDijatuhkan = e.dataTransfer.files[0];
      if (fileDijatuhkan) tanganiFile(fileDijatuhkan);
    },
    [disabled, tanganiFile]
  );

  const tanganiInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileDipilih = e.target.files?.[0];
      if (fileDipilih) tanganiFile(fileDipilih);
      // Reset input agar file yang sama bisa dipilih ulang
      e.target.value = "";
    },
    [tanganiFile]
  );

  const tanganiKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && !disabled) {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
    [disabled]
  );

  const formatUkuranFile = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Tampilkan preview file yang sudah dipilih
  if (file) {
    return (
      <div
        className={`rounded-[var(--jernih-radius-lg)] border-2 p-5 ${
          errorFile
            ? "border-[var(--jernih-error)] bg-[var(--jernih-error)]/5"
            : "border-[var(--jernih-primary)] bg-[var(--jernih-primary)]/5"
        }`}
        role="region"
        aria-label="File yang dipilih"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--jernih-radius-md)] bg-[var(--jernih-primary)]/10">
            <FileText
              className="h-5 w-5 text-[var(--jernih-primary)]"
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-body-md font-medium text-[var(--jernih-on-surface)]">
              {file.name}
            </p>
            <p className="mt-0.5 text-label-sm text-[var(--jernih-neutral)]">
              {formatUkuranFile(file.size)} ·{" "}
              {file.type.includes("pdf") ? "PDF" : "Gambar"}
            </p>
          </div>

          {!disabled && (
            <button
              type="button"
              onClick={onHapusFile}
              className="shrink-0 rounded-[var(--jernih-radius-sm)] p-1 text-[var(--jernih-neutral)] transition-colors hover:bg-[var(--jernih-on-surface)]/10 hover:text-[var(--jernih-on-surface)]"
              aria-label="Hapus file yang dipilih"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {errorFile && (
          <div className="mt-3 flex items-center gap-1.5">
            <AlertCircle
              className="h-4 w-4 shrink-0 text-[var(--jernih-error)]"
              aria-hidden="true"
            />
            <p className="text-label-sm text-[var(--jernih-error)]" role="alert">
              {errorFile}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Zona drag & drop kosong
  return (
    <div>
      <motion.div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Zona unggah file kontrak. Klik atau seret file ke sini."
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={tanganiKeyDown}
        onDragOver={tanganiDragOver}
        onDragLeave={tanganiDragLeave}
        onDrop={tanganiDrop}
        animate={{
          borderColor: sedangDrag
            ? "var(--jernih-primary)"
            : errorFile
              ? "var(--jernih-error)"
              : "color-mix(in srgb, var(--jernih-neutral) 40%, transparent)",
          backgroundColor: sedangDrag
            ? "color-mix(in srgb, var(--jernih-primary) 5%, transparent)"
            : "transparent",
        }}
        transition={{ duration: 0.15 }}
        className={`flex cursor-pointer flex-col items-center gap-3 rounded-[var(--jernih-radius-lg)] border-2 border-dashed px-6 py-10 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jernih-primary)] focus-visible:ring-offset-2 ${
          disabled ? "cursor-not-allowed opacity-50" : "hover:border-[var(--jernih-primary)] hover:bg-[var(--jernih-primary)]/5"
        }`}
      >
        <motion.div
          animate={{ scale: sedangDrag ? 1.1 : 1 }}
          transition={{ duration: 0.15 }}
          className="flex h-12 w-12 items-center justify-center rounded-[var(--jernih-radius-md)] bg-[var(--jernih-primary)]/10"
        >
          <Upload
            className="h-6 w-6 text-[var(--jernih-primary)]"
            aria-hidden="true"
          />
        </motion.div>

        <div>
          <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
            {sedangDrag ? "Lepaskan file di sini" : "Seret file ke sini atau klik untuk memilih"}
          </p>
          <p className="mt-1 text-label-sm text-[var(--jernih-neutral)]">
            PDF, JPG, PNG, WEBP · Maks {UKURAN_MAKS_LABEL}
          </p>
        </div>
      </motion.div>

      <input
        ref={inputRef}
        type="file"
        accept={TIPE_FILE_DIDUKUNG.join(",")}
        onChange={tanganiInputChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        disabled={disabled}
      />

      {errorFile && (
        <div className="mt-2 flex items-center gap-1.5">
          <AlertCircle
            className="h-4 w-4 shrink-0 text-[var(--jernih-error)]"
            aria-hidden="true"
          />
          <p className="text-label-sm text-[var(--jernih-error)]" role="alert">
            {errorFile}
          </p>
        </div>
      )}
    </div>
  );
}