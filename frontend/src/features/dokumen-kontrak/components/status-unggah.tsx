// ============================================================
// StatusUnggah — komponen status progres setelah submit
// Menampilkan: mengunggah → memproses → selesai | gagal
// Selaras Alur Kritikal 1 PRD.md Bagian 4.11
// ============================================================

"use client";

import { motion, useReducedMotion } from "motion/react";
import { CheckCircle, AlertCircle, RefreshCw, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import type { StateUnggah } from "../types";

interface PropsStatusUnggah {
  state: StateUnggah;
  onCobaLagi: () => void;
}

export function StatusUnggah({ state, onCobaLagi }: PropsStatusUnggah) {
  const { status, progressPersen, pesanError } = state;
  // Hormati preferensi aksesibilitas pengguna (DESIGN.md)
  const kurangiGerak = useReducedMotion();

  if (status === "idle" || status === "memvalidasi") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: kurangiGerak ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: kurangiGerak ? 0 : 0.2 }}
      className="rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-5"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Status: mengunggah */}
      {status === "mengunggah" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={kurangiGerak ? {} : { rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="h-4 w-4 shrink-0"
              aria-hidden="true"
            >
              <RefreshCw className="h-4 w-4 text-[var(--jernih-primary)]" />
            </motion.div>
            <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
              Mengunggah file...
            </p>
          </div>
          <Progress value={progressPersen} className="h-1.5" aria-label={`Progres unggah ${progressPersen}%`} />
          <p className="text-label-sm text-[var(--jernih-neutral)]">
            Harap tunggu, file sedang dikirim ke server.
          </p>
        </div>
      )}

      {/* Status: memproses AI */}
      {status === "memproses" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {/* Shimmer pulse sebagai pengganti shimmer button Magic UI untuk loading AI */}
            <motion.div
              animate={kurangiGerak ? { opacity: 1 } : { opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--jernih-primary)]"
              aria-hidden="true"
            />
            <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
              AI sedang menganalisis kontrakmu...
            </p>
          </div>
          <Progress value={progressPersen} className="h-1.5" aria-label="AI sedang memproses" />
          <p className="text-label-sm text-[var(--jernih-neutral)]">
            Proses biasanya selesai dalam 30–60 detik. Kamu akan diarahkan
            otomatis setelah selesai.
          </p>
        </div>
      )}

      {/* Status: selesai */}
      {status === "selesai" && (
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: kurangiGerak ? 1 : 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <CheckCircle
              className="h-5 w-5 text-[var(--jernih-success)]"
              aria-hidden="true"
            />
          </motion.div>
          <div>
            <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
              Kontrak berhasil diunggah!
            </p>
            <p className="text-label-sm text-[var(--jernih-neutral)]">
              Mengarahkan ke halaman hasil audit...
            </p>
          </div>
        </div>
      )}

      {/* Status: gagal — kuota habis, tampilkan banner upgrade (PRD.md F-BILL-01) */}
      {status === "gagal" && state.kuotaHabis && (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--jernih-radius-md)] bg-[var(--jernih-warning)]/10">
              <TrendingUp
                className="h-4 w-4 text-[var(--jernih-warning)]"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>
            <div className="flex-1">
              <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
                Kuota audit bulan ini habis
              </p>
              <p className="mt-1 text-body-md text-[var(--jernih-neutral)]">
                Upgrade ke Pro untuk audit tidak terbatas dan fitur negosiasi
                tanpa batas.
              </p>
              {/* CTA upgrade — tidak memblokir akses riwayat (PRD.md F-BILL-01) */}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Link
                  href="/langganan"
                  className="btn-brutal inline-flex items-center gap-1.5 px-4 py-2 text-body-md font-medium"
                >
                  <TrendingUp className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  Lihat Paket Upgrade
                </Link>
                <Link
                  href="/riwayat"
                  className="text-body-md text-[var(--jernih-neutral)] underline-offset-2 hover:text-[var(--jernih-on-surface)] hover:underline"
                >
                  Lihat riwayat kontrak lama
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status: gagal — error umum (bukan kuota habis) */}
      {status === "gagal" && !state.kuotaHabis && (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--jernih-error)]"
              aria-hidden="true"
            />
            <div className="flex-1">
              <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
                Gagal memproses kontrak
              </p>
              <p className="mt-1 text-body-md text-[var(--jernih-neutral)]">
                {pesanError ?? "Terjadi kesalahan. Coba lagi."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCobaLagi}
            className="text-body-md font-medium text-[var(--jernih-primary)] underline-offset-2 hover:underline"
          >
            Coba lagi
          </button>
        </div>
      )}
    </motion.div>
  );
}