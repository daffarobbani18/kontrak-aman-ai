"use client";

// ============================================================
// KontenProfil — Client Component utama halaman /profil
// Merakit: KartuInfoProfil + FormEditProfil + FormUbahKataSandi
// Sesuai F-PROF-02 PRD, api.md 5.2 & 5.3
// ============================================================

import Link from "next/link";
import { useProfil } from "@/features/profil/hooks/use-profil";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { KartuInfoProfil } from "@/features/profil/components/kartu-info-profil";
import { FormEditProfil } from "@/features/profil/components/form-edit-profil";
import { FormUbahKataSandi } from "@/features/profil/components/form-ubah-kata-sandi";
import { SkeletonProfil } from "@/features/profil/components/skeleton-profil";
import { SeksiPrivasi } from "@/features/privasi/components/seksi-privasi";
import { KartuPreferensiNotifikasi } from "@/features/profil/components/kartu-preferensi-notifikasi";
import { AlertCircle, RotateCcw, Sparkles } from "lucide-react";

export default function KontenProfil() {
  const { state, simpanProfil, simpanKataSandi, muatProfil, resetStatusKataSandi } =
    useProfil();
  // muatUlang dari DashboardProvider supaya navbar dan komponen lain
  // yang membaca profil dari context ikut terupdate setelah nama berubah
  const { muatUlang } = useDashboard();

  const tanganiSimpanProfil = async (namaLengkap: string) => {
    await simpanProfil(namaLengkap);
    // Refresh context global supaya navbar avatar dan greeting ikut update
    await muatUlang();
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-headline-lg text-[var(--jernih-on-surface)]"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Profil Saya
        </h1>
        <p className="mt-1 text-body-md text-[var(--jernih-neutral)]">
          Kelola informasi akun dan keamananmu.
        </p>
      </div>

      {/* ── State: memuat ── */}
      {(state.statusMuat === "idle" || state.statusMuat === "memuat") && (
        <SkeletonProfil />
      )}

      {/* ── State: gagal muat ── */}
      {state.statusMuat === "gagal" && (
        <div
          className="flex flex-col items-center gap-5 py-16 text-center"
          role="alert"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-[var(--jernih-radius-lg)] border-2 border-[var(--jernih-error)]/30 bg-[var(--jernih-error)]/5">
            <AlertCircle
              className="h-7 w-7 text-[var(--jernih-error)]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
          <div>
            <p
              className="text-headline-md text-[var(--jernih-on-surface)]"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Gagal Memuat Profil
            </p>
            <p className="mt-1 text-body-md text-[var(--jernih-neutral)]">
              {state.pesanError ?? "Terjadi kesalahan saat memuat data profil."}
            </p>
          </div>
          <button
            type="button"
            onClick={muatProfil}
            className="btn-brutal inline-flex items-center gap-2 px-5 py-2.5 text-body-md font-medium"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Coba Lagi
          </button>
        </div>
      )}

      {/* ── State: selesai ── */}
      {state.statusMuat === "selesai" && state.data && (
        <div className="space-y-6">
          {/* Banner onboarding — F-PROF-01, tampil jika belum selesai onboarding */}
          {!state.data.onboarding_selesai && (
            <div
              className="flex items-start gap-3 rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-tertiary)]/30 bg-[var(--jernih-tertiary)]/5 px-4 py-3.5"
              role="status"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--jernih-radius-md)] bg-[var(--jernih-tertiary)]/10">
                <Sparkles
                  className="h-4 w-4 text-[var(--jernih-tertiary)]"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
                  Profesimu belum diisi
                </p>
                <p className="mt-0.5 text-body-md text-[var(--jernih-neutral)]">
                  Ceritakan sedikit tentang pekerjaanmu agar hasil audit lebih relevan.
                </p>
                <Link
                  href="/onboarding"
                  className="mt-2 inline-flex items-center gap-1.5 text-body-md font-medium text-[var(--jernih-tertiary)] underline-offset-2 hover:underline"
                >
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                  Isi profesi sekarang
                </Link>
              </div>
            </div>
          )}

          {/* Kartu info profil */}
          <KartuInfoProfil profil={state.data} />

          {/* Form edit nama */}
          <FormEditProfil
            namaAwal={state.data.nama_lengkap}
            status={state.statusSimpanProfil}
            pesanError={state.pesanError}
            onSimpan={tanganiSimpanProfil}
          />

          {/* Form ubah kata sandi */}
          <FormUbahKataSandi
            status={state.statusSimpanKataSandi}
            pesanError={state.pesanErrorKataSandi}
            onSimpan={simpanKataSandi}
            onReset={resetStatusKataSandi}
          />

          {/* Preferensi notifikasi — F-PROF-03 */}
          <KartuPreferensiNotifikasi />

          {/* Seksi privasi — F-PRIV-01, F-PRIV-02, F-PRIV-03, F-PRIV-04 */}
          <SeksiPrivasi />
        </div>
      )}
    </div>
  );
}