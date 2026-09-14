"use client";

// ============================================================
// PratinjauDokumen — tampilkan gambar pratinjau dokumen kontrak
// Sumber: url_pratinjau dari GET /dokumen-kontrak/:id (api.md 6.3)
// Gambar statis JPG dari CDN — bukan PDF interaktif
// Sesuai F-AUDIT-04 PRD: highlight klausul pada dokumen asli
// DESIGN.md: minimalism, flat card, tidak ada shadow keras di area teks
// ============================================================

import { useState } from "react";
import { FileText, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface PropPratinjauDokumen {
  urlPratinjau: string;
  namaDokumen: string;
  // Nomor urut klausul yang sedang aktif — untuk highlight visual
  // Catatan: karena url_pratinjau adalah gambar statis (tidak ada koordinat
  // bounding box dari API), highlight ditampilkan sebagai indikator nomor
  // di atas gambar, bukan overlay presisi di atas teks
  nomorKlausulAktif?: number | null;
}

export function PratinjauDokumen({
  urlPratinjau,
  namaDokumen,
  nomorKlausulAktif,
}: PropPratinjauDokumen) {
  const [skala, setSkala] = useState(1);
  const [gagalMuat, setGagalMuat] = useState(false);

  const perbesar = () => setSkala((s) => Math.min(s + 0.25, 2.5));
  const perkecil = () => setSkala((s) => Math.max(s - 0.25, 0.5));
  const resetSkala = () => setSkala(1);

  if (gagalMuat) {
    return (
      <div
        className="flex h-full min-h-[400px] flex-col items-center justify-center gap-3
          rounded-[var(--jernih-radius-lg)]
          border border-[var(--jernih-neutral)]/20
          bg-[var(--jernih-neutral)]/5
          p-8 text-center"
      >
        <div
          className="flex h-12 w-12 items-center justify-center
            rounded-[var(--jernih-radius-md)]
            bg-[var(--jernih-neutral)]/10"
        >
          <FileText
            className="h-6 w-6 text-[var(--jernih-neutral)]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
        <div>
          <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
            Pratinjau tidak tersedia
          </p>
          <p className="mt-1 text-body-md text-[var(--jernih-neutral)]">
            Dokumen tidak dapat ditampilkan saat ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-2">
      {/* Nama dokumen */}
      <p
        className="truncate text-label-sm font-medium text-[var(--jernih-neutral)]"
        title={namaDokumen}
      >
        {namaDokumen}
      </p>

      {/* Indikator klausul aktif */}
      {nomorKlausulAktif != null && (
        <div
          className="flex items-center gap-2
            rounded-[var(--jernih-radius-md)]
            border border-[var(--jernih-primary)]/30
            bg-[var(--jernih-primary)]/5
            px-3 py-2"
          role="status"
          aria-live="polite"
        >
          <div
            className="flex h-5 w-5 shrink-0 items-center justify-center
              rounded-full bg-[var(--jernih-primary)]"
          >
            <span className="text-[10px] font-bold text-[var(--jernih-surface)]">
              {nomorKlausulAktif}
            </span>
          </div>
          <p className="text-label-sm text-[var(--jernih-primary)]">
            Klausul {nomorKlausulAktif} ditinjau
          </p>
        </div>
      )}

      {/* Area gambar — scrollable */}
      <div
        className="flex-1 overflow-auto rounded-[var(--jernih-radius-lg)]
          border border-[var(--jernih-neutral)]/20
          bg-[var(--jernih-neutral)]/5"
      >
        <div className="flex min-h-full items-start justify-center p-3">
          {/* Pakai <img> biasa karena domain CDN belum dikonfigurasi di next.config.ts */}
          {/* Ganti ke next/image setelah domain CDN dikonfigurasi */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urlPratinjau}
            alt={`Pratinjau dokumen ${namaDokumen}`}
            className="block w-full rounded-[var(--jernih-radius-sm)] shadow-sm"
            style={{
              transform: `scale(${skala})`,
              transformOrigin: "top center",
            }}
            onError={() => setGagalMuat(true)}
            draggable={false}
          />
        </div>
      </div>

      {/* Toolbar zoom — di bawah gambar, lebih bersih */}
      <div className="flex items-center justify-center gap-1">
        <button
          type="button"
          onClick={perkecil}
          disabled={skala <= 0.5}
          className="rounded-[var(--jernih-radius-sm)] p-1.5
            text-[var(--jernih-neutral)]
            hover:text-[var(--jernih-on-surface)]
            hover:bg-[var(--jernih-neutral)]/8
            transition-colors duration-150
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-[var(--jernih-primary)]/50
            disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Perkecil tampilan"
        >
          <ZoomOut className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={resetSkala}
          className="min-w-[3rem] rounded-[var(--jernih-radius-sm)] px-2 py-1
            text-label-sm text-[var(--jernih-neutral)]
            hover:text-[var(--jernih-on-surface)]
            hover:bg-[var(--jernih-neutral)]/8
            transition-colors duration-150
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-[var(--jernih-primary)]/50"
          aria-label={`Reset zoom ke 100%, saat ini ${Math.round(skala * 100)}%`}
        >
          {Math.round(skala * 100)}%
        </button>

        <button
          type="button"
          onClick={perbesar}
          disabled={skala >= 2.5}
          className="rounded-[var(--jernih-radius-sm)] p-1.5
            text-[var(--jernih-neutral)]
            hover:text-[var(--jernih-on-surface)]
            hover:bg-[var(--jernih-neutral)]/8
            transition-colors duration-150
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-[var(--jernih-primary)]/50
            disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Perbesar tampilan"
        >
          <ZoomIn className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
        </button>

        {skala !== 1 && (
          <button
            type="button"
            onClick={resetSkala}
            className="rounded-[var(--jernih-radius-sm)] p-1.5
              text-[var(--jernih-neutral)]
              hover:text-[var(--jernih-on-surface)]
              hover:bg-[var(--jernih-neutral)]/8
              transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-[var(--jernih-primary)]/50"
            aria-label="Reset zoom"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}