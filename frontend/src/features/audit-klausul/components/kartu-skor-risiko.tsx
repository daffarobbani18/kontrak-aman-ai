// ============================================================
// KartuSkorRisiko — hero skor risiko keseluruhan kontrak
// Sesuai F-AUDIT-02 PRD.md, badge-risiko-* DESIGN.md
// Rekomendasi konsultasi profesional wajib tampil saat skor Merah (F-EDU-03)
// ============================================================

import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { RekomendasiKonsultasi } from "@/features/edukasi/components/rekomendasi-konsultasi";
import type { SkorRisikoAudit } from "../types";

interface PropKartuSkorRisiko {
  skor: SkorRisikoAudit;
  ringkasan: string;
  namaDokumen?: string;
}

const KONFIGURASI_SKOR: Record<
  SkorRisikoAudit,
  {
    label: string;
    labelPanjang: string;
    kelasKartu: string;
    kelasTeks: string;
    kelasBadge: string;
    Ikon: React.ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: "true" | "false" }>;
  }
> = {
  hijau: {
    label: "Aman",
    labelPanjang: "Risiko Rendah",
    kelasKartu: "border-[var(--jernih-success)]/30 bg-[var(--jernih-success)]/5",
    kelasTeks: "text-[var(--jernih-success)]",
    kelasBadge: "badge-risiko-hijau",
    Ikon: ShieldCheck,
  },
  kuning: {
    label: "Perlu Diperhatikan",
    labelPanjang: "Risiko Sedang",
    kelasKartu: "border-[var(--jernih-warning)]/30 bg-[var(--jernih-warning)]/5",
    kelasTeks: "text-[var(--jernih-warning)]",
    kelasBadge: "badge-risiko-kuning",
    Ikon: ShieldAlert,
  },
  merah: {
    label: "Risiko Tinggi",
    labelPanjang: "Risiko Tinggi",
    kelasKartu: "border-[var(--jernih-error)]/30 bg-[var(--jernih-error)]/5",
    kelasTeks: "text-[var(--jernih-error)]",
    kelasBadge: "badge-risiko-merah",
    Ikon: ShieldX,
  },
};

export function KartuSkorRisiko({ skor, ringkasan, namaDokumen }: PropKartuSkorRisiko) {
  const config = KONFIGURASI_SKOR[skor];
  const { Ikon } = config;

  return (
    <div
      className={`rounded-[var(--jernih-radius-lg)] border-2 p-6 ${config.kelasKartu}`}
      role="region"
      aria-label={`Skor risiko kontrak: ${config.labelPanjang}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Ikon skor */}
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--jernih-radius-lg)] border-2 ${config.kelasKartu}`}
          aria-hidden="true"
        >
          <Ikon
            className={`h-7 w-7 ${config.kelasTeks}`}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>

        {/* Teks skor */}
        <div className="flex-1 min-w-0">
          {namaDokumen && (
            <p className="mb-1 truncate text-label-sm text-[var(--jernih-neutral)]">
              {namaDokumen}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <h2
              className={`text-headline-lg ${config.kelasTeks}`}
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {config.labelPanjang}
            </h2>
            <span className={`${config.kelasBadge} px-2.5 py-0.5 text-label-sm font-medium`}>
              {config.label}
            </span>
          </div>
          <p className="mt-2 text-body-md text-[var(--jernih-on-surface)]">
            {ringkasan}
          </p>
        </div>
      </div>

      {/* Rekomendasi konsultasi profesional — WAJIB saat skor Merah (F-EDU-03 PRD) */}
      {skor === "merah" && (
        <div className="mt-4">
          <RekomendasiKonsultasi />
        </div>
      )}
    </div>
  );
}