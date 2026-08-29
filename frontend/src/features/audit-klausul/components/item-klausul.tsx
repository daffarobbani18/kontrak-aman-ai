// ============================================================
// ItemKlausul — satu temuan klausul, bisa di-expand
// Sesuai F-AUDIT-03 PRD (penjelasan bahasa awam per klausul)
// Sesuai DESIGN.md: badge-risiko-*, animasi Motion, prefers-reduced-motion
// ============================================================

"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PanelDrafNegosiasi } from "@/features/negosiasi/components/panel-draf-negosiasi";
import type { DataKlausul, TingkatRisiko } from "../types";

interface PropItemKlausul {
  klausul: DataKlausul;
  defaultTerbuka?: boolean;
  // Callback opsional saat header klausul diklik — untuk sinkronisasi pratinjau
  onDipilih?: () => void;
}

const KONFIGURASI_RISIKO: Record<
  TingkatRisiko,
  { kelasBadge: string; label: string; kelasGaris: string }
> = {
  merah: {
    kelasBadge: "badge-risiko-merah",
    label: "Risiko Tinggi",
    kelasGaris: "border-l-[var(--jernih-error)]",
  },
  kuning: {
    kelasBadge: "badge-risiko-kuning",
    label: "Perlu Diperhatikan",
    kelasGaris: "border-l-[var(--jernih-warning)]",
  },
  hijau: {
    kelasBadge: "badge-risiko-hijau",
    label: "Aman",
    kelasGaris: "border-l-[var(--jernih-success)]",
  },
};

export function ItemKlausul({
  klausul,
  defaultTerbuka = false,
  onDipilih,
}: PropItemKlausul) {
  const [terbuka, setTerbuka] = useState(
    defaultTerbuka || klausul.tingkat_risiko === "merah"
  );
  const kurangiGerak = useReducedMotion();
  const config = KONFIGURASI_RISIKO[klausul.tingkat_risiko];

  const varianKonten = {
    tertutup: { height: 0, opacity: 0 },
    terbuka: { height: "auto", opacity: 1 },
  };

  return (
    <div
      className={`overflow-hidden rounded-[var(--jernih-radius-md)] border border-[var(--jernih-neutral)]/20 border-l-4 bg-[var(--jernih-surface)] ${config.kelasGaris}`}
    >
      {/* Header — tombol toggle */}
      <button
        type="button"
        onClick={() => {
          setTerbuka((prev) => !prev);
          // Beri tahu parent bahwa klausul ini dipilih untuk pratinjau
          onDipilih?.();
        }}
        className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors duration-150 hover:bg-[var(--jernih-neutral)]/5"
        aria-expanded={terbuka}
        aria-controls={`konten-klausul-${klausul.id}`}
      >
        {/* Badge risiko */}
        <span
          className={`mt-0.5 shrink-0 px-2 py-0.5 text-label-sm font-medium ${config.kelasBadge}`}
        >
          {config.label}
        </span>

        {/* Judul klausul */}
        <span className="flex-1 text-body-md font-medium text-[var(--jernih-on-surface)]">
          {klausul.judul}
        </span>

        {/* Ikon expand/collapse */}
        <span className="shrink-0 text-[var(--jernih-neutral)]" aria-hidden="true">
          {terbuka ? (
            <ChevronUp className="h-4 w-4" strokeWidth={2} />
          ) : (
            <ChevronDown className="h-4 w-4" strokeWidth={2} />
          )}
        </span>
      </button>

      {/* Konten expandable */}
      <motion.div
        id={`konten-klausul-${klausul.id}`}
        initial={false}
        animate={terbuka ? "terbuka" : "tertutup"}
        variants={kurangiGerak ? undefined : varianKonten}
        style={kurangiGerak ? { display: terbuka ? "block" : "none" } : undefined}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="divide-y divide-[var(--jernih-neutral)]/10">

          {/* Teks asli klausul */}
          <div className="px-4 py-4">
            <p className="mb-2 text-label-sm font-semibold uppercase tracking-widest text-[var(--jernih-neutral)]">
              Teks Asli
            </p>
            <blockquote
              className="rounded-[var(--jernih-radius-md)]
                border-l-2 border-[var(--jernih-neutral)]/30
                bg-[var(--jernih-neutral)]/5
                px-4 py-3
                text-body-lg italic leading-relaxed
                text-[var(--jernih-on-surface)]"
            >
              {klausul.teks_asli}
            </blockquote>
          </div>

          {/* Penjelasan bahasa awam — F-AUDIT-03 */}
          <div className="px-4 py-4">
            <p className="mb-2 text-label-sm font-semibold uppercase tracking-widest text-[var(--jernih-neutral)]">
              Apa Artinya?
            </p>
            <p className="text-body-md leading-loose text-[var(--jernih-on-surface)]">
              {klausul.penjelasan}
            </p>
          </div>

          {/* Rekomendasi */}
          <div className="px-4 py-4">
            <p className="mb-2 text-label-sm font-semibold uppercase tracking-widest text-[var(--jernih-neutral)]">
              Yang Bisa Kamu Lakukan
            </p>
            <p className="text-body-md leading-loose text-[var(--jernih-on-surface)]">
              {klausul.rekomendasi}
            </p>
          </div>

          {/* Panel draf negosiasi — ada_draft_negosiasi dari api.md 7.2 */}
          {klausul.ada_draft_negosiasi && (
            <div className="px-4 py-4">
              <PanelDrafNegosiasi
                klausulId={klausul.id}
                judulKlausul={klausul.judul}
                teksAsliKlausul={klausul.teks_asli}
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}