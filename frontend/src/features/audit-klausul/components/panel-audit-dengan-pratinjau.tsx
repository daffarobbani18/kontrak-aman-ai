"use client";

// ============================================================
// PanelAuditDenganPratinjau — layout dua panel untuk F-AUDIT-04
// Kiri: pratinjau gambar dokumen (url_pratinjau dari api.md 6.3)
// Kanan: daftar klausul tersinkronisasi
// Desktop: dua kolom sticky. Mobile: satu kolom (pratinjau di atas).
// Jika url_pratinjau null: fallback ke layout satu kolom penuh.
// DESIGN.md: minimalism, flat, tidak ada shadow keras di area konten panjang
// ============================================================

import { useState, useRef, useCallback } from "react";
import { PratinjauDokumen } from "./pratinjau-dokumen";
import { DaftarKlausul } from "./daftar-klausul";
import type { DataKlausul, DetailDokumenKontrak } from "../types";

interface PropPanelAuditDenganPratinjau {
  klausul: DataKlausul[];
  dokumen: DetailDokumenKontrak | null;
}

export function PanelAuditDenganPratinjau({
  klausul,
  dokumen,
}: PropPanelAuditDenganPratinjau) {
  const [klausulAktifId, setKlausulAktifId] = useState<string | null>(null);
  const [nomorKlausulAktif, setNomorKlausulAktif] = useState<number | null>(null);

  // Ref ke container daftar klausul untuk scroll ke klausul aktif
  const refDaftarKlausul = useRef<HTMLDivElement>(null);

  const tanganiKlausulDipilih = useCallback(
    (klausulId: string, nomorUrut: number) => {
      setKlausulAktifId(klausulId);
      setNomorKlausulAktif(nomorUrut);
    },
    []
  );

  const adaPratinjau = dokumen?.url_pratinjau != null;

  // Jika tidak ada url_pratinjau, render DaftarKlausul biasa tanpa panel pratinjau
  if (!adaPratinjau) {
    return (
      <DaftarKlausul
        klausul={klausul}
        klausulAktifId={null}
        onKlausulDipilih={undefined}
      />
    );
  }

  return (
    <section aria-label="Audit dokumen dengan pratinjau">
      {/*
       * Layout dua panel:
       * - Mobile (<lg): satu kolom, pratinjau di atas daftar klausul
       * - Desktop (>=lg): dua kolom sticky side-by-side
       *   Kiri (pratinjau): sticky, tinggi layar dikurangi navbar
       *   Kanan (klausul): scrollable independen
       */}
      {/* Layout:
       * Mobile (<lg): satu kolom, pratinjau di atas
       * Desktop (>=lg): pratinjau 2/5 kiri sticky, klausul 3/5 kanan scrollable
       * Proporsi 2:3 supaya panel klausul punya ruang baca yang cukup
       */}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[2fr_3fr] lg:items-start lg:gap-8">
        {/* Panel kiri — pratinjau dokumen
         * lg:sticky + lg:top-4 : panel menempel di posisi 16px dari atas viewport saat scroll
         * lg:h-[calc(100vh-8rem)] : tinggi eksplisit wajib ada agar sticky bekerja —
         *   tanpa height, elemen sticky tidak punya ruang untuk "mengambang"
         * overflow-hidden : clip konten yang melebihi tinggi panel
         */}
        <div className="order-1 lg:sticky lg:top-4 lg:h-[calc(100vh-8rem)] lg:overflow-hidden">
          <PratinjauDokumen
            urlPratinjau={dokumen.url_pratinjau!}
            namaDokumen={dokumen.nama}
            nomorKlausulAktif={nomorKlausulAktif}
          />
        </div>

        {/* Panel kanan — daftar klausul */}
        <div ref={refDaftarKlausul} className="order-2">
          <DaftarKlausul
            klausul={klausul}
            klausulAktifId={klausulAktifId}
            onKlausulDipilih={tanganiKlausulDipilih}
          />
        </div>
      </div>
    </section>
  );
}