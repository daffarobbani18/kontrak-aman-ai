// ============================================================
// KontenHasilAudit — Client Component utama halaman /audit/[id]
// Merakit: KartuSkorRisiko + KartuStatistik + DaftarKlausul + DisclaimerHukum
// Sesuai F-DASH-02 PRD, api.md 7.2
// ============================================================

"use client";

import { useState } from "react";
import { useHasilAudit } from "@/features/audit-klausul/hooks/use-hasil-audit";
import { KartuSkorRisiko } from "@/features/audit-klausul/components/kartu-skor-risiko";
import { KartuStatistik } from "@/features/audit-klausul/components/kartu-statistik";
import { PanelAuditDenganPratinjau } from "@/features/audit-klausul/components/panel-audit-dengan-pratinjau";
import { SkeletonHasilAudit } from "@/features/audit-klausul/components/skeleton-hasil-audit";
import { StatusMemproses } from "@/features/audit-klausul/components/status-memproses";
import { DisclaimerHukum } from "@/features/edukasi/components/disclaimer-hukum";
import { PanelRevisi } from "@/features/dokumen-kontrak/components/panel-revisi";
import { AlertCircle, ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";

interface PropKontenHasilAudit {
  auditId: string;
}

export default function KontenHasilAudit({ auditId }: PropKontenHasilAudit) {
  const { state, muatUlang } = useHasilAudit(auditId);

  // Deteksi apakah halaman ini adalah revisi langsung dari state.dokumen (api.md 6.3)
  // revisi_dari_id !== null berarti dokumen ini adalah revisi dari dokumen lain
  // audit_id dari dokumen asal diambil dari DETAIL_DOKUMEN_MOCK via revisi_dari_id
  // Untuk navigasi, kita perlu audit_id dari dokumen ASAL — tapi api.md 6.3 hanya
  // menyediakan revisi_dari_id (dokumen_id asal), bukan audit_id-nya.
  // Solusi: simpan auditIdAsal dari riwayat revisi (api.md 6.6) via PanelRevisi callback
  const [auditIdAsal, setAuditIdAsal] = useState<string | null>(null);

  // adalahRevisi: true jika state.dokumen sudah tersedia dan nomor_revisi > 0
  // Sesuai api.md 6.3: nomor_revisi 0 = dokumen asal, > 0 = revisi
  // Tidak perlu cek revisi_dari_id karena dokumen asal saja yang punya nomor_revisi 0
  const adalahRevisi =
    state.dokumen !== null &&
    state.dokumen.nomor_revisi > 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Navigasi kembali */}
      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link
          href="/riwayat"
          className="inline-flex items-center gap-1.5 text-body-md text-[var(--jernih-neutral)] transition-colors duration-150 hover:text-[var(--jernih-on-surface)]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          Kembali ke Riwayat
        </Link>

        {/* Tombol lihat kontrak asal — hanya tampil jika:
            1. state.dokumen sudah tersedia (fetch GET /dokumen-kontrak/:id selesai)
            2. dokumen ini adalah revisi (nomor_revisi > 0, revisi_dari_id !== null)
            3. auditIdAsal sudah tersedia dari PanelRevisi callback
            Sumber data: api.md 6.3 untuk deteksi, api.md 6.6 untuk audit_id asal */}
        {adalahRevisi && auditIdAsal && (
          <>
            <span className="text-[var(--jernih-neutral)]/30" aria-hidden="true">|</span>
            <Link
              href={`/audit/${auditIdAsal}`}
              className="inline-flex items-center gap-1.5 text-body-md text-[var(--jernih-neutral)] transition-colors duration-150 hover:text-[var(--jernih-on-surface)]"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              Lihat Kontrak Asal
            </Link>
          </>
        )}
      </div>

      {/* ── State: memuat (pertama kali) ── */}
      {state.status === "idle" || state.status === "memuat" ? (
        <SkeletonHasilAudit />
      ) : null}

      {/* ── State: masih memproses (polling) ── */}
      {state.status === "memproses" ? (
        <StatusMemproses progres={state.progres} />
      ) : null}

      {/* ── State: gagal ── */}
      {state.status === "gagal" ? (
        <div
          className="flex flex-col items-center gap-5 py-16 text-center"
          role="alert"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-[var(--jernih-radius-lg)] border-2 border-[var(--jernih-error)]/30 bg-[var(--jernih-error)]/5">
            <AlertCircle
              className="h-7 w-7 text-[var(--jernih-error)]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
          <div>
            <p
              className="text-headline-md text-[var(--jernih-on-surface)]"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Gagal Memuat Hasil Audit
            </p>
            <p className="mt-1 text-body-md text-[var(--jernih-neutral)]">
              {state.pesanError ??
                "Terjadi kesalahan saat mengambil hasil audit."}
            </p>
          </div>
          <button
            type="button"
            onClick={muatUlang}
            className="btn-brutal inline-flex items-center gap-2 px-5 py-2.5 text-body-md font-medium"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Coba Lagi
          </button>
        </div>
      ) : null}

      {/* ── State: selesai ── */}
      {state.status === "selesai" && state.data ? (
        <div className="space-y-6">
          {/* Kartu skor risiko — F-AUDIT-02 */}
          <KartuSkorRisiko
            skor={state.data.skor_risiko}
            ringkasan={state.data.ringkasan}
          />

          {/* Statistik klausul */}
          <KartuStatistik statistik={state.data.statistik} />

          {/* Panel audit dengan pratinjau dokumen — F-AUDIT-04
              Wrapper -mx memungkinkan panel melebar keluar dari max-w-3xl
              tanpa mengubah lebar kartu skor dan statistik di atas.
              Sesuai DESIGN.md: konten teks (skor, ringkasan) tetap narrow,
              hanya panel dua-kolom yang boleh melebar di desktop. */}
          <div className="lg:-mx-[max(0px,calc((100vw-72rem)/2-1.5rem))]">
            <PanelAuditDenganPratinjau
              klausul={state.data.klausul}
              dokumen={state.dokumen}
            />
          </div>

          {/* Disclaimer hukum — WAJIB selalu tampil (F-EDU-01 PRD) */}
          <DisclaimerHukum />

          {/* Panel revisi — F-DOC-05 PRD (Could Have)
              PanelRevisi HARUS menerima dokumenId dari dokumen ASAL agar
              GET /dokumen-kontrak/:id/revisi (api.md 6.6) mengambil riwayat
              yang benar.
              - Dokumen asal: dokumenId = dokumen_kontrak_id
              - Revisi: dokumenId = revisi_dari_id (ID dokumen asal, api.md 6.3)
              Tunggu state.dokumen tersedia agar dokumenId stabil sejak mount. */}
          {state.dokumen !== null && (
            <PanelRevisi
              dokumenId={
                adalahRevisi
                  ? state.dokumen.revisi_dari_id!
                  : state.data.dokumen_kontrak_id
              }
              onAuditIdAsal={(id) => setAuditIdAsal(id)}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}