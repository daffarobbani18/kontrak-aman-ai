"use client";

// ============================================================
// KartuPaket — satu kartu paket harga langganan
// Data dari GET /langganan/paket (api.md 9.1)
// DESIGN.md: kartu flat, btn-brutal untuk CTA, primary ring untuk tier aktif
// Tombol upgrade → useBuatSesiPembayaran → redirect ke Mayar
// ============================================================

import { Check, Loader2 } from "lucide-react";
import type { PaketHarga, IdPaket } from "../types";

interface PropKartuPaket {
  paket: PaketHarga;
  tierAktif: string;
  sedangMemproses: boolean;
  paketIdDiproses: IdPaket | null;
  onPilih: (paketId: IdPaket) => void;
}

function formatHarga(harga: number, matauang: string): string {
  if (harga === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: matauang,
    minimumFractionDigits: 0,
  }).format(harga);
}

function labelKuota(nilai: number | null): string {
  if (nilai === null) return "Dikonfigurasi sistem";
  if (nilai === -1) return "Tidak terbatas";
  return `${nilai} per bulan`;
}

// Urutan tier — untuk menentukan apakah tombol aktif
const URUTAN_TIER: Record<string, number> = {
  gratis: 0,
  pro: 1,
  bisnis: 2,
};

export function KartuPaket({
  paket,
  tierAktif,
  sedangMemproses,
  paketIdDiproses,
  onPilih,
}: PropKartuPaket) {
  const tierPaket = paket.id.replace("pkg_", ""); // pkg_pro → pro
  const adalahTierAktif = tierAktif === tierPaket;
  const adalahTierLebihRendah =
    (URUTAN_TIER[tierPaket] ?? 0) < (URUTAN_TIER[tierAktif] ?? 0);
  const tombolDisable =
    adalahTierAktif || adalahTierLebihRendah || sedangMemproses;
  const sedangDiprosesPaketIni = paketIdDiproses === paket.id;
  const adalahPopuler = paket.id === "pkg_pro";

  return (
    <div
      className={[
        "flex flex-col rounded-[var(--jernih-radius-lg)]",
        "border bg-[var(--jernih-surface)] p-6",
        "transition-shadow duration-150",
        adalahTierAktif
          ? "border-[var(--jernih-primary)] ring-2 ring-[var(--jernih-primary)] ring-offset-2 ring-offset-[var(--jernih-surface)]"
          : "border-[var(--jernih-neutral)]/20",
      ].join(" ")}
    >
      {/* Badge — selalu ada div setinggi badge supaya semua kartu sejajar.
          Kartu tanpa badge tetap punya ruang kosong yang sama tingginya. */}
      <div className="mb-4 flex h-6 items-center justify-center">
        {adalahTierAktif ? (
          <span className="rounded-full border border-[var(--jernih-success)]/30 bg-[var(--jernih-success)]/10 px-3 py-0.5 text-label-sm font-medium text-[var(--jernih-success)]">
            Paket Aktif
          </span>
        ) : adalahPopuler ? (
          <span className="rounded-full border border-[var(--jernih-primary)]/30 bg-[var(--jernih-primary)]/10 px-3 py-0.5 text-label-sm font-medium text-[var(--jernih-primary)]">
            Paling Populer
          </span>
        ) : null}
      </div>

      {/* Nama dan harga */}
      <div className="mb-5">
        <p className="text-label-sm font-medium uppercase tracking-widest text-[var(--jernih-neutral)]">
          {paket.nama}
        </p>
        <div className="mt-1 flex items-baseline gap-1">
          <span
            className="text-headline-lg text-[var(--jernih-on-surface)]"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            {formatHarga(paket.harga_bulanan, paket.mata_uang)}
          </span>
          {paket.harga_bulanan > 0 && (
            <span className="text-body-md text-[var(--jernih-neutral)]">/bln</span>
          )}
        </div>
      </div>

      {/* Fitur */}
      <ul className="mb-6 flex flex-col gap-2.5" aria-label={`Fitur paket ${paket.nama}`}>
        <li className="flex items-start gap-2">
          <Check
            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--jernih-success)]"
            strokeWidth={2}
            aria-hidden="true"
          />
          <span className="text-body-md text-[var(--jernih-on-surface)]">
            <span className="font-medium">Audit kontrak: </span>
            {labelKuota(paket.fitur.audit_per_bulan)}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Check
            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--jernih-success)]"
            strokeWidth={2}
            aria-hidden="true"
          />
          <span className="text-body-md text-[var(--jernih-on-surface)]">
            <span className="font-medium">Draf negosiasi: </span>
            {labelKuota(paket.fitur.negosiasi_per_bulan)}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Check
            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--jernih-success)]"
            strokeWidth={2}
            aria-hidden="true"
          />
          <span className="text-body-md text-[var(--jernih-on-surface)]">
            {paket.fitur.keterangan_kuota}
          </span>
        </li>
      </ul>

      {/* Tombol aksi */}
      <div className="mt-auto">
        {adalahTierAktif ? (
          <div
            className="flex items-center justify-center gap-2 rounded-[var(--jernih-radius-md)]
              border border-[var(--jernih-success)]/30
              bg-[var(--jernih-success)]/5
              px-4 py-2.5"
          >
            <Check className="h-4 w-4 text-[var(--jernih-success)]" strokeWidth={2} aria-hidden="true" />
            <span className="text-body-md font-medium text-[var(--jernih-success)]">
              Paket ini aktif
            </span>
          </div>
        ) : adalahTierLebihRendah ? (
          <div
            className="flex items-center justify-center rounded-[var(--jernih-radius-md)]
              border border-[var(--jernih-neutral)]/20
              bg-transparent px-4 py-2.5"
          >
            <span className="text-body-md text-[var(--jernih-neutral)]">
              Paket lebih rendah
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onPilih(paket.id)}
            disabled={tombolDisable}
            className="btn-brutal w-full inline-flex items-center justify-center gap-2
              px-4 py-2.5 text-body-md font-medium
              disabled:cursor-not-allowed disabled:opacity-50
              disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
            aria-busy={sedangDiprosesPaketIni}
          >
            {sedangDiprosesPaketIni ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} aria-hidden="true" />
                Memproses...
              </>
            ) : (
              `Pilih ${paket.nama}`
            )}
          </button>
        )}
      </div>
    </div>
  );
}