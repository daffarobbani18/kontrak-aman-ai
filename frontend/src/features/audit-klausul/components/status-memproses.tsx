// ============================================================
// StatusMemproses — tampilan saat polling audit masih berjalan
// Sesuai PRD Alur Kritikal 1 langkah 6: tampilkan status 'sedang menganalisis'
// Animasi Motion, hormati prefers-reduced-motion (DESIGN.md)
// ============================================================

"use client";

import { motion, useReducedMotion } from "motion/react";
import { ScanSearch } from "lucide-react";

interface PropStatusMemproses {
  progres: number; // 0–100
}

export function StatusMemproses({ progres }: PropStatusMemproses) {
  const kurangiGerak = useReducedMotion();

  return (
    <div
      className="flex flex-col items-center justify-center gap-6 py-16"
      role="status"
      aria-live="polite"
      aria-label={`Menganalisis kontrak, progres ${progres} persen`}
    >
      {/* Ikon animasi */}
      <motion.div
        animate={
          kurangiGerak
            ? {}
            : {
                scale: [1, 1.08, 1],
                opacity: [0.8, 1, 0.8],
              }
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="flex h-16 w-16 items-center justify-center rounded-[var(--jernih-radius-lg)] border-2 border-[var(--jernih-primary)]/30 bg-[var(--jernih-primary)]/10"
        aria-hidden="true"
      >
        <ScanSearch
          className="h-8 w-8 text-[var(--jernih-primary)]"
          strokeWidth={1.5}
        />
      </motion.div>

      {/* Teks status */}
      <div className="text-center">
        <p
          className="text-headline-md text-[var(--jernih-on-surface)]"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Menganalisis Kontrak
        </p>
        <p className="mt-1 text-body-md text-[var(--jernih-neutral)]">
          AI sedang membaca dan mengidentifikasi klausul berisiko...
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div
          className="h-2 overflow-hidden rounded-full bg-[var(--jernih-neutral)]/15"
          role="progressbar"
          aria-valuenow={progres}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progres analisis ${progres}%`}
        >
          <motion.div
            className="h-full rounded-full bg-[var(--jernih-primary)]"
            initial={{ width: "0%" }}
            animate={{ width: `${Math.max(progres, 5)}%` }}
            transition={kurangiGerak ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="mt-2 text-center text-label-sm text-[var(--jernih-neutral)]">
          {progres > 0 ? `${progres}%` : "Memulai analisis..."}
        </p>
      </div>

      {/* Info tambahan */}
      <p className="text-center text-label-sm text-[var(--jernih-neutral)]">
        Biasanya selesai dalam kurang dari 60 detik.
        <br />
        Kamu bisa menutup halaman ini — hasilnya akan tersimpan di riwayat.
      </p>
    </div>
  );
}