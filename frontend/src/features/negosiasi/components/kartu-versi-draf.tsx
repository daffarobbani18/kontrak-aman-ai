"use client";

// ============================================================
// KartuVersiDraf — satu versi draf negosiasi, bisa dipilih + edit
// Sesuai F-NEGO-02 PRD (edit manual draf)
// DESIGN.md: kartu flat, border aktif pakai primary, btn-brutal
// ============================================================

import { useCallback } from "react";
import { TombolSalinTeks } from "./tombol-salin-teks";
import { TombolEksporDraf } from "./tombol-ekspor-draf";
import type { VersiDraf } from "../types";

interface PropKartuVersiDraf {
  versi: VersiDraf;
  indeks: number;
  terpilih: boolean;
  teksEditan: string; // teks yang sudah diedit (dari state parent)
  // judulKlausul dan teksAsliKlausul diteruskan untuk ekspor PDF/Word (F-NEGO-03)
  judulKlausul: string;
  teksAsliKlausul: string;
  onPilih: (indeks: number) => void;
  onEdit: (indeks: number, teks: string) => void;
}

export function KartuVersiDraf({
  versi,
  indeks,
  terpilih,
  teksEditan,
  judulKlausul,
  teksAsliKlausul,
  onPilih,
  onEdit,
}: PropKartuVersiDraf) {
  const tanganiEdit = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onEdit(indeks, e.target.value);
    },
    [indeks, onEdit]
  );

  return (
    <div
      className={`rounded-[var(--jernih-radius-md)] border-2 bg-[var(--jernih-surface)] transition-colors duration-150 ${
        terpilih
          ? "border-[var(--jernih-primary)]"
          : "border-[var(--jernih-neutral)]/20 hover:border-[var(--jernih-neutral)]/40"
      }`}
    >
      {/* Header — tombol pilih versi */}
      <button
        type="button"
        onClick={() => onPilih(indeks)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-pressed={terpilih}
        aria-label={`Pilih ${versi.label}`}
      >
        <span
          className={`text-body-md font-medium ${
            terpilih
              ? "text-[var(--jernih-primary)]"
              : "text-[var(--jernih-on-surface)]"
          }`}
        >
          {versi.label}
        </span>
        {/* Indikator terpilih */}
        <span
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
            terpilih
              ? "border-[var(--jernih-primary)] bg-[var(--jernih-primary)]"
              : "border-[var(--jernih-neutral)]/40"
          }`}
          aria-hidden="true"
        >
          {terpilih && (
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--jernih-surface)]" />
          )}
        </span>
      </button>

      {/* Konten — hanya tampil saat terpilih */}
      {terpilih && (
        <div className="border-t border-[var(--jernih-neutral)]/10 px-4 pb-4 pt-3 space-y-3">
          {/* Textarea edit manual — F-NEGO-02 */}
          <div>
            <label
              htmlFor={`draf-versi-${indeks}`}
              className="mb-1.5 block text-label-sm font-medium text-[var(--jernih-neutral)] uppercase tracking-wide"
            >
              Teks Draf (bisa diedit)
            </label>
            <textarea
              id={`draf-versi-${indeks}`}
              value={teksEditan}
              onChange={tanganiEdit}
              rows={6}
              className="w-full rounded-[var(--jernih-radius-sm)] border border-[var(--jernih-neutral)]/30 bg-[var(--jernih-surface)] px-3 py-2.5 text-body-md text-[var(--jernih-on-surface)] leading-relaxed resize-none focus:border-[var(--jernih-primary)] focus:outline-none focus:ring-0"
              aria-label={`Edit teks draf versi ${versi.label}`}
            />
          </div>

          {/* Tombol aksi ekspor — F-NEGO-03 */}
          {/* Salin teks selalu tersedia sebagai fallback (PRD Alur Kritikal 2 langkah 7a) */}
          <div className="flex flex-wrap items-center gap-2">
            <TombolSalinTeks
              teks={teksEditan}
              label="Salin Teks"
            />
            <TombolEksporDraf
              judulKlausul={judulKlausul}
              labelVersi={versi.label}
              teksAsliKlausul={teksAsliKlausul}
              teksDraf={teksEditan}
            />
          </div>
        </div>
      )}
    </div>
  );
}