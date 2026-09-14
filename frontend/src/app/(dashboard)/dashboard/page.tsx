"use client";

import { useState } from "react";
import { useDashboard } from "@/features/dashboard/context/dashboard-context";
import KartuAuditBaru from "@/features/dashboard/components/kartu-audit-baru";
import KartuKuota from "@/features/dashboard/components/kartu-kuota";
import KartuDistribusiRisiko from "@/features/dashboard/components/kartu-distribusi-risiko";
import KartuKontrakTerbaru from "@/features/dashboard/components/kartu-kontrak-terbaru";
import BannerVerifikasiEmail from "@/features/dashboard/components/banner-verifikasi-email";
import { BannerOnboarding } from "@/features/dashboard/components/banner-onboarding";
import { Loader2 } from "lucide-react";

// ============================================================
// Halaman Dashboard — halaman pertama setelah login
// Sesuai PRD F-DASH-01 dan Alur Kritikal 1
// Layout bento grid sesuai DESIGN.md
// ============================================================
export default function HalamanDashboard() {
  const { profil, dokumen, sedangMemuat, kesalahan, muatUlang } = useDashboard();
  const [bannerDitutup, setBannerDitutup] = useState(false);

  // State loading
  if (sedangMemuat) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            className="h-8 w-8 animate-spin text-[var(--jernih-primary)]"
            aria-hidden="true"
          />
          <p className="text-body-md text-[var(--jernih-neutral)]">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  // State error
  if (kesalahan) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-body-md text-[var(--jernih-error)]">{kesalahan}</p>
          <button onClick={muatUlang} className="btn-brutal px-6 py-2.5 text-body-md font-medium">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Banner verifikasi email — F-AUTH-04 PRD */}
      {profil && !profil.email_terverifikasi && !bannerDitutup && (
        <div className="mb-6">
          <BannerVerifikasiEmail email={profil.email} onTutup={() => setBannerDitutup(true)} />
        </div>
      )}

      {/* Banner onboarding — F-PROF-01 PRD, muncul jika onboarding belum selesai */}
      {/* Sengaja tidak mensyaratkan email_terverifikasi — PRD F-PROF-01 tidak mewajibkan itu */}
      {profil && !profil.onboarding_selesai && (
        <div className="mb-6">
          <BannerOnboarding />
        </div>
      )}

      {/* Salam pengguna */}
      {profil && (
        <div className="mb-8">
          <h1
            className="text-headline-lg text-[var(--jernih-on-surface)]"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Halo, {profil.nama_lengkap.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-body-md text-[var(--jernih-neutral)]">
            Apa yang ingin kamu audit hari ini?
          </p>
        </div>
      )}

      {/* Bento grid — sesuai DESIGN.md */}
      {/* Mobile: 1 kolom, Tablet: 2 kolom, Desktop: 3 kolom */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Tile 1 — CTA audit baru (tile besar, span 2 kolom di desktop) */}
        <div className="lg:col-span-2">
          <KartuAuditBaru />
        </div>

        {/* Tile 2 — Kuota & tier */}
        {profil && (
          <div>
            <KartuKuota profil={profil} />
          </div>
        )}

        {/* Tile 3 — Distribusi risiko (span 1 kolom) */}
        <div>
          <KartuDistribusiRisiko dokumen={dokumen} />
        </div>

        {/* Tile 4 — Daftar kontrak terbaru (span penuh) */}
        <div className="sm:col-span-2 lg:col-span-2">
          <KartuKontrakTerbaru dokumen={dokumen} totalDokumen={dokumen.length} />
        </div>
      </div>
    </div>
  );
}
