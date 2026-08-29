// ============================================================
// PemilihKategori — radio group pilihan kategori kontrak
// Selaras field `kategori` di POST /dokumen-kontrak (api.md 6.1)
// ============================================================

"use client";

import { KATEGORI_KONTRAK, type NilaiKategori } from "../types";

interface PropsPemilihKategori {
  nilai: NilaiKategori | undefined;
  onChange: (nilai: NilaiKategori) => void;
  disabled?: boolean;
}

export function PemilihKategori({
  nilai,
  onChange,
  disabled = false,
}: PropsPemilihKategori) {
  return (
    <fieldset>
      <legend className="mb-3 text-body-md font-medium text-[var(--jernih-on-surface)]">
        Jenis pekerjaan{" "}
        <span className="text-label-sm font-normal text-[var(--jernih-neutral)]">
          (opsional)
        </span>
      </legend>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {KATEGORI_KONTRAK.map((kategori) => {
          const terpilih = nilai === kategori.nilai;
          return (
            <label
              key={kategori.nilai}
              className={`flex cursor-pointer items-center justify-center rounded-[var(--jernih-radius-md)] border px-3 py-2.5 text-body-md transition-all duration-150 ${
                disabled ? "cursor-not-allowed opacity-50" : ""
              } ${
                terpilih
                  ? "border-[var(--jernih-on-surface)] bg-[var(--jernih-on-surface)] text-[var(--jernih-surface)]"
                  : "border-[var(--jernih-neutral)]/30 text-[var(--jernih-on-surface)] hover:border-[var(--jernih-on-surface)]/60 hover:bg-[var(--jernih-on-surface)]/5"
              }`}
            >
              <input
                type="radio"
                name="kategori-kontrak"
                value={kategori.nilai}
                checked={terpilih}
                onChange={() => !disabled && onChange(kategori.nilai)}
                disabled={disabled}
                className="sr-only"
                aria-label={`Kategori ${kategori.label}`}
              />
              <span>{kategori.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}