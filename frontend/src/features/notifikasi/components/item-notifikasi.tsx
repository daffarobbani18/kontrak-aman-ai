// ============================================================
// ItemNotifikasi — satu baris notifikasi di panel
// F-NOTIF-01 PRD.md: audit selesai
// F-NOTIF-02 PRD.md: pengingat tindak lanjut
// DESIGN.md: flat, token warna Jernih, ikon Lucide
// ============================================================

import Link from "next/link";
import { CheckCircle, AlertTriangle, X } from "lucide-react";
import type { ItemNotifikasi as TipeItemNotifikasi } from "../types";

interface PropItemNotifikasi {
  item: TipeItemNotifikasi;
  onTandaiDibaca: (id: string) => void;
  onHapus: (id: string) => void;
}

// Konfigurasi tampilan per jenis notifikasi
const KONFIGURASI_JENIS = {
  audit_selesai: {
    Ikon: CheckCircle,
    kelasIkon: "text-[var(--jernih-success)]",
    kelasBg: "bg-[var(--jernih-success)]/10",
  },
  audit_gagal: {
    Ikon: AlertTriangle,
    kelasIkon: "text-[var(--jernih-error)]",
    kelasBg: "bg-[var(--jernih-error)]/10",
  },
  pengingat_tindak_lanjut: {
    Ikon: AlertTriangle,
    kelasIkon: "text-[var(--jernih-warning)]",
    kelasBg: "bg-[var(--jernih-warning)]/10",
  },
} as const;

function formatWaktuRelatif(isoString: string): string {
  const selisihMs = Date.now() - new Date(isoString).getTime();
  const selisihMenit = Math.floor(selisihMs / 60000);
  const selisihJam = Math.floor(selisihMs / 3600000);
  const selisihHari = Math.floor(selisihMs / 86400000);

  if (selisihMenit < 1) return "Baru saja";
  if (selisihMenit < 60) return `${selisihMenit} menit lalu`;
  if (selisihJam < 24) return `${selisihJam} jam lalu`;
  if (selisihHari < 7) return `${selisihHari} hari lalu`;
  return new Date(isoString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

export function ItemNotifikasi({
  item,
  onTandaiDibaca,
  onHapus,
}: PropItemNotifikasi) {
  const konfigurasi = KONFIGURASI_JENIS[item.jenis] ?? KONFIGURASI_JENIS.audit_selesai;
  const { Ikon } = konfigurasi;

  const kontenInner = (
    <div
      className={`flex items-start gap-3 px-4 py-3 transition-colors duration-150 ${
        item.sudahDibaca
          ? "opacity-60"
          : "bg-[var(--jernih-primary)]/3"
      }`}
    >
      {/* Ikon jenis */}
      <div
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--jernih-radius-md)] ${
          konfigurasi.kelasBg
        }`}
        aria-hidden="true"
      >
        <Ikon
          className={`h-3.5 w-3.5 ${konfigurasi.kelasIkon}`}
          strokeWidth={2}
        />
      </div>

      {/* Teks */}
      <div className="min-w-0 flex-1">
        <p
          className={`text-body-md leading-snug ${
            item.sudahDibaca
              ? "text-[var(--jernih-neutral)]"
              : "font-medium text-[var(--jernih-on-surface)]"
          }`}
        >
          {item.judul}
        </p>
        <p className="mt-0.5 line-clamp-2 text-label-sm text-[var(--jernih-neutral)]">
          {item.pesan}
        </p>
        <p className="mt-1 text-label-sm text-[var(--jernih-neutral)]/70">
          {formatWaktuRelatif(item.dibuatPada)}
        </p>
      </div>

      {/* Tombol hapus */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onHapus(item.id);
        }}
        className="shrink-0 rounded-[var(--jernih-radius-sm)] p-1 text-[var(--jernih-neutral)]/50 transition-colors hover:bg-[var(--jernih-neutral)]/10 hover:text-[var(--jernih-neutral)]"
        aria-label={`Hapus notifikasi: ${item.judul}`}
      >
        <X className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );

  // Jika ada href tujuan, bungkus dengan Link
  if (item.hrefTujuan) {
    return (
      <Link
        href={item.hrefTujuan}
        onClick={() => onTandaiDibaca(item.id)}
        className="block hover:bg-[var(--jernih-neutral)]/5"
        aria-label={item.judul}
      >
        {kontenInner}
      </Link>
    );
  }

  return (
    <div
      role="listitem"
      onClick={() => onTandaiDibaca(item.id)}
      className="cursor-default"
    >
      {kontenInner}
    </div>
  );
}