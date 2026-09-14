"use client";

// ============================================================
// KartuPreferensiNotifikasi — F-PROF-03 PRD.md (Could Have)
// GET  /pengguna/saya/preferensi-notifikasi (api.md 5.7)
// PATCH /pengguna/saya/preferensi-notifikasi (api.md 5.8)
//
// DESIGN.md:
//   - Kartu flat (border tipis, tanpa shadow — area baca bukan aksi)
//   - Warna primary hanya untuk toggle aktif, bukan dekorasi
//   - Feedback inline di bawah semua toggle, bukan modal
//   - Aksesibel: Switch.Root dari @base-ui/react, aria-describedby per toggle
//   - prefers-reduced-motion: animasi toggle pakai CSS transition, aman
// ============================================================

import { Switch } from "@base-ui/react/switch";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Bell, RefreshCcw, CheckCircle, AlertCircle } from "lucide-react";
import { usePreferensiNotifikasi } from "../hooks/use-preferensi-notifikasi";
import type {
  PayloadPerbaruiPreferensi,
  PreferensiNotifikasiData,
  StatusSimpanPreferensi,
} from "../types";

// ------------------------------------------------------------
// Konfigurasi label dan deskripsi per kategori notifikasi
// Sesuai field api.md 5.7 dan 5.8
// ------------------------------------------------------------
const KONFIGURASI_TOGGLE: Array<{
  field: keyof Omit<PreferensiNotifikasiData, "diperbarui_pada">;
  label: string;
  deskripsi: string;
}> = [
  {
    field: "audit_selesai",
    label: "Audit Kontrak Selesai",
    deskripsi:
      "Terima notifikasi saat AI selesai menganalisis kontrak yang kamu unggah.",
  },
  {
    field: "pengingat_tindak_lanjut",
    label: "Pengingat Tindak Lanjut",
    deskripsi:
      "Ingatkan saya jika ada kontrak berisiko tinggi yang belum dinegosiasikan.",
  },
  {
    field: "info_langganan",
    label: "Info Langganan",
    deskripsi:
      "Notifikasi pembayaran, perpanjangan, dan perubahan tier langganan.",
  },
];

// ------------------------------------------------------------
// FeedbackPreferensi — animasi masuk/keluar smooth
// DESIGN.md: AnimatePresence + motion, 250–300ms, ease-out masuk, ease-in keluar
// prefers-reduced-motion: gunakan fade saja tanpa translate/scale
// ------------------------------------------------------------
interface PropFeedbackPreferensi {
  // Pakai StatusSimpanPreferensi dari types/index.ts — sesuai prinsip DRY AGENTS.md Bagian 5
  statusSimpan: StatusSimpanPreferensi;
  pesanError: string | null;
  sedangMenyimpan: boolean;
}

function FeedbackPreferensi({
  statusSimpan,
  pesanError,
  sedangMenyimpan,
}: PropFeedbackPreferensi) {
  const kurangiGerak = useReducedMotion();

  // DESIGN.md: ease-out untuk masuk, ease-in untuk keluar
  // Transition didefinisikan terpisah per prop initial/animate/exit
  // supaya TypeScript bisa infer tipe Easing dengan benar
  const animMasuk = kurangiGerak
    ? { opacity: 0 }
    : { opacity: 0, y: -6, scale: 0.98 };
  const animTampil = { opacity: 1, y: 0, scale: 1 };
  const animKeluar = kurangiGerak
    ? { opacity: 0 }
    : { opacity: 0, y: -4, scale: 0.98 };
  const transMasuk = { duration: 0.25, ease: "easeOut" as const };
  const transKeluar = { duration: 0.2, ease: "easeIn" as const };

  return (
    <div className="mt-2 overflow-hidden">
      <AnimatePresence mode="wait">
        {statusSimpan === "tersimpan" && (
          <motion.div
            key="tersimpan"
            initial={animMasuk}
            animate={animTampil}
            exit={animKeluar}
            transition={transMasuk}
            style={{ originX: 0.5, originY: 0 }}
            className="flex items-center gap-2 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-success)]/30 bg-[var(--jernih-success)]/5 px-3 py-2.5"
            role="status"
            aria-live="polite"
          >
            <CheckCircle
              className="h-4 w-4 shrink-0 text-[var(--jernih-success)]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <p className="text-body-md text-[var(--jernih-success)]">
              Preferensi berhasil disimpan.
            </p>
          </motion.div>
        )}

        {statusSimpan === "gagal" && pesanError && (
          <motion.div
            key="gagal"
            initial={animMasuk}
            animate={animTampil}
            exit={animKeluar}
            transition={transMasuk}
            style={{ originX: 0.5, originY: 0 }}
            className="flex items-center gap-2 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-error)]/30 bg-[var(--jernih-error)]/5 px-3 py-2.5"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle
              className="h-4 w-4 shrink-0 text-[var(--jernih-error)]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <p className="text-body-md text-[var(--jernih-error)]">{pesanError}</p>
          </motion.div>
        )}

        {sedangMenyimpan && (
          <motion.p
            key="menyimpan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" as const }}
            className="text-label-sm text-[var(--jernih-neutral)]"
            role="status"
            aria-live="polite"
          >
            Menyimpan...
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ------------------------------------------------------------
// Skeleton loading — tampil saat statusMuat idle atau memuat
// ------------------------------------------------------------
function SkeletonPreferensiNotifikasi() {
  return (
    <div
      className="rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-6"
      aria-busy="true"
      aria-label="Memuat preferensi notifikasi"
    >
      <div className="mb-5 h-6 w-48 animate-pulse rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
      <div className="space-y-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-40 animate-pulse rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
              <div className="h-3 w-64 animate-pulse rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
            </div>
            <div className="h-6 w-10 shrink-0 animate-pulse rounded-full bg-[var(--jernih-neutral)]/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Komponen utama
// ------------------------------------------------------------
export function KartuPreferensiNotifikasi() {
  const { state, simpanPreferensi, muatPreferensi } = usePreferensiNotifikasi();
  const { statusMuat, statusSimpan, data, pesanError } = state;

  const sedangMenyimpan = statusSimpan === "menyimpan";

  // State: memuat
  if (statusMuat === "idle" || statusMuat === "memuat") {
    return <SkeletonPreferensiNotifikasi />;
  }

  // State: gagal muat
  if (statusMuat === "gagal") {
    return (
      <div
        className="rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-6"
        role="alert"
      >
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-[var(--jernih-radius-md)] border border-[var(--jernih-error)]/30 bg-[var(--jernih-error)]/5">
            <AlertCircle
              className="h-6 w-6 text-[var(--jernih-error)]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
              Gagal Memuat Preferensi
            </p>
            <p className="mt-0.5 text-body-md text-[var(--jernih-neutral)]">
              {pesanError ?? "Terjadi kesalahan saat memuat preferensi notifikasi."}
            </p>
          </div>
          <button
            type="button"
            onClick={muatPreferensi}
            className="inline-flex items-center gap-2 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-neutral)]/30 px-4 py-2 text-body-md text-[var(--jernih-on-surface)] transition-colors hover:bg-[var(--jernih-on-surface)]/5"
          >
            <RefreshCcw className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Guard: data null tidak mungkin setelah selesai, tapi TypeScript perlu ini
  if (!data) return null;

  const tanganiToggle = (
    field: keyof PayloadPerbaruiPreferensi,
    nilaiLama: boolean
  ) => {
    if (sedangMenyimpan) return;
    simpanPreferensi({ [field]: !nilaiLama });
  };

  return (
    <div
      className="rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-6"
      aria-label="Preferensi notifikasi"
    >
      {/* Header kartu */}
      <div className="mb-1 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--jernih-radius-md)] bg-[var(--jernih-primary)]/10">
          <Bell
            className="h-4 w-4 text-[var(--jernih-primary)]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
        <div>
          <h2
            className="text-headline-md text-[var(--jernih-on-surface)]"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Preferensi Notifikasi
          </h2>
          <p className="text-label-sm text-[var(--jernih-neutral)]">
            Atur jenis notifikasi yang ingin kamu terima.
          </p>
        </div>
      </div>

      {/* Daftar toggle */}
      <div
        role="group"
        aria-label="Pengaturan kategori notifikasi"
      >
        {KONFIGURASI_TOGGLE.map((item, indeks) => {
          const nilaiSaatIni = data[item.field];
          const idToggle = `toggle-notif-${item.field}`;
          const idDeskripsi = `deskripsi-notif-${item.field}`;
          const bukanYangTerakhir = indeks < KONFIGURASI_TOGGLE.length - 1;

          return (
            <div
              key={item.field}
              className={`flex items-start justify-between gap-4 py-4 ${
                bukanYangTerakhir
                  ? "border-b border-[var(--jernih-neutral)]/10"
                  : ""
              }`}
            >
              {/* Label dan deskripsi */}
              <div className="min-w-0 flex-1">
                <label
                  htmlFor={idToggle}
                  className="block cursor-pointer text-body-md font-medium text-[var(--jernih-on-surface)]"
                >
                  {item.label}
                </label>
                <p
                  id={idDeskripsi}
                  className="mt-0.5 text-label-sm text-[var(--jernih-neutral)]"
                >
                  {item.deskripsi}
                </p>
              </div>

              {/* Toggle switch — @base-ui/react/switch */}
              <Switch.Root
                id={idToggle}
                checked={nilaiSaatIni}
                onCheckedChange={() => tanganiToggle(item.field, nilaiSaatIni)}
                disabled={sedangMenyimpan}
                aria-describedby={idDeskripsi}
                className={[
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
                  "border-2 transition-colors duration-200",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                  "focus-visible:outline-[var(--jernih-primary)]",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  nilaiSaatIni
                    ? "border-[var(--jernih-primary)] bg-[var(--jernih-primary)]"
                    : "border-[var(--jernih-neutral)]/40 bg-[var(--jernih-neutral)]/15",
                ].join(" ")}
              >
                <Switch.Thumb
                  className={[
                    "block h-4 w-4 rounded-full shadow-sm transition-transform duration-200",
                    nilaiSaatIni
                      ? "translate-x-5 bg-white"
                      : "translate-x-0.5 bg-[var(--jernih-neutral)]",
                  ].join(" ")}
                />
              </Switch.Root>
            </div>
          );
        })}
      </div>

      {/* Feedback animasi — masuk/keluar smooth sesuai DESIGN.md */}
      <FeedbackPreferensi
        statusSimpan={statusSimpan}
        pesanError={pesanError}
        sedangMenyimpan={sedangMenyimpan}
      />
    </div>
  );
}
