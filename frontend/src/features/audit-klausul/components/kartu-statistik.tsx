// ============================================================
// KartuStatistik — ringkasan angka klausul merah/kuning/hijau
// Data dari statistik api.md 7.2
// Sesuai DESIGN.md: badge-risiko-* untuk warna, kartu flat
// ============================================================

import type { StatistikAudit } from "../types";

interface PropKartuStatistik {
  statistik: StatistikAudit;
}

interface ItemStatistik {
  label: string;
  jumlah: number;
  kelasAngka: string;
  kelasBg: string;
  kelasBorder: string;
}

export function KartuStatistik({ statistik }: PropKartuStatistik) {
  const butirStatistik: ItemStatistik[] = [
    {
      label: "Risiko Tinggi",
      jumlah: statistik.klausul_merah,
      kelasAngka: "text-[var(--jernih-error)]",
      kelasBg: "bg-[var(--jernih-error)]/5",
      kelasBorder: "border-[var(--jernih-error)]/20",
    },
    {
      label: "Perlu Diperhatikan",
      jumlah: statistik.klausul_kuning,
      kelasAngka: "text-[var(--jernih-warning)]",
      kelasBg: "bg-[var(--jernih-warning)]/5",
      kelasBorder: "border-[var(--jernih-warning)]/20",
    },
    {
      label: "Aman",
      jumlah: statistik.klausul_hijau,
      kelasAngka: "text-[var(--jernih-success)]",
      kelasBg: "bg-[var(--jernih-success)]/5",
      kelasBorder: "border-[var(--jernih-success)]/20",
    },
    {
      label: "Total Klausul",
      jumlah: statistik.total_klausul,
      kelasAngka: "text-[var(--jernih-on-surface)]",
      kelasBg: "bg-[var(--jernih-neutral)]/5",
      kelasBorder: "border-[var(--jernih-neutral)]/20",
    },
  ];

  return (
    <div
      className="rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-5"
      aria-label="Statistik klausul kontrak"
    >
      <h2
        className="mb-4 text-headline-md text-[var(--jernih-on-surface)]"
        style={{ fontFamily: "var(--font-headline)" }}
      >
        Ringkasan Temuan
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {butirStatistik.map((butir) => (
          <div
            key={butir.label}
            className={`flex flex-col items-center justify-center rounded-[var(--jernih-radius-md)] border p-4 text-center ${
              butir.kelasBg
            } ${butir.kelasBorder}`}
          >
            <span
              className={`text-headline-lg font-bold ${butir.kelasAngka}`}
              style={{ fontFamily: "var(--font-headline)" }}
              aria-label={`${butir.jumlah} klausul ${butir.label}`}
            >
              {butir.jumlah}
            </span>
            <span className="mt-1 text-label-sm text-[var(--jernih-neutral)]">
              {butir.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}