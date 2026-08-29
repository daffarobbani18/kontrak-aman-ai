// ============================================================

// KartuKuotaUnggah — info sisa kuota di halaman unggah
// Hanya tampil untuk tier Gratis (batas !== null)
// Menggunakan DashboardContext sebagai sumber data
// ============================================================

"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { useDashboard } from "@/features/dashboard/context/dashboard-context";

export function KartuKuotaUnggah() {
  const { profil } = useDashboard();

  // Tidak tampil jika data belum ada atau tier bukan gratis
  if (!profil) return null;
  const kuotaAudit = profil.kuota.audit;

  // Tier pro/bisnis: kuota tidak terbatas (batas === null)
  if (kuotaAudit.batas === null) return null;

  const sisa = Math.max(0, kuotaAudit.batas - kuotaAudit.digunakan);
  const habis = sisa === 0;

  return (
    <aside
      aria-label="Informasi kuota audit"
      className={`rounded-[var(--jernih-radius-lg)] border p-4 ${
        habis
          ? "border-[var(--jernih-error)]/30 bg-[var(--jernih-error)]/5"
          : "border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--jernih-radius-md)] ${
            habis
              ? "bg-[var(--jernih-error)]/10"
              : "bg-[var(--jernih-primary)]/10"
          }`}
        >
          <Zap
            className={`h-4 w-4 ${
              habis
                ? "text-[var(--jernih-error)]"
                : "text-[var(--jernih-primary)]"
            }`}
            aria-hidden="true"
          />
        </div>

        <div className="flex-1">
          {habis ? (
            <>
              <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
                Kuota audit bulan ini habis
              </p>
              <p className="mt-0.5 text-label-sm text-[var(--jernih-neutral)]">
                Upgrade ke Pro untuk audit tidak terbatas.
              </p>
              <Link
                href="/langganan"
                className="btn-brutal mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-label-sm"
              >
                <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                Upgrade ke Pro
              </Link>
            </>
          ) : (
            <>
              <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
                {sisa} audit tersisa bulan ini
              </p>
              <p className="mt-0.5 text-label-sm text-[var(--jernih-neutral)]">
                Kamu menggunakan paket Gratis ({kuotaAudit.digunakan}/
                {kuotaAudit.batas} audit).{" "}
                <Link
                  href="/langganan"
                  className="text-[var(--jernih-primary)] underline-offset-2 hover:underline"
                >
                  Upgrade ke Pro
                </Link>{" "}
                untuk audit tidak terbatas.
              </p>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}