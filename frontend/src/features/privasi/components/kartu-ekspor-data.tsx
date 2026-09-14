"use client";

// ============================================================
// KartuEksporData — F-PRIV-03 PRD.md
// Ekspor data pribadi sesuai UU Nomor 27 Tahun 2022 tentang PDP
// POST /pengguna/saya/ekspor-data (api.md 5.5)
// GET  /pengguna/saya/ekspor-data/status (api.md 5.6)
// DESIGN.md: flat, warna tertiary untuk info, success untuk selesai,
//   error untuk gagal. Bukan btn-brutal — bukan aksi terpenting di halaman.
// ============================================================

import { motion, useReducedMotion } from "motion/react";
import { Download, Loader2, CheckCircle, AlertCircle, RotateCcw } from "lucide-react";
import { useEksporData } from "../hooks/use-ekspor-data";

export function KartuEksporData() {
  const { state, ajukan, reset } = useEksporData();
  const kurangiGerak = useReducedMotion();

  const sedangMemproses =
    state.status === "mengajukan" || state.status === "memproses";

  return (
    <div
      className="rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-6"
      aria-label="Ekspor data pribadi"
    >
      <div className="flex items-start gap-4">
        {/* Ikon — warna tertiary sesuai DESIGN.md untuk aksen informasional */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--jernih-radius-md)] bg-[var(--jernih-tertiary)]/10">
          <Download
            className="h-5 w-5 text-[var(--jernih-tertiary)]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="text-headline-md text-[var(--jernih-on-surface)]"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Ekspor Data Pribadi
          </h3>
          <p className="mt-1 text-body-md text-[var(--jernih-neutral)]">
            Sesuai UU Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi,
            kamu berhak mendapatkan salinan seluruh data pribadimu yang tersimpan
            di KontrakAman AI.
          </p>
          <p className="mt-2 text-body-md text-[var(--jernih-neutral)]">
            Data yang bisa diekspor meliputi: profil akun, daftar dokumen yang
            diunggah, hasil audit, dan draf negosiasi. Tautan unduhan akan
            dikirim ke email terdaftarmu.
          </p>

          <div className="mt-4 space-y-3">
            {/* ── State: idle — tombol minta ekspor ── */}
            {state.status === "idle" && (
              <motion.button
                type="button"
                onClick={ajukan}
                whileHover={kurangiGerak ? {} : { scale: 1.01 }}
                whileTap={kurangiGerak ? {} : { scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-neutral)]/30 bg-[var(--jernih-surface)] px-4 py-2 text-body-md text-[var(--jernih-on-surface)] transition-colors duration-150 hover:border-[var(--jernih-neutral)]/50 hover:bg-[var(--jernih-on-surface)]/5"
                aria-label="Minta ekspor seluruh data pribadi"
              >
                <Download className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                Minta Ekspor Data
              </motion.button>
            )}

            {/* ── State: mengajukan — loading request ── */}
            {state.status === "mengajukan" && (
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-neutral)]/5 px-4 py-2 text-body-md text-[var(--jernih-neutral)] cursor-not-allowed"
                aria-busy="true"
                aria-label="Sedang mengajukan permintaan ekspor..."
              >
                <Loader2
                  className="h-4 w-4 animate-spin"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                Mengajukan...
              </button>
            )}

            {/* ── State: memproses — polling, backend menyiapkan berkas ── */}
            {state.status === "memproses" && (
              <motion.div
                initial={kurangiGerak ? {} : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex items-start gap-3 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-tertiary)]/20 bg-[var(--jernih-tertiary)]/5 px-4 py-3"
                role="status"
                aria-live="polite"
              >
                <Loader2
                  className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-[var(--jernih-tertiary)]"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <div>
                  <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
                    Sedang menyiapkan datamu
                  </p>
                  <p className="mt-0.5 text-label-sm text-[var(--jernih-neutral)]">
                    {state.estimasiMenit
                      ? `Estimasi selesai dalam ~${state.estimasiMenit} menit. `
                      : ""}
                    Tautan unduhan akan dikirim ke emailmu.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── State: selesai — konfirmasi email terkirim ── */}
            {state.status === "selesai" && (
              <motion.div
                initial={kurangiGerak ? {} : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="space-y-3"
              >
                <div
                  className="flex items-start gap-3 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-success)]/20 bg-[var(--jernih-success)]/5 px-4 py-3"
                  role="status"
                  aria-live="polite"
                >
                  <CheckCircle
                    className="mt-0.5 h-4 w-4 shrink-0 text-[var(--jernih-success)]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
                      Tautan unduhan telah dikirim
                    </p>
                    <p className="mt-0.5 text-label-sm text-[var(--jernih-neutral)]">
                      Cek emailmu untuk mengunduh berkas data pribadi.
                      Tautan bersifat sementara dan akan kedaluwarsa.
                    </p>
                  </div>
                </div>
                {/* Tombol minta ekspor ulang */}
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 text-body-md text-[var(--jernih-neutral)] underline-offset-2 hover:text-[var(--jernih-on-surface)] hover:underline"
                >
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                  Minta Ekspor Ulang
                </button>
              </motion.div>
            )}

            {/* ── State: gagal — pesan error + coba lagi ── */}
            {state.status === "gagal" && (
              <motion.div
                initial={kurangiGerak ? {} : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="space-y-3"
              >
                <div
                  className="flex items-start gap-3 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-error)]/20 bg-[var(--jernih-surface)] px-4 py-3"
                  role="alert"
                >
                  <AlertCircle
                    className="mt-0.5 h-4 w-4 shrink-0 text-[var(--jernih-error)]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <p className="text-body-md text-[var(--jernih-on-surface)]">
                    {state.pesanError ?? "Gagal mengajukan permintaan ekspor data."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 text-body-md text-[var(--jernih-primary)] underline-offset-2 hover:underline"
                >
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                  Coba Lagi
                </button>
              </motion.div>
            )}

            {/* Info tambahan — hanya tampil saat idle atau selesai */}
            {(state.status === "idle" || state.status === "selesai") && (
              <p className="text-label-sm text-[var(--jernih-neutral)]/70">
                Permintaan ekspor hanya bisa diajukan satu kali dalam satu waktu.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}