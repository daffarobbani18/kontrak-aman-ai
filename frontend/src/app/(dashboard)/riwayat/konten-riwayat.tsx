// ============================================================
// KontenRiwayat — Client Component utama halaman /riwayat
// Merakit: FilterRiwayat + daftar BarisKontrak + paginasi
// Sesuai F-DOC-03 PRD, api.md 6.2
// ============================================================

"use client";

import { useEffect } from "react";
import { useRiwayatKontrak } from "@/features/dokumen-kontrak/hooks/use-riwayat-kontrak";
import { FilterRiwayat } from "@/features/dokumen-kontrak/components/filter-riwayat";
import { SkeletonRiwayat } from "@/features/dokumen-kontrak/components/skeleton-riwayat";
import BarisKontrak from "@/features/dashboard/components/baris-kontrak";
import EmptyStateKontrak from "@/features/dashboard/components/empty-state-kontrak";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function KontenRiwayat() {
  const { state, muat, muatLebih, gantiFilter, muatUlang, hapusDokumenDariList } = useRiwayatKontrak();

  // Muat data pertama kali
  useEffect(() => {
    muat("semua");
  }, [muat]);

  const sedangMemuat =
    state.status === "idle" || state.status === "memuat";
  const sedangMuatLebih = state.status === "memuat-lebih";
  const adaLebih = state.paginasi?.ada_lagi === true;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-headline-lg text-[var(--jernih-on-surface)]"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Riwayat Kontrak
        </h1>
        <p className="mt-1 text-body-md text-[var(--jernih-neutral)]">
          Semua kontrak yang pernah kamu audit tersimpan di sini.
        </p>
      </div>

      {/* ── State: memuat pertama kali ── */}
      {sedangMemuat ? (
        <>
          {/* Skeleton filter */}
          <div className="mb-4 flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-20 animate-pulse rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10"
              />
            ))}
          </div>
          <SkeletonRiwayat />
        </>
      ) : null}

      {/* ── State: gagal ── */}
      {state.status === "gagal" ? (
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
              Gagal Memuat Riwayat
            </p>
            <p className="mt-1 text-body-md text-[var(--jernih-neutral)]">
              {state.pesanError ?? "Terjadi kesalahan saat memuat data."}
            </p>
          </div>
          <button
            type="button"
            onClick={muatUlang}
            className="btn-brutal inline-flex items-center gap-2 px-5 py-2.5 text-body-md font-medium"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Coba Lagi
          </button>
        </div>
      ) : null}

      {/* ── State: selesai ── */}
      {(state.status === "selesai" || state.status === "memuat-lebih") ? (
        <>
          {/* Filter status */}
          <div className="mb-4">
            <FilterRiwayat
              filterAktif={state.filterAktif}
              jumlah={state.jumlahPerFilter}
              onChange={gantiFilter}
              disabled={sedangMuatLebih}
            />
          </div>

          {/* Jumlah total */}
          {state.paginasi && (
            <p className="mb-3 text-label-sm text-[var(--jernih-neutral)]">
              {state.paginasi.total} kontrak ditemukan
            </p>
          )}

          {/* Daftar kontrak atau empty state */}
          {state.dokumen.length === 0 ? (
            <EmptyStateKontrak />
          ) : (
            <div className="flex flex-col gap-2">
              {state.dokumen.map((dok) => (
                <BarisKontrak
                  key={dok.id}
                  dokumen={dok}
                  onDihapus={hapusDokumenDariList}
                />
              ))}
            </div>
          )}

          {/* Tombol muat lebih banyak — paginasi cursor api.md 6.2 */}
          {adaLebih && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={muatLebih}
                disabled={sedangMuatLebih}
                className="btn-brutal inline-flex items-center gap-2 px-6 py-2.5 text-body-md font-medium disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                aria-busy={sedangMuatLebih}
              >
                {sedangMuatLebih ? "Memuat..." : "Muat Lebih Banyak"}
              </button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}