import type { ItemDokumenKontrak, SkorRisiko } from "@/features/dashboard/types";

// ============================================================
// KartuDistribusiRisiko — tile statistik skor risiko
// Dihitung dari data GET /dokumen-kontrak (api.md 6.2)
// Sesuai F-DASH-01 PRD — distribusi skor risiko
// ============================================================
interface PropKartuDistribusiRisiko {
  dokumen: ItemDokumenKontrak[];
}

function hitungDistribusi(dokumen: ItemDokumenKontrak[]) {
  const selesai = dokumen.filter((d) => d.status === "selesai");
  const hijau = selesai.filter((d) => d.skor_risiko === "hijau").length;
  const kuning = selesai.filter((d) => d.skor_risiko === "kuning").length;
  const merah = selesai.filter((d) => d.skor_risiko === "merah").length;
  return { hijau, kuning, merah, total: selesai.length };
}

interface PropBarisSkor {
  label: string;
  jumlah: number;
  total: number;
  skor: SkorRisiko;
}

function BarisSkor({ label, jumlah, total, skor }: PropBarisSkor) {
  const persen = total > 0 ? Math.round((jumlah / total) * 100) : 0;
  const warnaBar: Record<SkorRisiko, string> = {
    hijau: "bg-[var(--jernih-success)]",
    kuning: "bg-[var(--jernih-warning)]",
    merah: "bg-[var(--jernih-error)]",
  };
  const warnaTeks: Record<SkorRisiko, string> = {
    hijau: "text-[var(--jernih-success)]",
    kuning: "text-[var(--jernih-warning)]",
    merah: "text-[var(--jernih-error)]",
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-body-md text-[var(--jernih-neutral)]">{label}</span>
        <span className={`text-body-md font-medium ${warnaTeks[skor]}`}>{jumlah}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--jernih-neutral)]/10">
        <div
          className={`h-full rounded-full transition-all duration-500 ${warnaBar[skor]}`}
          style={{ width: `${persen}%` }}
          role="progressbar"
          aria-valuenow={persen}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${jumlah} kontrak`}
        />
      </div>
    </div>
  );
}

export default function KartuDistribusiRisiko({ dokumen }: PropKartuDistribusiRisiko) {
  const { hijau, kuning, merah, total } = hitungDistribusi(dokumen);

  return (
    <div className="flex h-full flex-col justify-between rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-5">
      {/* Header */}
      <div>
        <p className="text-label-sm text-[var(--jernih-neutral)]">Distribusi Risiko</p>
        <p
          className="mt-1 text-headline-md text-[var(--jernih-on-surface)]"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          {total} kontrak
        </p>
      </div>

      {/* Baris distribusi */}
      <div className="mt-4 flex flex-col gap-3">
        <BarisSkor label="Aman" jumlah={hijau} total={total} skor="hijau" />
        <BarisSkor label="Perlu diperhatikan" jumlah={kuning} total={total} skor="kuning" />
        <BarisSkor label="Perlu dinegosiasi" jumlah={merah} total={total} skor="merah" />
      </div>

      {/* Total diaudit */}
      <p className="mt-4 text-label-sm text-[var(--jernih-neutral)]">
        {total === 0 ? "Belum ada kontrak diaudit" : `${total} kontrak telah diaudit`}
      </p>
    </div>
  );
}
