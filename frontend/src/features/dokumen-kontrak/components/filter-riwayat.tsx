// ============================================================
// FilterRiwayat — filter chip status dokumen kontrak
// Sesuai query parameter status api.md 6.2
// DESIGN.md: chip/tab dengan warna semantik, accessible
// ============================================================

"use client";

import type { FilterStatus } from "../hooks/use-riwayat-kontrak";

interface PropFilterRiwayat {
  filterAktif: FilterStatus;
  jumlah: Record<FilterStatus, number>;
  onChange: (filter: FilterStatus) => void;
  disabled?: boolean;
}

const PILIHAN_FILTER: { nilai: FilterStatus; label: string }[] = [
  { nilai: "semua", label: "Semua" },
  { nilai: "selesai", label: "Selesai" },
  { nilai: "memproses", label: "Menganalisis" },
  { nilai: "menunggu", label: "Menunggu" },
  { nilai: "gagal", label: "Gagal" },
];

// Token warna per filter — sesuai DESIGN.md warna semantik
const KELAS_AKTIF: Record<FilterStatus, string> = {
  semua:
    "border-[var(--jernih-on-surface)] bg-[var(--jernih-on-surface)] text-[var(--jernih-surface)]",
  selesai:
    "border-[var(--jernih-success)] bg-[var(--jernih-success)]/10 text-[var(--jernih-success)]",
  memproses:
    "border-[var(--jernih-primary)] bg-[var(--jernih-primary)]/10 text-[var(--jernih-primary)]",
  menunggu:
    "border-[var(--jernih-neutral)] bg-[var(--jernih-neutral)]/10 text-[var(--jernih-neutral)]",
  gagal:
    "border-[var(--jernih-error)] bg-[var(--jernih-error)]/10 text-[var(--jernih-error)]",
};

export function FilterRiwayat({
  filterAktif,
  jumlah,
  onChange,
  disabled = false,
}: PropFilterRiwayat) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Filter riwayat berdasarkan status kontrak"
    >
      {PILIHAN_FILTER.map((pilihan) => {
        const aktif = filterAktif === pilihan.nilai;
        const jumlahItem = jumlah[pilihan.nilai] ?? 0;

        // Sembunyikan filter yang tidak relevan kecuali "semua"
        if (pilihan.nilai !== "semua" && jumlahItem === 0) return null;

        return (
          <button
            key={pilihan.nilai}
            type="button"
            onClick={() => onChange(pilihan.nilai)}
            disabled={disabled}
            aria-pressed={aktif}
            className={`rounded-[var(--jernih-radius-sm)] border px-3 py-1.5 text-label-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
              aktif
                ? KELAS_AKTIF[pilihan.nilai]
                : "border-[var(--jernih-neutral)]/30 bg-[var(--jernih-surface)] text-[var(--jernih-neutral)] hover:border-[var(--jernih-neutral)]/60"
            }`}
          >
            {pilihan.label}
            <span
              className="ml-1.5 opacity-70"
              aria-label={`${jumlahItem} kontrak`}
            >
              ({jumlahItem})
            </span>
          </button>
        );
      })}
    </div>
  );
}