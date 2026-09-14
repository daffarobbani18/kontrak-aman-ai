"use client";

// ============================================================
// FormOnboarding — form pemilihan profesi saat onboarding
// F-PROF-01 PRD.md: onboarding pemilihan profesi (Should Have)
// DESIGN.md: animasi motion, btn-brutal untuk aksi utama
// ============================================================

import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, SkipForward } from "lucide-react";
import { KartuPilihProfesi } from "./kartu-pilih-profesi";
import { useOnboarding } from "../hooks/use-onboarding";

export function FormOnboarding() {
  const { state, pilihProfesi, simpan, lewati } = useOnboarding();
  const kurangiGerak = useReducedMotion();
  const sedangMenyimpan = state.status === "menyimpan";

  return (
    <motion.div
      initial={kurangiGerak ? {} : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col gap-8"
    >
      {/* Header */}
      <div>
        <p className="text-label-sm font-medium text-[var(--jernih-tertiary)]">
          Langkah terakhir
        </p>
        <h1
          className="mt-1 text-headline-lg text-[var(--jernih-on-surface)]"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Kamu bekerja sebagai apa?
        </h1>
        <p className="mt-2 text-body-md text-[var(--jernih-neutral)]">
          Ini membantu kami memberikan konteks yang lebih relevan saat mengaudit
          kontrakmu. Bisa diubah kapan saja lewat halaman profil.
        </p>
      </div>

      {/* Kartu pilihan profesi */}
      <KartuPilihProfesi
        terpilih={state.profesiTerpilih}
        onPilih={pilihProfesi}
        nonaktif={sedangMenyimpan}
      />

      {/* Error */}
      {state.pesanError && (
        <p className="text-body-md text-[var(--jernih-error)]" role="alert">
          {state.pesanError}
        </p>
      )}

      {/* Tombol aksi */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={simpan}
          disabled={!state.profesiTerpilih || sedangMenyimpan}
          className="btn-brutal flex w-full items-center justify-center gap-2 py-3 text-body-md font-medium disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sedangMenyimpan ? (
            <>
              <motion.span
                animate={kurangiGerak ? {} : { opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              >
                Menyimpan...
              </motion.span>
            </>
          ) : (
            <>
              Mulai Audit Kontrak
              <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </>
          )}
        </button>

        {/* Lewati — sesuai PRD F-PROF-01: pengguna dapat melewati */}
        <button
          type="button"
          onClick={lewati}
          disabled={sedangMenyimpan}
          className="flex items-center justify-center gap-1.5 text-body-md text-[var(--jernih-neutral)] underline-offset-2 transition-colors hover:text-[var(--jernih-on-surface)] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SkipForward className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          Lewati untuk sekarang
        </button>
      </div>
    </motion.div>
  );
}