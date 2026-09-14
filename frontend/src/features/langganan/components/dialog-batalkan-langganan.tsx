"use client";

// ============================================================
// DialogBatalkanLangganan — konfirmasi batalkan langganan
// Sesuai PRD F-BILL-04: konfirmasi ganda, tampil aktif_hingga
// Memakai @base-ui/react Dialog — konsisten dengan dialog-hapus-dokumen
// DESIGN.md: warna warning untuk aksi destruktif reversibel
// (berbeda dengan hapus dokumen yang pakai error — batalkan masih bisa
// dilanjutkan pakai sampai aktif_hingga, tidak langsung hilang)
// ============================================================

import { Dialog } from "@base-ui/react/dialog";
import { AlertTriangle, X } from "lucide-react";
import type { StateBatalkanLangganan } from "../types";

interface PropDialogBatalkanLangganan {
  state: StateBatalkanLangganan;
  terbuka: boolean;
  aktifHingga: string | null; // dari data langganan aktif
  onBatalkan: () => void;
  onKonfirmasi: () => void;
  onResetError: () => void;
}

function formatTanggal(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function DialogBatalkanLangganan({
  state,
  terbuka,
  aktifHingga,
  onBatalkan,
  onKonfirmasi,
  onResetError,
}: PropDialogBatalkanLangganan) {
  const sedangMembatalkan = state.status === "membatalkan";
  const adaError = state.status === "gagal" && state.pesanError;

  return (
    <Dialog.Root
      open={terbuka}
      onOpenChange={(buka) => {
        if (!buka && !sedangMembatalkan) onBatalkan();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop
          className="fixed inset-0 z-40 bg-[var(--jernih-on-surface)]/40
            data-[starting-style]:opacity-0
            data-[ending-style]:opacity-0
            transition-opacity duration-200"
        />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Popup
            className="w-full max-w-md rounded-[var(--jernih-radius-lg)]
              border border-[var(--jernih-neutral)]/20
              bg-[var(--jernih-surface)]
              p-6 shadow-lg
              data-[starting-style]:opacity-0 data-[starting-style]:scale-95
              data-[ending-style]:opacity-0 data-[ending-style]:scale-95
              transition-all duration-200"
            aria-describedby="dialog-batalkan-deskripsi"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center
                    rounded-[var(--jernih-radius-md)]
                    bg-[color-mix(in_srgb,var(--jernih-warning)_10%,transparent)]"
                >
                  <AlertTriangle
                    className="h-5 w-5 text-[var(--jernih-warning)]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </div>
                <Dialog.Title className="text-headline-md text-[var(--jernih-on-surface)]">
                  Batalkan Langganan?
                </Dialog.Title>
              </div>
              {!sedangMembatalkan && (
                <button
                  type="button"
                  onClick={onBatalkan}
                  className="rounded-[var(--jernih-radius-sm)] p-1
                    text-[var(--jernih-neutral)]
                    hover:text-[var(--jernih-on-surface)]
                    transition-colors duration-150
                    focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-[var(--jernih-primary)]/50"
                  aria-label="Tutup dialog"
                >
                  <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Deskripsi */}
            <div id="dialog-batalkan-deskripsi" className="mt-4 space-y-2">
              <p className="text-body-md text-[var(--jernih-on-surface)]">
                Langgananmu akan dibatalkan, tetapi kamu masih bisa menggunakan
                semua fitur Pro hingga akhir periode yang sudah dibayar.
              </p>
              {aktifHingga && (
                <p className="text-body-md text-[var(--jernih-neutral)]">
                  Akses Pro aktif hingga{" "}
                  <span className="font-medium text-[var(--jernih-on-surface)]">
                    {formatTanggal(aktifHingga)}
                  </span>
                  .
                </p>
              )}
              <p className="text-body-md text-[var(--jernih-neutral)]">
                Setelah itu, akunmu otomatis kembali ke paket Gratis.
              </p>
            </div>

            {/* Pesan error */}
            {adaError && (
              <div
                role="alert"
                className="mt-4 rounded-[var(--jernih-radius-md)]
                  border border-[var(--jernih-error)]/20
                  bg-[color-mix(in_srgb,var(--jernih-error)_8%,transparent)]
                  px-4 py-3"
              >
                <p className="text-body-md text-[var(--jernih-error)]">
                  {state.pesanError}
                </p>
                <button
                  type="button"
                  onClick={onResetError}
                  className="mt-1 text-label-sm text-[var(--jernih-error)]
                    underline underline-offset-2 hover:no-underline"
                >
                  Coba lagi
                </button>
              </div>
            )}

            {/* Tombol aksi */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onBatalkan}
                disabled={sedangMembatalkan}
                className="inline-flex items-center justify-center gap-2
                  rounded-[var(--jernih-radius-md)]
                  border border-[var(--jernih-neutral)]/30
                  bg-transparent px-5 py-2.5
                  text-body-md font-medium text-[var(--jernih-on-surface)]
                  transition-colors duration-150
                  hover:bg-[var(--jernih-neutral)]/8
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-[var(--jernih-primary)]/50
                  disabled:cursor-not-allowed disabled:opacity-50"
              >
                Tidak, Tetap Berlangganan
              </button>
              <button
                type="button"
                onClick={onKonfirmasi}
                disabled={sedangMembatalkan}
                className="inline-flex items-center justify-center gap-2
                  rounded-[var(--jernih-radius-md)]
                  border-2 border-[var(--jernih-warning)]
                  bg-[var(--jernih-warning)]
                  px-5 py-2.5
                  text-body-md font-medium text-[var(--jernih-surface)]
                  transition-all duration-150
                  hover:bg-[color-mix(in_srgb,var(--jernih-warning)_85%,black)]
                  hover:border-[color-mix(in_srgb,var(--jernih-warning)_85%,black)]
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-[var(--jernih-warning)]/50
                  disabled:cursor-not-allowed disabled:opacity-60"
                aria-busy={sedangMembatalkan}
              >
                {sedangMembatalkan ? "Membatalkan..." : "Ya, Batalkan Langganan"}
              </button>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}