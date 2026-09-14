// ============================================================
// DisclaimerHukum — wajib tampil, tidak bisa disembunyikan
// Sesuai F-EDU-01 PRD.md dan larangan di Bagian 11 PRD.md
// DESIGN.md: flat, warna neutral, ikon Info Lucide
// PERHATIAN: Komponen ini tidak boleh dihapus atau di-render bersyarat
// ============================================================

import { Info } from "lucide-react";

export function DisclaimerHukum() {
  return (
    <aside
      aria-label="Disclaimer hukum"
      className="flex gap-3 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-neutral)]/5 px-4 py-3"
    >
      <Info
        className="mt-0.5 h-4 w-4 shrink-0 text-[var(--jernih-neutral)]"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <p className="text-label-sm leading-relaxed text-[var(--jernih-neutral)]">
        Hasil audit ini adalah{" "}
        <strong className="font-medium text-[var(--jernih-on-surface)]">
          alat bantu analisis risiko
        </strong>
        , bukan nasihat hukum profesional. Untuk kontrak bernilai besar atau
        kompleks, tetap disarankan berkonsultasi dengan pengacara.
      </p>
    </aside>
  );
}