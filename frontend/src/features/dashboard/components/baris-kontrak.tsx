"use client";

import Link from "next/link";
import { FileText, Clock, AlertCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { useHapusDokumen } from "@/features/dokumen-kontrak/hooks/use-hapus-dokumen";
import { DialogHapusDokumen } from "@/features/dokumen-kontrak/components/dialog-hapus-dokumen";
import type { ItemDokumenKontrak, SkorRisiko, StatusDokumen } from "@/features/dashboard/types";

// ============================================================
// BarisKontrak — satu item kontrak di daftar riwayat
// Data dari GET /dokumen-kontrak (api.md 6.2)
// F-DOC-04: tombol hapus + dialog konfirmasi (PRD Epic C)
// ============================================================
interface PropBarisKontrak {
  dokumen: ItemDokumenKontrak;
  // Callback setelah hapus berhasil — untuk update list di parent
  onDihapus?: (dokumenId: string) => void;
}

function BadgeSkorRisiko({ skor }: { skor: SkorRisiko }) {
  const konfigurasi: Record<SkorRisiko, { kelas: string; label: string }> = {
    hijau: { kelas: "badge-risiko-hijau", label: "Aman" },
    kuning: { kelas: "badge-risiko-kuning", label: "Perlu Diperhatikan" },
    merah: { kelas: "badge-risiko-merah", label: "Risiko Tinggi" },
  };
  const { kelas, label } = konfigurasi[skor];
  return <span className={`${kelas} shrink-0 px-2 py-0.5 text-label-sm font-medium`}>{label}</span>;
}

function BadgeStatus({ status }: { status: StatusDokumen }) {
  if (status === "selesai") return null;

  const konfigurasi: Record<Exclude<StatusDokumen, "selesai">, { label: string; kelas: string }> = {
    menunggu: {
      label: "Menunggu",
      kelas: "bg-[var(--jernih-neutral)]/10 text-[var(--jernih-neutral)]",
    },
    memproses: {
      label: "Menganalisis...",
      kelas: "bg-[var(--jernih-primary)]/10 text-[var(--jernih-primary)]",
    },
    gagal: {
      label: "Gagal",
      kelas:
        "bg-[color-mix(in_srgb,var(--jernih-error)_10%,transparent)] text-[var(--jernih-error)]",
    },
  };

  const config = konfigurasi[status as Exclude<StatusDokumen, "selesai">];
  if (!config) return null;

  return (
    <span
      className={`shrink-0 rounded-[var(--jernih-radius-sm)] border border-current/20 px-2 py-0.5 text-label-sm font-medium ${config.kelas}`}
    >
      {config.label}
    </span>
  );
}

function formatTanggal(tanggalIso: string): string {
  return new Date(tanggalIso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BarisKontrak({ dokumen, onDihapus }: PropBarisKontrak) {
  const bolehKlik = dokumen.status === "selesai" && dokumen.audit_id;

  // State hover untuk tombol hapus di desktop
  const [sedangHover, setSedangHover] = useState(false);

  const hapusDokumen = useHapusDokumen({
    onBerhasil: (dokumenId) => {
      onDihapus?.(dokumenId);
    },
  });

  const kontenBaris = (
    <div
      className="group relative flex items-center gap-3 rounded-[var(--jernih-radius-md)]
        border border-[var(--jernih-neutral)]/20
        bg-[var(--jernih-surface)]
        p-4 transition-colors duration-150
        hover:border-[var(--jernih-neutral)]/40"
      onMouseEnter={() => setSedangHover(true)}
      onMouseLeave={() => setSedangHover(false)}
    >
      {/* Ikon file */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--jernih-radius-md)] bg-[var(--jernih-neutral)]/8">
        {dokumen.status === "memproses" ? (
          <Clock
            className="h-4 w-4 text-[var(--jernih-primary)]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        ) : dokumen.status === "gagal" ? (
          <AlertCircle
            className="h-4 w-4 text-[var(--jernih-error)]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        ) : (
          <FileText
            className="h-4 w-4 text-[var(--jernih-neutral)]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Info kontrak */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-body-md font-medium text-[var(--jernih-on-surface)]">
          {dokumen.nama}
        </p>
        <p className="mt-0.5 text-label-sm text-[var(--jernih-neutral)]">
          {formatTanggal(dokumen.diunggah_pada)}
        </p>
      </div>

      {/* Badge status/skor + tombol hapus */}
      <div className="flex shrink-0 items-center gap-2">
        {dokumen.status === "selesai" && dokumen.skor_risiko ? (
          <BadgeSkorRisiko skor={dokumen.skor_risiko} />
        ) : (
          <BadgeStatus status={dokumen.status} />
        )}

        {/* Tombol hapus:
            - Desktop: tampil saat hover (opacity transisi)
            - Mobile: selalu tampil agar mudah disentuh
            Tersedia di semua status sesuai PRD F-DOC-04 (hak privasi data) */}
        <button
          type="button"
          onClick={(e) => {
            // Hentikan propagasi supaya Link di parent tidak ikut ter-klik
            e.preventDefault();
            e.stopPropagation();
            hapusDokumen.mintaKonfirmasi(dokumen.id, dokumen.nama);
          }}
          className={[
            "rounded-[var(--jernih-radius-sm)] p-1.5",
            "text-[var(--jernih-neutral)]",
            "hover:text-[var(--jernih-error)]",
            "hover:bg-[color-mix(in_srgb,var(--jernih-error)_8%,transparent)]",
            "transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jernih-error)]/40",
            // Desktop: sembunyikan sampai hover pada baris
            "sm:transition-opacity",
            sedangHover ? "sm:opacity-100" : "sm:opacity-0",
            // Mobile: selalu tampil
            "opacity-100",
          ].join(" ")}
          aria-label={`Hapus dokumen ${dokumen.nama}`}
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Baris kontrak — bisa diklik ke halaman audit jika sudah selesai */}
      {bolehKlik ? (
        <Link
          href={`/audit/${dokumen.audit_id}`}
          aria-label={`Lihat hasil audit ${dokumen.nama}`}
        >
          {kontenBaris}
        </Link>
      ) : (
        <div>{kontenBaris}</div>
      )}

      {/* Dialog konfirmasi hapus — di luar Link supaya tidak nested anchor */}
      <DialogHapusDokumen
        state={hapusDokumen.state}
        terbuka={hapusDokumen.dialogTerbuka}
        onBatalkan={hapusDokumen.batalkan}
        onKonfirmasi={hapusDokumen.konfirmasiHapus}
        onResetError={hapusDokumen.resetError}
      />
    </>
  );
}
