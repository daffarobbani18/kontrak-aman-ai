"use client";

// ============================================================
// PanelRevisi — komponen utama F-DOC-05
// POST /dokumen-kontrak/:id/revisi (api.md 6.5)
// GET  /dokumen-kontrak/:id/revisi (api.md 6.6)
// F-DOC-05 PRD.md: unggah ulang revisi kontrak (Could Have)
//
// Dipasang di halaman detail audit (/audit/:id) — entry point natural
// karena pengguna melihat hasil audit lalu langsung bisa unggah revisi
//
// DESIGN.md:
//   - Kartu flat, border tipis, tanpa shadow
//   - Warna primary hanya untuk aksi terpenting (tombol unggah)
//   - Skeleton loading konsisten dengan komponen lain
//   - Ikon Lucide outline, strokeWidth 1.5
// ============================================================

import { useEffect, useState } from "react";
import { GitBranch, RefreshCcw, AlertCircle, ChevronDown } from "lucide-react";
import { useRevisiDokumen } from "../hooks/use-revisi-dokumen";
import { DaftarRevisi } from "./daftar-revisi";
import { FormUnggahRevisi } from "./form-unggah-revisi";

interface PropPanelRevisi {
  dokumenId: string;
  // Callback untuk meneruskan audit_id dokumen asal (v0) ke parent
  // Dipakai di konten-hasil-audit.tsx untuk tombol "Lihat Kontrak Asal"
  // Data diambil dari GET /dokumen-kontrak/:id/revisi (api.md 6.6) — item nomor_revisi 0
  // Parent yang memutuskan apakah tombol ditampilkan (berdasarkan state.dokumen.nomor_revisi)
  onAuditIdAsal?: (auditId: string | null) => void;
}

// ------------------------------------------------------------
// Skeleton loading — tampil saat statusMuat === "memuat"
// ------------------------------------------------------------
function SkeletonPanelRevisi() {
  return (
    <div
      className="rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-6"
      aria-busy="true"
      aria-label="Memuat riwayat revisi"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="h-9 w-9 animate-pulse rounded-[var(--jernih-radius-md)] bg-[var(--jernih-neutral)]/10" />
        <div className="h-5 w-40 animate-pulse rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
      </div>
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-neutral)]/10 p-3"
          >
            <div className="h-8 w-8 animate-pulse rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-20 animate-pulse rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
              <div className="h-3 w-48 animate-pulse rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Komponen utama
// ------------------------------------------------------------
export function PanelRevisi({ dokumenId, onAuditIdAsal }: PropPanelRevisi) {
  const { state, muatRiwayat, unggah, resetUnggah } = useRevisiDokumen(dokumenId);
  const { statusMuat, statusUnggah, revisi, pesanErrorMuat, pesanErrorUnggah, kuotaHabis } = state;
  const [terbuka, setTerbuka] = useState(false);

  // Muat riwayat revisi saat mount
  useEffect(() => {
    muatRiwayat();
  }, [muatRiwayat]);

  // Teruskan audit_id dokumen asal (nomor_revisi 0) ke parent saat data tersedia
  // Parent (konten-hasil-audit.tsx) yang memutuskan apakah tombol "Lihat Kontrak Asal"
  // ditampilkan, berdasarkan state.dokumen.nomor_revisi dari api.md 6.3
  // Sumber: GET /dokumen-kontrak/:id/revisi (api.md 6.6)
  useEffect(() => {
    if (!onAuditIdAsal) return;
    const dokumenAsal = state.revisi.find((r) => r.nomor_revisi === 0);
    // Kirim audit_id asal ke parent — null jika belum tersedia
    onAuditIdAsal(dokumenAsal?.audit_id ?? null);
  }, [state.revisi, onAuditIdAsal]);

  // ── State: memuat — tampilkan skeleton ringkas di dalam trigger ──
  const sedangMemuat = statusMuat === "idle" || statusMuat === "memuat";

  // Hitung revisi (nomor_revisi > 0) untuk badge di trigger
  const jumlahRevisi = revisi.filter((r) => r.nomor_revisi > 0).length;
  const adaRevisi = jumlahRevisi > 0;

  return (
    <div
      className="rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)]"
      aria-label="Revisi kontrak"
    >
      {/* ── Trigger / header yang bisa diklik ── */}
      <button
        type="button"
        onClick={() => setTerbuka((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-[var(--jernih-on-surface)]/3"
        aria-expanded={terbuka}
        aria-controls="panel-revisi-konten"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--jernih-radius-md)] bg-[var(--jernih-primary)]/10">
            <GitBranch
              className="h-4 w-4 text-[var(--jernih-primary)]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
          <div>
            <span
              className="text-body-md font-medium text-[var(--jernih-on-surface)]"
            >
              Revisi Kontrak
            </span>
            {!sedangMemuat && (
              <span className="ml-2 text-label-sm text-[var(--jernih-neutral)]">
                {adaRevisi ? `${jumlahRevisi} revisi` : "Belum ada revisi"}
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--jernih-neutral)] transition-transform duration-200 ${
            terbuka ? "rotate-180" : ""
          }`}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>

      {/* ── Konten collapsible ── */}
      {terbuka && (
        <div
          id="panel-revisi-konten"
          className="border-t border-[var(--jernih-neutral)]/10 px-5 pb-5 pt-4"
        >
          {/* State: memuat */}
          {sedangMemuat && <SkeletonPanelRevisi />}

          {/* State: gagal muat */}
          {statusMuat === "gagal" && (
            <div className="flex flex-col items-center gap-4 py-4 text-center" role="alert">
              <div className="flex h-12 w-12 items-center justify-center rounded-[var(--jernih-radius-md)] border border-[var(--jernih-error)]/30 bg-[var(--jernih-error)]/5">
                <AlertCircle
                  className="h-6 w-6 text-[var(--jernih-error)]"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
                  Gagal Memuat Riwayat Revisi
                </p>
                <p className="mt-0.5 text-body-md text-[var(--jernih-neutral)]">
                  {pesanErrorMuat ?? "Terjadi kesalahan saat memuat riwayat revisi."}
                </p>
              </div>
              <button
                type="button"
                onClick={muatRiwayat}
                className="inline-flex items-center gap-2 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-neutral)]/30 px-4 py-2 text-body-md text-[var(--jernih-on-surface)] transition-colors hover:bg-[var(--jernih-on-surface)]/5"
              >
                <RefreshCcw className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                Coba Lagi
              </button>
            </div>
          )}

          {/* State: selesai */}
          {statusMuat === "selesai" && (
            <>
              {/* Daftar riwayat revisi — hanya v1+ */}
              {adaRevisi && (
                <div className="mb-5">
                  <DaftarRevisi revisi={revisi} />
                </div>
              )}

              {/* Divider */}
              {adaRevisi && (
                <div className="mb-4 border-t border-[var(--jernih-neutral)]/10" />
              )}

              {/* Subjudul form */}
              <div className="mb-4">
                <h3 className="text-body-md font-medium text-[var(--jernih-on-surface)]">
                  {adaRevisi ? "Unggah Revisi Berikutnya" : "Unggah Revisi"}
                </h3>
                <p className="mt-0.5 text-label-sm text-[var(--jernih-neutral)]">
                  {adaRevisi
                    ? "Klien kembali mengirim perubahan? Unggah versi terbaru — audit ulang akan berjalan otomatis."
                    : "Unggah versi baru kontrak yang sudah direvisi klien. Sistem akan mengaudit ulang dan menampilkan perbandingan skor risiko."}
                </p>
              </div>

              {/* Form unggah revisi */}
              <FormUnggahRevisi
                statusUnggah={statusUnggah}
                pesanError={pesanErrorUnggah}
                kuotaHabis={kuotaHabis}
                onUnggah={(file, catatan) =>
                  unggah(file, catatan ? { catatan_revisi: catatan } : undefined)
                }
                onReset={resetUnggah}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}