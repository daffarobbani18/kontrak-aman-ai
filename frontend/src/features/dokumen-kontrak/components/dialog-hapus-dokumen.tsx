"use client";

// ============================================================
// DialogHapusDokumen — dialog konfirmasi hapus dokumen
// Sesuai PRD F-DOC-04: "sistem meminta konfirmasi karena tindakan
// ini tidak bisa dibatalkan"
// Memakai @base-ui/react Dialog
// Selaras DESIGN.md: minimalism, warna error EKSKLUSIF untuk risiko/destruktif
// ============================================================

import { Dialog } from "@base-ui/react/dialog";
import { AlertTriangle, Trash2, X } from "lucide-react";
import type { StateHapusDokumen } from "../hooks/use-hapus-dokumen";

interface PropDialogHapusDokumen {
  state: StateHapusDokumen;
  terbuka: boolean;
  onBatalkan: () => void;
  onKonfirmasi: () => void;
  onResetError: () => void;
}

export function DialogHapusDokumen({
  state,
  terbuka,
  onBatalkan,
  onKonfirmasi,
  onResetError,
}: PropDialogHapusDokumen) {
  const sedangMenghapus = state.status === "menghapus";
  const adaError = state.status === "gagal" && state.pesanError;

  return (
    <Dialog.Root
      open={terbuka}
      onOpenChange={(buka) => {
        // Cegah tutup dialog saat sedang menghapus
        if (!buka && !sedangMenghapus) {
          onBatalkan();
        }
      }}
    >
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Backdrop
          className="fixed inset-0 z-40 bg-[var(--jernih-on-surface)]/40
            data-[starting-style]:opacity-0
            data-[ending-style]:opacity-0
            transition-opacity duration-200"
        />

        {/* Viewport — centering container */}
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Popup */}
          <Dialog.Popup
            className="w-full max-w-md rounded-[var(--jernih-radius-lg)]
              border border-[var(--jernih-neutral)]/20
              bg-[var(--jernih-surface)]
              p-6 shadow-lg
              data-[starting-style]:opacity-0 data-[starting-style]:scale-95
              data-[ending-style]:opacity-0 data-[ending-style]:scale-95
              transition-all duration-200"
            aria-describedby="dialog-hapus-deskripsi"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Ikon peringatan */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center
                    rounded-[var(--jernih-radius-md)]
                    bg-[color-mix(in_srgb,var(--jernih-error)_10%,transparent)]"
                >
                  <AlertTriangle
                    className="h-5 w-5 text-[var(--jernih-error)]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </div>

                <Dialog.Title
                  className="text-headline-md text-[var(--jernih-on-surface)]"
                >
                  Hapus Dokumen?
                </Dialog.Title>
              </div>

              {/* Tombol tutup — hanya tampil saat tidak sedang menghapus */}
              {!sedangMenghapus && (
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
            <div id="dialog-hapus-deskripsi" className="mt-4 space-y-2">
              <p className="text-body-md text-[var(--jernih-on-surface)]">
                Dokumen{" "}
                <span className="font-medium">
                  &ldquo;{state.namaDokumenTarget ?? "ini"}&rdquo;
                </span>{" "}
                akan dihapus permanen beserta seluruh hasil audit dan draf
                negosiasi terkait.
              </p>
              <p className="text-body-md text-[var(--jernih-neutral)]">
                Tindakan ini tidak bisa dibatalkan.
              </p>
            </div>

            {/* Pesan error jika hapus gagal */}
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
                    underline underline-offset-2
                    hover:no-underline transition-all duration-150"
                >
                  Coba lagi
                </button>
              </div>
            )}

            {/* Tombol aksi */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {/* Batalkan */}
              <button
                type="button"
                onClick={onBatalkan}
                disabled={sedangMenghapus}
                className="inline-flex items-center justify-center gap-2
                  rounded-[var(--jernih-radius-md)]
                  border border-[var(--jernih-neutral)]/30
                  bg-transparent
                  px-5 py-2.5
                  text-body-md font-medium text-[var(--jernih-on-surface)]
                  transition-colors duration-150
                  hover:bg-[var(--jernih-neutral)]/8
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-[var(--jernih-primary)]/50
                  disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batalkan
              </button>

              {/* Hapus Permanen — tombol destruktif, bukan btn-brutal */}
              <button
                type="button"
                onClick={onKonfirmasi}
                disabled={sedangMenghapus}
                className="inline-flex items-center justify-center gap-2
                  rounded-[var(--jernih-radius-md)]
                  border-2 border-[var(--jernih-error)]
                  bg-[var(--jernih-error)]
                  px-5 py-2.5
                  text-body-md font-medium text-[var(--jernih-surface)]
                  transition-all duration-150
                  hover:bg-[color-mix(in_srgb,var(--jernih-error)_85%,black)]
                  hover:border-[color-mix(in_srgb,var(--jernih-error)_85%,black)]
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-[var(--jernih-error)]/50
                  disabled:cursor-not-allowed disabled:opacity-60"
                aria-busy={sedangMenghapus}
              >
                <Trash2
                  className="h-4 w-4"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                {sedangMenghapus ? "Menghapus..." : "Hapus Permanen"}
              </button>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}