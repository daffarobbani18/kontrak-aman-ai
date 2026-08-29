"use client";

// ============================================================
// KartuLanggananAktif — info langganan berjalan + tombol batalkan
// Data dari GET /langganan/aktif (api.md 9.3)
// DESIGN.md: kartu flat, warna semantik sesuai status
// ============================================================

import { Calendar, RefreshCw, XCircle, AlertCircle, RotateCcw } from "lucide-react";
import type { StateLanggananAktif } from "../types";

interface PropKartuLanggananAktif {
  state: StateLanggananAktif;
  onBatalkan: () => void;
  onMuatUlang: () => void;
}

function formatTanggal(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function labelTier(tier: string): string {
  const label: Record<string, string> = {
    gratis: "Gratis",
    pro: "Pro",
    bisnis: "Bisnis",
  };
  return label[tier] ?? tier;
}

function SkeletonKartuLangganan() {
  return (
    <div className="rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-6">
      <div className="mb-4 space-y-2">
        <div className="h-3 w-24 animate-pulse rounded bg-[var(--jernih-neutral)]/15" />
        <div className="h-6 w-16 animate-pulse rounded bg-[var(--jernih-neutral)]/15" />
      </div>
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-4 w-full animate-pulse rounded bg-[var(--jernih-neutral)]/15" />
        ))}
      </div>
    </div>
  );
}

export function KartuLanggananAktif({
  state,
  onBatalkan,
  onMuatUlang,
}: PropKartuLanggananAktif) {
  // State: memuat
  if (state.status === "idle" || state.status === "memuat") {
    return <SkeletonKartuLangganan />;
  }

  // State: gagal
  if (state.status === "gagal") {
    return (
      <div
        className="flex flex-col items-center gap-4 rounded-[var(--jernih-radius-lg)]
          border border-[var(--jernih-error)]/20
          bg-[var(--jernih-surface)] p-6 text-center"
        role="alert"
      >
        <AlertCircle
          className="h-8 w-8 text-[var(--jernih-error)]"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <div>
          <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
            Gagal Memuat Langganan
          </p>
          <p className="mt-1 text-body-md text-[var(--jernih-neutral)]">
            {state.pesanError}
          </p>
        </div>
        <button
          type="button"
          onClick={onMuatUlang}
          className="btn-brutal inline-flex items-center gap-2 px-4 py-2 text-body-md font-medium"
        >
          <RotateCcw className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          Coba Lagi
        </button>
      </div>
    );
  }

  // State: selesai — data null = tier gratis tanpa langganan berbayar
  const langganan = state.data;
  const tierAktif = langganan?.tier ?? "gratis";
  const sudahDibatalkan = langganan?.status === "dibatalkan";
  const bisaDibatalkan =
    langganan !== null && tierAktif !== "gratis" && !sudahDibatalkan;

  return (
    <div className="rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-label-sm text-[var(--jernih-neutral)]">Langganan Aktif</p>
          <p
            className="mt-1 text-headline-md text-[var(--jernih-on-surface)]"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Paket {labelTier(tierAktif)}
          </p>
        </div>

        {/* Badge status */}
        {sudahDibatalkan ? (
          <span className="shrink-0 rounded-[var(--jernih-radius-sm)] border border-[var(--jernih-warning)]/30 bg-[var(--jernih-warning)]/10 px-2 py-0.5 text-label-sm font-medium text-[var(--jernih-warning)]">
            Dibatalkan
          </span>
        ) : (
          <span className="shrink-0 rounded-[var(--jernih-radius-sm)] border border-[var(--jernih-success)]/30 bg-[var(--jernih-success)]/10 px-2 py-0.5 text-label-sm font-medium text-[var(--jernih-success)]">
            Aktif
          </span>
        )}
      </div>

      {/* Detail langganan berbayar */}
      {langganan && tierAktif !== "gratis" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar
              className="h-4 w-4 shrink-0 text-[var(--jernih-neutral)]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <p className="text-body-md text-[var(--jernih-on-surface)]">
              Aktif hingga{" "}
              <span className="font-medium">
                {formatTanggal(langganan.aktif_hingga)}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <RefreshCw
              className="h-4 w-4 shrink-0 text-[var(--jernih-neutral)]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <p className="text-body-md text-[var(--jernih-on-surface)]">
              {langganan.perbarui_otomatis
                ? "Perpanjang otomatis setiap bulan"
                : "Tidak perpanjang otomatis"}
            </p>
          </div>
        </div>
      )}

      {/* Tier gratis */}
      {!langganan || tierAktif === "gratis" ? (
        <p className="text-body-md text-[var(--jernih-neutral)]">
          Kamu menggunakan paket gratis. Upgrade untuk audit dan negosiasi tidak terbatas.
        </p>
      ) : null}

      {/* Tombol batalkan — hanya untuk langganan berbayar yang belum dibatalkan */}
      {bisaDibatalkan && (
        <div className="mt-5 border-t border-[var(--jernih-neutral)]/10 pt-5">
          <button
            type="button"
            onClick={onBatalkan}
            className="inline-flex items-center gap-2
              rounded-[var(--jernih-radius-md)]
              border border-[var(--jernih-warning)]/40
              bg-[color-mix(in_srgb,var(--jernih-warning)_8%,transparent)]
              px-4 py-2
              text-body-md font-medium text-[var(--jernih-warning)]
              transition-colors duration-150
              hover:border-[var(--jernih-warning)]/70
              hover:bg-[color-mix(in_srgb,var(--jernih-warning)_14%,transparent)]
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-[var(--jernih-warning)]/50"
          >
            <XCircle className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            Batalkan Langganan
          </button>
        </div>
      )}

      {/* Info setelah dibatalkan */}
      {sudahDibatalkan && langganan && (
        <div className="mt-4 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-warning)]/20 bg-[var(--jernih-warning)]/5 px-4 py-3">
          <p className="text-body-md text-[var(--jernih-on-surface)]">
            Langgananmu dibatalkan. Akses Pro tetap aktif hingga{" "}
            <span className="font-medium">
              {formatTanggal(langganan.aktif_hingga)}
            </span>
            .
          </p>
        </div>
      )}
    </div>
  );
}