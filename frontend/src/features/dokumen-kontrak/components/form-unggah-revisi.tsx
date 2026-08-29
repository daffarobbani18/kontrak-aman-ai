"use client";

// ============================================================
// FormUnggahRevisi — form unggah versi baru kontrak
// POST /dokumen-kontrak/:id/revisi (api.md 6.5)
// F-DOC-05 PRD.md: unggah ulang revisi kontrak (Could Have)
//
// DESIGN.md:
//   - Input file pakai zona klik/drag — reuse pola zona-unggah.tsx
//   - Field catatan_revisi opsional — textarea, max 500 karakter
//   - Tombol primary hanya satu aksi per layar
//   - Banner kuota habis konsisten dengan form-unggah.tsx
//   - Feedback status inline, bukan modal
// ============================================================

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "motion/react";
import { Upload, FileText, X, AlertCircle, CheckCircle } from "lucide-react";
import { skemaUnggahRevisi } from "../types";
import type { NilaiFormUnggahRevisi, StatusUnggah } from "../types";

interface PropFormUnggahRevisi {
  statusUnggah: StatusUnggah;
  pesanError: string | null;
  kuotaHabis: boolean;
  onUnggah: (file: File, catatan?: string) => void;
  onReset: () => void;
}

export function FormUnggahRevisi({
  statusUnggah,
  pesanError,
  kuotaHabis,
  onUnggah,
  onReset,
}: PropFormUnggahRevisi) {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const kurangiGerak = useReducedMotion();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<NilaiFormUnggahRevisi>({
    resolver: zodResolver(skemaUnggahRevisi),
  });

  const fileTerpilih = watch("file");
  const catatanRevisi = watch("catatan_revisi") ?? "";
  const sedangMemproses =
    statusUnggah === "mengunggah" || statusUnggah === "memproses";

  const tanganiSubmit = (data: NilaiFormUnggahRevisi) => {
    if (sedangMemproses) return;
    onUnggah(data.file, data.catatan_revisi ?? undefined);
  };

  const tanganiPilihFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("file", file, { shouldValidate: true });
    }
  };

  const tanganiHapusFile = () => {
    setValue("file", undefined as unknown as File, { shouldValidate: false });
    if (inputFileRef.current) inputFileRef.current.value = "";
    onReset();
  };

  const tanganiReset = () => {
    reset();
    if (inputFileRef.current) inputFileRef.current.value = "";
    onReset();
  };

  // ── State: selesai ──
  if (statusUnggah === "selesai") {
    return (
      <motion.div
        initial={kurangiGerak ? {} : { opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" as const }}
        className="flex items-center gap-3 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-success)]/30 bg-[var(--jernih-success)]/5 px-4 py-3"
        role="status"
        aria-live="polite"
      >
        <CheckCircle
          className="h-5 w-5 shrink-0 text-[var(--jernih-success)]"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="text-body-md font-medium text-[var(--jernih-success)]">
            Revisi berhasil diunggah
          </p>
          <p className="text-label-sm text-[var(--jernih-neutral)]">
            Audit ulang sedang berjalan. Kamu akan diarahkan ke hasil audit baru.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(tanganiSubmit)} noValidate>
      <div className="space-y-4">
        {/* Banner kuota habis — konsisten dengan form-unggah.tsx */}
        {kuotaHabis && (
          <div
            className="flex items-start gap-3 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-warning)]/30 bg-[var(--jernih-warning)]/5 px-4 py-3"
            role="alert"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--jernih-warning)]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
                Kuota audit habis
              </p>
              <p className="mt-0.5 text-body-md text-[var(--jernih-neutral)]">
                Upgrade ke Pro untuk audit tidak terbatas.
              </p>
            </div>
          </div>
        )}

        {/* Zona pilih file */}
        {!fileTerpilih ? (
          <div>
            <button
              type="button"
              onClick={() => inputFileRef.current?.click()}
              disabled={sedangMemproses}
              className={[
                "flex w-full flex-col items-center gap-3 rounded-[var(--jernih-radius-lg)]",
                "border-2 border-dashed border-[var(--jernih-neutral)]/30 px-6 py-8",
                "text-center transition-colors duration-150",
                "hover:border-[var(--jernih-primary)]/50 hover:bg-[var(--jernih-primary)]/3",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                "focus-visible:outline-[var(--jernih-primary)]",
                "disabled:cursor-not-allowed disabled:opacity-50",
              ].join(" ")}
              aria-label="Pilih file revisi kontrak"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--jernih-radius-md)] bg-[var(--jernih-primary)]/10">
                <Upload
                  className="h-5 w-5 text-[var(--jernih-primary)]"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
                  Pilih file revisi
                </p>
                <p className="mt-0.5 text-label-sm text-[var(--jernih-neutral)]">
                  PDF, JPG, PNG, atau WEBP — maks 10MB
                </p>
              </div>
            </button>
            <input
              ref={inputFileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="sr-only"
              aria-hidden="true"
              tabIndex={-1}
              onChange={tanganiPilihFile}
            />
            {/* Error validasi file */}
            {errors.file && (
              <p className="mt-1.5 text-label-sm text-[var(--jernih-error)]" role="alert">
                {errors.file.message}
              </p>
            )}
          </div>
        ) : (
          /* File sudah dipilih — tampil ringkasan */
          <div className="flex items-center gap-3 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-primary)]/10">
              <FileText
                className="h-4 w-4 text-[var(--jernih-primary)]"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-md font-medium text-[var(--jernih-on-surface)]">
                {fileTerpilih.name}
              </p>
              <p className="text-label-sm text-[var(--jernih-neutral)]">
                {(fileTerpilih.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={tanganiHapusFile}
              disabled={sedangMemproses}
              className="shrink-0 rounded-[var(--jernih-radius-sm)] p-1 text-[var(--jernih-neutral)]/50 transition-colors hover:bg-[var(--jernih-neutral)]/10 hover:text-[var(--jernih-neutral)] disabled:cursor-not-allowed"
              aria-label="Hapus file yang dipilih"
            >
              <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Catatan revisi — opsional, max 500 karakter */}
        <div>
          <label
            htmlFor="catatan-revisi"
            className="mb-1.5 block text-body-md font-medium text-[var(--jernih-on-surface)]"
          >
            Catatan revisi
            <span className="ml-1 text-label-sm font-normal text-[var(--jernih-neutral)]">
              (opsional)
            </span>
          </label>
          <textarea
            id="catatan-revisi"
            {...register("catatan_revisi")}
            placeholder="Contoh: Klien sudah hapus klausul denda tanpa batas dan memperbaiki termin pembayaran."
            disabled={sedangMemproses}
            maxLength={500}
            rows={3}
            className={[
              "w-full resize-none rounded-[var(--jernih-radius-sm)] border px-3 py-2",
              "text-body-md text-[var(--jernih-on-surface)] placeholder:text-[var(--jernih-neutral)]/60",
              "transition-colors duration-150 focus:outline-none",
              errors.catatan_revisi
                ? "border-2 border-[var(--jernih-error)] focus:border-[var(--jernih-error)]"
                : "border-[var(--jernih-neutral)]/30 focus:border-2 focus:border-[var(--jernih-primary)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
            ].join(" ")}
            aria-describedby={errors.catatan_revisi ? "error-catatan" : "hitung-catatan"}
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.catatan_revisi ? (
              <p
                id="error-catatan"
                className="text-label-sm text-[var(--jernih-error)]"
                role="alert"
              >
                {errors.catatan_revisi.message}
              </p>
            ) : (
              <span />
            )}
            <p
              id="hitung-catatan"
              className={`text-label-sm ${
                catatanRevisi.length > 450
                  ? "text-[var(--jernih-warning)]"
                  : "text-[var(--jernih-neutral)]"
              }`}
              aria-live="polite"
            >
              {catatanRevisi.length}/500
            </p>
          </div>
        </div>

        {/* Error API */}
        {statusUnggah === "gagal" && pesanError && !kuotaHabis && (
          <div
            className="flex items-start gap-2 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-error)]/30 bg-[var(--jernih-error)]/5 px-3 py-2.5"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--jernih-error)]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <p className="text-body-md text-[var(--jernih-error)]">{pesanError}</p>
          </div>
        )}

        {/* Tombol aksi */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!fileTerpilih || sedangMemproses || kuotaHabis}
            className="btn-brutal flex items-center gap-2 px-5 py-2.5 text-body-md font-medium disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
          >
            {sedangMemproses ? (
              <>
                <motion.span
                  animate={kurangiGerak ? {} : { opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                >
                  {statusUnggah === "mengunggah" ? "Mengunggah..." : "Memproses..."}
                </motion.span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                Unggah Revisi
              </>
            )}
          </button>

          {/* Tombol batal — hanya tampil jika ada file dan belum memproses */}
          {/* statusUnggah "selesai" sudah ditangani di atas via early return */}
          {fileTerpilih && !sedangMemproses && (
            <button
              type="button"
              onClick={tanganiReset}
              className="text-body-md text-[var(--jernih-neutral)] underline-offset-2 transition-colors hover:text-[var(--jernih-on-surface)] hover:underline"
            >
              Batal
            </button>
          )}
        </div>
      </div>
    </form>
  );
}