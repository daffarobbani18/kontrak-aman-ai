"use client";

// ============================================================
// BannerOnboarding — prompt onboarding di dashboard
// Muncul jika pengguna belum menyelesaikan onboarding (F-PROF-01 PRD)
//
// Sebelumnya: cek localStorage key onboarding_selesai
// Sekarang: cek field onboarding_selesai dari profil (GET /pengguna/saya)
// yang sudah tersedia di DashboardContext — tidak perlu localStorage lagi
// ============================================================

import { useState } from "react";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";
import { useDashboard } from "@/features/dashboard/context/dashboard-context";

export function BannerOnboarding() {
  const { profil } = useDashboard();
  const [ditutup, setDitutup] = useState(false);

  // Tampilkan banner jika:
  // 1. Profil sudah termuat (bukan null)
  // 2. onboarding_selesai masih false (belum pernah isi atau lewati)
  // 3. Pengguna belum menutup banner secara manual di sesi ini
  const tampil = profil !== null && !profil.onboarding_selesai && !ditutup;

  if (!tampil) return null;

  return (
    <div
      className="flex items-start justify-between gap-4 rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-tertiary)]/30 bg-[var(--jernih-tertiary)]/5 px-4 py-3"
      role="status"
      aria-label="Lengkapi profil onboarding"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--jernih-radius-md)] bg-[var(--jernih-tertiary)]/10">
          <Sparkles
            className="h-4 w-4 text-[var(--jernih-tertiary)]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0">
          <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
            Lengkapi profilmu
          </p>
          <p className="mt-0.5 text-body-md text-[var(--jernih-neutral)]">
            Ceritakan sedikit tentang pekerjaanmu agar hasil audit lebih relevan.
          </p>
          <Link
            href="/onboarding"
            className="mt-2 inline-block text-body-md font-medium text-[var(--jernih-tertiary)] underline-offset-2 hover:underline"
          >
            Isi sekarang
          </Link>
        </div>
      </div>

      {/* Tombol tutup — tidak menandai onboarding selesai, hanya sembunyikan banner di sesi ini */}
      <button
        type="button"
        onClick={() => setDitutup(true)}
        className="shrink-0 rounded-[var(--jernih-radius-sm)] p-1 text-[var(--jernih-neutral)]/50 transition-colors hover:bg-[var(--jernih-neutral)]/10 hover:text-[var(--jernih-neutral)]"
        aria-label="Tutup banner"
      >
        <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}