import { Zap, ArrowUpRight, Calendar, CheckCircle2, Infinity } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import type { DataProfilPengguna } from "@/features/dashboard/types";

// ============================================================
// KartuKuota — tile info kuota dan tier pengguna
// Data dari GET /pengguna/saya (api.md 5.1)
// Sesuai F-BILL-01 PRD — tampilkan peringatan saat kuota habis
// ============================================================
interface PropKartuKuota {
  profil: DataProfilPengguna;
}

function hitungPersenKuota(digunakan: number, batas: number | null): number {
  if (batas === null) return 0; // tidak terbatas
  if (batas === 0) return 100;
  return Math.min(Math.round((digunakan / batas) * 100), 100);
}

function labelTier(tier: string): string {
  const label: Record<string, string> = {
    gratis: "Gratis",
    pro: "Pro",
    bisnis: "Bisnis",
  };
  return label[tier] ?? tier;
}

export default function KartuKuota({ profil }: PropKartuKuota) {
  const { kuota, tier, langganan_aktif } = profil;
  const persenAudit = hitungPersenKuota(kuota.audit.digunakan, kuota.audit.batas);
  const kuotaHabis = kuota.audit.batas !== null && kuota.audit.digunakan >= kuota.audit.batas;
  const tidakTerbatas = kuota.audit.batas === null;

  return (
    <div className="flex h-full flex-col justify-between rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-label-sm text-[var(--jernih-neutral)]">Paket Aktif</p>
          <div className="mt-1 flex items-center gap-2">
            <Zap
              className="h-4 w-4 text-[var(--jernih-primary)]"
              strokeWidth={2}
              aria-hidden="true"
            />
            <span
              className="text-headline-md text-[var(--jernih-on-surface)]"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {labelTier(tier)}
            </span>
          </div>
        </div>

        {/* Badge kuota habis */}
        {kuotaHabis && (
          <span className="badge-risiko-kuning px-2 py-0.5 text-label-sm font-medium">
            Kuota habis
          </span>
        )}
      </div>

      {/* Info kuota audit */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-body-md text-[var(--jernih-neutral)]">Audit bulan ini</p>
          <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
            {tidakTerbatas
              ? kuota.audit.digunakan
              : `${kuota.audit.digunakan} / ${kuota.audit.batas}`}
          </p>
        </div>

        {/* Progress bar — hanya untuk tier terbatas */}
        {!tidakTerbatas ? (
          <Progress
            value={persenAudit}
            className="h-1.5"
            aria-label={`Penggunaan kuota audit: ${persenAudit}%`}
          />
        ) : (
          /* Tier Pro/Bisnis — indikator tidak terbatas */
          <div className="flex items-center gap-1.5">
            <Infinity
              className="h-3.5 w-3.5 text-[var(--jernih-primary)]"
              strokeWidth={2}
              aria-hidden="true"
            />
            <p className="text-label-sm text-[var(--jernih-primary)]">
              Tidak terbatas
            </p>
          </div>
        )}

        {/* Info reset kuota — tier gratis */}
        {kuota.audit.reset_pada && (
          <p className="text-label-sm text-[var(--jernih-neutral)]">
            Reset pada{" "}
            {new Date(kuota.audit.reset_pada).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
            })}
          </p>
        )}
      </div>

      {/* Info tambahan tier Pro/Bisnis */}
      {tidakTerbatas && (
        <div className="mt-4 space-y-2 border-t border-[var(--jernih-neutral)]/10 pt-4">
          {/* Fitur unggulan */}
          <div className="flex items-center gap-2">
            <CheckCircle2
              className="h-3.5 w-3.5 shrink-0 text-[var(--jernih-success)]"
              strokeWidth={2}
              aria-hidden="true"
            />
            <p className="text-label-sm text-[var(--jernih-neutral)]">
              Draf negosiasi tidak terbatas
            </p>
          </div>
          {/* Tanggal aktif hingga dari langganan */}
          {langganan_aktif?.aktif_hingga && (
            <div className="flex items-center gap-2">
              <Calendar
                className="h-3.5 w-3.5 shrink-0 text-[var(--jernih-neutral)]"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <p className="text-label-sm text-[var(--jernih-neutral)]">
                Aktif hingga{" "}
                <span className="font-medium text-[var(--jernih-on-surface)]">
                  {new Date(langganan_aktif.aktif_hingga).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </p>
            </div>
          )}
          {/* Link ke halaman langganan */}
          <Link
            href="/langganan"
            className="inline-flex items-center gap-1 text-label-sm text-[var(--jernih-neutral)] hover:text-[var(--jernih-on-surface)] transition-colors duration-150"
          >
            Kelola langganan
            <ArrowUpRight className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* Tombol upgrade — hanya untuk tier gratis */}
      {tier === "gratis" && (
        <Link
          href="/langganan"
          className="mt-4 inline-flex items-center gap-1.5 text-body-md font-medium text-[var(--jernih-primary)] hover:underline"
        >
          Upgrade ke Pro
          <ArrowUpRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
