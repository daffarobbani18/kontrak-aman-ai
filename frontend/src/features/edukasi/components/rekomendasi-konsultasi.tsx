// ============================================================
// RekomendasiKonsultasi — rekomendasi konsultasi profesional
// Sesuai F-EDU-03 PRD.md — WAJIB tampil saat skor risiko Merah
// DESIGN.md: warna tertiary (teal) untuk aksen informasional edukasi
// ============================================================

import { Scale } from "lucide-react";

export function RekomendasiKonsultasi() {
  return (
    <div
      className="flex items-start gap-2.5 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-error)]/20 bg-[var(--jernih-surface)] px-4 py-3"
      role="alert"
      aria-label="Rekomendasi konsultasi hukum profesional"
    >
      <Scale
        className="mt-0.5 h-4 w-4 shrink-0 text-[var(--jernih-error)]"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <p className="text-label-sm leading-relaxed text-[var(--jernih-on-surface)]">
        Kontrak ini memiliki risiko tinggi.{" "}
        <strong className="font-medium text-[var(--jernih-error)]">
          Sangat disarankan berkonsultasi dengan pengacara
        </strong>{" "}
        sebelum menandatangani, terutama jika nilai kontrak besar atau
        menyangkut hak cipta.
      </p>
    </div>
  );
}