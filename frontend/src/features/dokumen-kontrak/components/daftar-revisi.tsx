// ============================================================
// DaftarRevisi — riwayat versi revisi dokumen kontrak
// GET /dokumen-kontrak/:id/revisi (api.md 6.6)
// F-DOC-05 PRD.md: unggah ulang revisi kontrak (Could Have)
//
// Logika tampil:
//   - v0 (dokumen asal) TIDAK ditampilkan di sini — pengguna sudah
//     ada di halaman audit dokumen asal, jadi redundan
//   - Hanya v1, v2, dst yang ditampilkan sebagai riwayat revisi
//   - Tombol "Lihat Audit" hanya untuk revisi (bukan v0) yang sudah selesai
//
// DESIGN.md:
//   - Kartu flat, border tipis, tanpa shadow
//   - Layout dua baris: baris atas nama + badge, baris bawah metadata
//   - Badge skor risiko pakai warna semantik (success/warning/error)
//   - Badge nomor revisi pakai neutral — bukan warna risiko
//   - Ikon Lucide outline, strokeWidth 1.5
// ============================================================

import Link from "next/link";
import { Clock, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import type { ItemRevisi } from "../types";

interface PropDaftarRevisi {
  // Seluruh array termasuk v0 — komponen ini yang memfilter tampilan
  revisi: ItemRevisi[];
}

// ------------------------------------------------------------
// Helper: badge skor risiko sesuai DESIGN.md
// Warna risiko HANYA untuk skor risiko, tidak pernah untuk dekorasi
// ------------------------------------------------------------
function BadgeSkorRisiko({ skor }: { skor: ItemRevisi["skor_risiko"] }) {
  if (!skor) return null;

  const konfigurasi: Record<
    NonNullable<ItemRevisi["skor_risiko"]>,
    { label: string; kelas: string }
  > = {
    hijau: {
      label: "Risiko Rendah",
      kelas:
        "bg-[var(--jernih-success)]/10 text-[var(--jernih-success)] border-[var(--jernih-success)]",
    },
    kuning: {
      label: "Risiko Sedang",
      kelas:
        "bg-[var(--jernih-warning)]/10 text-[var(--jernih-warning)] border-[var(--jernih-warning)]",
    },
    merah: {
      label: "Risiko Tinggi",
      kelas:
        "bg-[var(--jernih-error)]/10 text-[var(--jernih-error)] border-[var(--jernih-error)]",
    },
  };

  const { label, kelas } = konfigurasi[skor];

  return (
    <span
      className={`inline-flex items-center rounded-[var(--jernih-radius-sm)] border px-2 py-0.5 text-label-sm font-medium ${kelas}`}
    >
      {label}
    </span>
  );
}

// ------------------------------------------------------------
// Helper: status audit jika belum selesai diaudit
// ------------------------------------------------------------
function BadgeStatusAudit({ status }: { status: ItemRevisi["status"] }) {
  if (status === "selesai") return null;

  if (status === "memproses") {
    return (
      <span className="inline-flex items-center gap-1 text-label-sm text-[var(--jernih-primary)]">
        <Loader2
          className="h-3 w-3 animate-spin"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        Sedang diaudit
      </span>
    );
  }

  if (status === "menunggu") {
    return (
      <span className="inline-flex items-center gap-1 text-label-sm text-[var(--jernih-neutral)]">
        <Clock className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
        Menunggu
      </span>
    );
  }

  if (status === "gagal") {
    return (
      <span className="inline-flex items-center gap-1 text-label-sm text-[var(--jernih-error)]">
        <AlertCircle className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
        Audit gagal
      </span>
    );
  }

  return null;
}

// ------------------------------------------------------------
// Format tanggal ringkas ke Bahasa Indonesia
// ------------------------------------------------------------
function formatTanggal(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ------------------------------------------------------------
// Komponen utama
// Hanya menampilkan revisi (nomor_revisi >= 1), v0 disembunyikan
// karena pengguna sudah ada di halaman audit dokumen asal
// ------------------------------------------------------------
export function DaftarRevisi({ revisi }: PropDaftarRevisi) {
  // Filter: tampilkan hanya revisi, bukan dokumen asal (v0)
  const hanyaRevisi = revisi.filter((item) => item.nomor_revisi > 0);

  if (hanyaRevisi.length === 0) return null;

  return (
    <div
      className="space-y-3"
      role="list"
      aria-label="Riwayat revisi yang sudah diunggah"
    >
      {hanyaRevisi.map((item) => {
        const bisaDiakses = item.status === "selesai" && item.audit_id;

        return (
          <div
            key={item.id}
            role="listitem"
            className="rounded-[var(--jernih-radius-md)] border border-[var(--jernih-neutral)]/15 bg-[var(--jernih-surface)] px-4 py-3.5"
          >
            {/* Baris atas: nomor revisi + skor/status */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Badge nomor revisi — warna neutral, bukan warna risiko */}
                <span className="inline-flex items-center rounded-[var(--jernih-radius-sm)] border border-[var(--jernih-neutral)]/30 bg-[var(--jernih-neutral)]/8 px-2 py-0.5 text-label-sm font-medium text-[var(--jernih-neutral)]">
                  Revisi {item.nomor_revisi}
                </span>

                {/* Skor risiko jika audit sudah selesai */}
                <BadgeSkorRisiko skor={item.skor_risiko} />

                {/* Status audit jika belum selesai */}
                <BadgeStatusAudit status={item.status} />
              </div>

              {/* Tombol lihat audit revisi ini — hanya jika selesai */}
              {bisaDiakses && (
                <Link
                  href={`/audit/${item.audit_id}`}
                  className="inline-flex shrink-0 items-center gap-1 text-label-sm font-medium text-[var(--jernih-primary)] underline-offset-2 transition-colors hover:underline"
                  aria-label={`Lihat hasil audit revisi ${item.nomor_revisi}`}
                >
                  Lihat Audit
                  <ArrowRight className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
                </Link>
              )}
            </div>

            {/* Baris bawah: nama file + catatan + tanggal */}
            <div className="mt-2 space-y-0.5">
              <p className="truncate text-body-md text-[var(--jernih-on-surface)]">
                {item.nama}
              </p>

              {item.catatan_revisi && (
                <p className="text-label-sm text-[var(--jernih-neutral)]">
                  {item.catatan_revisi}
                </p>
              )}

              <p className="text-label-sm text-[var(--jernih-neutral)]">
                {formatTanggal(item.diunggah_pada)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}