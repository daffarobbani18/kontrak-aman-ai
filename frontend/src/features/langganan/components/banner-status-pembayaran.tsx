"use client";

// ============================================================
// BannerStatusPembayaran — banner setelah redirect dari Mayar
// Tampil berdasarkan query param ?status= di URL /langganan
// status=berhasil | dibatalkan | gagal
// DESIGN.md: success=hijau, warning=kuning, error=merah
// ============================================================

import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import { useCallback, useState } from "react";
import type { StatusPembayaranMayar } from "../types";

interface PropBannerStatusPembayaran {
  status: StatusPembayaranMayar;
  isMock?: boolean; // true saat mode development mock
}

const KONFIGURASI: Record<
  StatusPembayaranMayar,
  {
    ikon: React.ElementType;
    judul: string;
    deskripsi: string;
    kelasWarna: string;
    kelasIkon: string;
  }
> = {
  berhasil: {
    ikon: CheckCircle,
    judul: "Pembayaran berhasil!",
    deskripsi:
      "Langgananmu sudah aktif. Selamat menikmati akses penuh KontrakAman AI.",
    kelasWarna:
      "border-[var(--jernih-success)]/30 bg-[color-mix(in_srgb,var(--jernih-success)_8%,transparent)]",
    kelasIkon: "text-[var(--jernih-success)]",
  },
  dibatalkan: {
    ikon: AlertCircle,
    judul: "Pembayaran dibatalkan",
    deskripsi:
      "Kamu membatalkan proses pembayaran. Langgananmu belum berubah.",
    kelasWarna:
      "border-[var(--jernih-warning)]/30 bg-[color-mix(in_srgb,var(--jernih-warning)_8%,transparent)]",
    kelasIkon: "text-[var(--jernih-warning)]",
  },
  gagal: {
    ikon: XCircle,
    judul: "Pembayaran gagal",
    deskripsi:
      "Terjadi masalah saat memproses pembayaranmu. Silakan coba lagi atau hubungi dukungan.",
    kelasWarna:
      "border-[var(--jernih-error)]/30 bg-[color-mix(in_srgb,var(--jernih-error)_8%,transparent)]",
    kelasIkon: "text-[var(--jernih-error)]",
  },
};

export function BannerStatusPembayaran({
  status,
  isMock = false,
}: PropBannerStatusPembayaran) {
  const [tertutup, setTertutup] = useState(false);
  const config = KONFIGURASI[status];
  const Ikon = config.ikon;

  const tutup = useCallback(() => setTertutup(true), []);

  if (tertutup) return null;

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3 rounded-[var(--jernih-radius-md)]
        border px-4 py-3 ${config.kelasWarna}`}
    >
      <Ikon
        className={`mt-0.5 h-5 w-5 shrink-0 ${config.kelasIkon}`}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
          {config.judul}
        </p>
        <p className="mt-0.5 text-body-md text-[var(--jernih-neutral)]">
          {config.deskripsi}
        </p>
        {/* Pesan khusus mode mock/development */}
        {isMock && status === "berhasil" && (
          <p className="mt-1 text-label-sm text-[var(--jernih-neutral)] italic">
            Mode development: pembayaran disimulasikan, bukan transaksi nyata.
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={tutup}
        className="shrink-0 rounded-[var(--jernih-radius-sm)] p-1
          text-[var(--jernih-neutral)]
          hover:text-[var(--jernih-on-surface)]
          transition-colors duration-150
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-[var(--jernih-primary)]/50"
        aria-label="Tutup notifikasi"
      >
        <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}