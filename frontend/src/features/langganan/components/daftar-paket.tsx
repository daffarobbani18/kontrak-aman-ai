"use client";

// ============================================================
// DaftarPaket — grid tiga kartu paket harga
// Data dari GET /langganan/paket (api.md 9.1)
// DESIGN.md: grid responsif, satu kolom mobile, tiga kolom desktop
// ============================================================

import { AlertCircle, RotateCcw } from "lucide-react";
import { KartuPaket } from "./kartu-paket";
import type { IdPaket } from "../types";
import type { StatePaketHarga, StateBuatSesiPembayaran } from "../types";

interface PropDaftarPaket {
  statePaket: StatePaketHarga;
  stateSesi: StateBuatSesiPembayaran;
  tierAktif: string;
  onPilihPaket: (paketId: IdPaket) => void;
  onMuatUlang: () => void;
}

function SkeletonKartuPaket() {
  return (
    <div className="rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-6">
      <div className="mb-5 space-y-2">
        <div className="h-3 w-16 animate-pulse rounded bg-[var(--jernih-neutral)]/15" />
        <div className="h-8 w-24 animate-pulse rounded bg-[var(--jernih-neutral)]/15" />
      </div>
      <div className="mb-6 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 w-full animate-pulse rounded bg-[var(--jernih-neutral)]/15" />
        ))}
      </div>
      <div className="h-10 w-full animate-pulse rounded-[var(--jernih-radius-md)] bg-[var(--jernih-neutral)]/15" />
    </div>
  );
}

export function DaftarPaket({
  statePaket,
  stateSesi,
  tierAktif,
  onPilihPaket,
  onMuatUlang,
}: PropDaftarPaket) {
  return (
    <section aria-label="Pilih paket langganan">
      <div className="mb-6">
        <h2
          className="text-headline-md text-[var(--jernih-on-surface)]"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Pilih Paket
        </h2>
        <p className="mt-1 text-body-md text-[var(--jernih-neutral)]">
          Upgrade kapan saja, batalkan kapan saja.
        </p>
      </div>

      {/* State: memuat */}
      {(statePaket.status === "idle" || statePaket.status === "memuat") && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <SkeletonKartuPaket key={i} />)}
        </div>
      )}

      {/* State: gagal */}
      {statePaket.status === "gagal" && (
        <div
          className="flex flex-col items-center gap-4 py-12 text-center"
          role="alert"
        >
          <AlertCircle
            className="h-8 w-8 text-[var(--jernih-error)]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <div>
            <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
              Gagal Memuat Paket
            </p>
            <p className="mt-1 text-body-md text-[var(--jernih-neutral)]">
              {statePaket.pesanError}
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
      )}

      {/* State: selesai */}
      {statePaket.status === "selesai" && (
        <>
          {/* Pesan error jika buat sesi gagal */}
          {stateSesi.status === "gagal" && stateSesi.pesanError && (
            <div
              role="alert"
              className="mb-4 flex items-center gap-2 rounded-[var(--jernih-radius-md)]
                border border-[var(--jernih-error)]/20
                bg-[color-mix(in_srgb,var(--jernih-error)_8%,transparent)]
                px-4 py-3"
            >
              <AlertCircle
                className="h-4 w-4 shrink-0 text-[var(--jernih-error)]"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <p className="text-body-md text-[var(--jernih-error)]">
                {stateSesi.pesanError}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {statePaket.paket.map((paket) => (
              <KartuPaket
                key={paket.id}
                paket={paket}
                tierAktif={tierAktif}
                sedangMemproses={stateSesi.status === "memproses"}
                paketIdDiproses={stateSesi.paketIdDiproses}
                onPilih={onPilihPaket}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}