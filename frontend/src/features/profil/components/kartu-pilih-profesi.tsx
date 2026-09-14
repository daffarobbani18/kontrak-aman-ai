// ============================================================
// KartuPilihProfesi — kartu pilihan profesi di halaman onboarding
// F-PROF-01 PRD.md: onboarding pemilihan profesi
// DESIGN.md: flat card, border primary saat terpilih, animasi motion
// ============================================================

import { motion, useReducedMotion } from "motion/react";
import { Palette, PenLine, Code2, Briefcase } from "lucide-react";
import type { NilaiProfesi } from "../types";
import { PILIHAN_PROFESI } from "../types";

// Peta ikon per profesi
const PETA_IKON: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: "true" }>> = {
  Palette,
  PenLine,
  Code2,
  Briefcase,
};

interface PropKartuPilihProfesi {
  terpilih: NilaiProfesi | null;
  onPilih: (nilai: NilaiProfesi) => void;
  nonaktif?: boolean;
}

export function KartuPilihProfesi({ terpilih, onPilih, nonaktif = false }: PropKartuPilihProfesi) {
  const kurangiGerak = useReducedMotion();

  return (
    <div
      className="grid grid-cols-2 gap-3"
      role="radiogroup"
      aria-label="Pilih profesi"
    >
      {PILIHAN_PROFESI.map((profesi) => {
        const aktif = terpilih === profesi.nilai;
        const Ikon = PETA_IKON[profesi.ikonNama];

        return (
          <motion.button
            key={profesi.nilai}
            type="button"
            role="radio"
            aria-checked={aktif}
            disabled={nonaktif}
            onClick={() => onPilih(profesi.nilai as NilaiProfesi)}
            whileHover={kurangiGerak ? {} : { scale: 1.02 }}
            whileTap={kurangiGerak ? {} : { scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`flex flex-col items-start gap-2.5 rounded-[var(--jernih-radius-lg)] border-2 p-4 text-left transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
              aktif
                ? "border-[var(--jernih-primary)] bg-[var(--jernih-primary)]/5"
                : "border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] hover:border-[var(--jernih-primary)]/40 hover:bg-[var(--jernih-primary)]/3"
            }`}
          >
            {/* Ikon */}
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-[var(--jernih-radius-md)] ${
                aktif
                  ? "bg-[var(--jernih-primary)]/10"
                  : "bg-[var(--jernih-neutral)]/10"
              }`}
            >
              {Ikon && (
                <Ikon
                  className={`h-4.5 w-4.5 ${
                    aktif
                      ? "text-[var(--jernih-primary)]"
                      : "text-[var(--jernih-neutral)]"
                  }`}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Label + deskripsi */}
            <div>
              <p
                className={`text-body-md font-medium leading-tight ${
                  aktif
                    ? "text-[var(--jernih-primary)]"
                    : "text-[var(--jernih-on-surface)]"
                }`}
              >
                {profesi.label}
              </p>
              <p className="mt-0.5 text-label-sm leading-snug text-[var(--jernih-neutral)]">
                {profesi.deskripsi}
              </p>
            </div>

            {/* Indikator terpilih */}
            {aktif && (
              <span className="sr-only">Terpilih</span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}