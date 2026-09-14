// ============================================================
// DaftarKlausul — list semua klausul dengan filter per tingkat risiko
// Sesuai F-AUDIT-05 PRD (kategorisasi jenis risiko)
// ============================================================

"use client";

import { useState } from "react";
import { ItemKlausul } from "./item-klausul";
import type { DataKlausul, FilterKlausul, TingkatRisiko } from "../types";

interface PropDaftarKlausul {
  klausul: DataKlausul[];
  // Props opsional untuk sinkronisasi dengan PratinjauDokumen
  // Jika tidak disediakan, DaftarKlausul berjalan standalone seperti sebelumnya
  klausulAktifId?: string | null;
  onKlausulDipilih?: (klausulId: string, nomorUrut: number) => void;
}

const PILIHAN_FILTER: { nilai: FilterKlausul; label: string }[] = [
  { nilai: "semua", label: "Semua" },
  { nilai: "merah", label: "Risiko Tinggi" },
  { nilai: "kuning", label: "Perlu Diperhatikan" },
  { nilai: "hijau", label: "Aman" },
];

const KELAS_FILTER_AKTIF: Record<FilterKlausul, string> = {
  semua: "border-[var(--jernih-on-surface)] bg-[var(--jernih-on-surface)] text-[var(--jernih-surface)]",
  merah: "border-[var(--jernih-error)] bg-[var(--jernih-error)]/10 text-[var(--jernih-error)]",
  kuning: "border-[var(--jernih-warning)] bg-[var(--jernih-warning)]/10 text-[var(--jernih-warning)]",
  hijau: "border-[var(--jernih-success)] bg-[var(--jernih-success)]/10 text-[var(--jernih-success)]",
};

export function DaftarKlausul({
  klausul,
  klausulAktifId,
  onKlausulDipilih,
}: PropDaftarKlausul) {
  const [filter, setFilter] = useState<FilterKlausul>("semua");

  const klausulTampil =
    filter === "semua"
      ? klausul
      : klausul.filter((k) => k.tingkat_risiko === (filter as TingkatRisiko));

  const jumlahPerFilter: Record<FilterKlausul, number> = {
    semua: klausul.length,
    merah: klausul.filter((k) => k.tingkat_risiko === "merah").length,
    kuning: klausul.filter((k) => k.tingkat_risiko === "kuning").length,
    hijau: klausul.filter((k) => k.tingkat_risiko === "hijau").length,
  };

  return (
    <section aria-label="Daftar klausul kontrak">
      {/* Header section */}
      <div className="mb-6">
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h2
            className="text-headline-md text-[var(--jernih-on-surface)]"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Temuan Klausul
          </h2>
          <p className="shrink-0 text-label-sm text-[var(--jernih-neutral)]">
            {klausulTampil.length} dari {klausul.length} klausul
          </p>
        </div>

        {/* Filter tab */}
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter klausul berdasarkan tingkat risiko"
        >
          {PILIHAN_FILTER.map((pilihan) => {
            const aktif = filter === pilihan.nilai;
            const jumlah = jumlahPerFilter[pilihan.nilai];
            if (pilihan.nilai !== "semua" && jumlah === 0) return null;

            return (
              <button
                key={pilihan.nilai}
                type="button"
                onClick={() => setFilter(pilihan.nilai)}
                aria-pressed={aktif}
                className={[
                  "rounded-[var(--jernih-radius-sm)] border px-3 py-1.5",
                  "text-label-sm font-medium transition-colors duration-150",
                  aktif
                    ? KELAS_FILTER_AKTIF[pilihan.nilai]
                    : "border-[var(--jernih-neutral)]/30 bg-[var(--jernih-surface)] text-[var(--jernih-neutral)] hover:border-[var(--jernih-neutral)]/60",
                ].join(" ")}
              >
                {pilihan.label}
                <span
                  className="ml-1.5 tabular-nums opacity-60"
                  aria-label={`${jumlah} klausul`}
                >
                  {jumlah}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daftar item */}
      {klausulTampil.length === 0 ? (
        <p className="py-8 text-center text-body-md text-[var(--jernih-neutral)]">
          Tidak ada klausul untuk kategori ini.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {klausulTampil.map((k) => (
            <div
              key={k.id}
              // Ring highlight saat klausul ini sedang aktif di pratinjau
              className={[
                "rounded-[var(--jernih-radius-md)] transition-shadow duration-200",
                klausulAktifId === k.id
                  ? "ring-2 ring-[var(--jernih-primary)] ring-offset-2 ring-offset-[var(--jernih-surface)]"
                  : "",
              ].join(" ")}
            >
              <ItemKlausul
                klausul={k}
                defaultTerbuka={k.tingkat_risiko === "merah" || klausulAktifId === k.id}
                onDipilih={
                  onKlausulDipilih
                    ? () => onKlausulDipilih(k.id, k.nomor_urut)
                    : undefined
                }
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}