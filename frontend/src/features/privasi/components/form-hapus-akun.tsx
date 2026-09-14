"use client";

// ============================================================
// FormHapusAkun — F-PRIV-04 PRD.md
// Hapus akun dengan konfirmasi ganda — DELETE /pengguna/saya (api.md 5.4)
// DESIGN.md: aksi destruktif — konfirmasi ganda, warna error, bukan btn-brutal
// ============================================================

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CheckCircle, AlertCircle, Eye, EyeOff, Trash2 } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { skemaHapusAkun, TEKS_KONFIRMASI_HAPUS, type TipeHapusAkun } from "../types";
import type { StatusHapusAkun } from "../types";

interface PropFormHapusAkun {
  status: StatusHapusAkun;
  pesanError: string | null;
  tanggalHapusPermanen: string | null;
  onHapus: (konfirmasi: string, kataSandi: string) => void;
  onBatal: () => void;
}

// Format tanggal ISO 8601 ke format Indonesia: "DD Bulan YYYY"
function formatTanggalIndonesia(iso: string): string {
  const tanggal = new Date(iso);
  return tanggal.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function FormHapusAkun({
  status,
  pesanError,
  tanggalHapusPermanen,
  onHapus,
  onBatal,
}: PropFormHapusAkun) {
  const [tampilKataSandi, setTampilKataSandi] = useState(false);
  const kurangiGerak = useReducedMotion();
  const sedangMemproses = status === "memproses";
  const selesai = status === "selesai";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TipeHapusAkun>({
    resolver: zodResolver(skemaHapusAkun),
  });

  const onSubmit = (data: TipeHapusAkun) => {
    onHapus(data.konfirmasi, data.kata_sandi);
  };

  // State selesai — tampilkan pesan sukses sebelum redirect
  if (selesai) {
    // Tampilkan tanggal aktual dari response API jika tersedia,
    // fallback ke "30 hari" jika response belum diterima
    const labelTanggal = tanggalHapusPermanen
      ? formatTanggalIndonesia(tanggalHapusPermanen)
      : "30 hari";

    return (
      <motion.div
        initial={kurangiGerak ? {} : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-start gap-3 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-success)]/30 bg-[var(--jernih-success)]/5 px-4 py-3"
        role="status"
      >
        <CheckCircle
          className="mt-0.5 h-5 w-5 shrink-0 text-[var(--jernih-success)]"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <div>
          <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
            Permintaan penghapusan akun diterima.
          </p>
          <p className="mt-0.5 text-body-md text-[var(--jernih-neutral)]">
            Akun dan seluruh datamu akan dihapus permanen pada{" "}
            <span className="font-medium text-[var(--jernih-on-surface)]">
              {labelTanggal}
            </span>
            . Kamu akan diarahkan ke halaman masuk...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.form
        initial={kurangiGerak ? {} : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-4"
        aria-label="Form konfirmasi hapus akun"
      >
        {/* Peringatan — aksi tidak bisa dibatalkan */}
        <div
          className="flex items-start gap-3 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-error)]/30 bg-[var(--jernih-error)]/5 px-4 py-3"
          role="alert"
        >
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--jernih-error)]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <div>
            <p className="text-body-md font-medium text-[var(--jernih-error)]">
              Tindakan ini tidak dapat dibatalkan
            </p>
            <p className="mt-0.5 text-body-md text-[var(--jernih-neutral)]">
              Seluruh dokumen, hasil audit, draf negosiasi, dan data akunmu
              akan dihapus permanen setelah 30 hari. Masuk kembali sebelum
              batas waktu jika ingin membatalkan.
            </p>
          </div>
        </div>

        {/* Field konfirmasi teks */}
        <div>
          <label
            htmlFor="konfirmasi-hapus"
            className="mb-1.5 block text-body-md font-medium text-[var(--jernih-on-surface)]"
          >
            Ketik{" "}
            <code className="rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10 px-1.5 py-0.5 text-body-md font-mono text-[var(--jernih-error)]">
              {TEKS_KONFIRMASI_HAPUS}
            </code>{" "}
            untuk melanjutkan
            <span className="ml-1 text-[var(--jernih-error)]" aria-hidden="true">*</span>
          </label>
          <input
            id="konfirmasi-hapus"
            type="text"
            autoComplete="off"
            disabled={sedangMemproses}
            {...register("konfirmasi")}
            placeholder={TEKS_KONFIRMASI_HAPUS}
            className={`w-full rounded-[var(--jernih-radius-md)] border bg-[var(--jernih-surface)] px-3 py-2.5 text-body-md font-mono text-[var(--jernih-on-surface)] transition-colors duration-150 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
              errors.konfirmasi
                ? "border-[var(--jernih-error)] focus:border-[var(--jernih-error)]"
                : "border-[var(--jernih-neutral)]/30 focus:border-[var(--jernih-error)]"
            }`}
            aria-invalid={!!errors.konfirmasi}
            aria-describedby={errors.konfirmasi ? "error-konfirmasi" : undefined}
          />
          {errors.konfirmasi && (
            <p
              id="error-konfirmasi"
              className="mt-1.5 text-label-sm text-[var(--jernih-error)]"
              role="alert"
            >
              {errors.konfirmasi.message}
            </p>
          )}
        </div>

        {/* Field kata sandi */}
        <div>
          <label
            htmlFor="kata-sandi-hapus"
            className="mb-1.5 block text-body-md font-medium text-[var(--jernih-on-surface)]"
          >
            Kata sandi akun
            <span className="ml-1 text-[var(--jernih-error)]" aria-hidden="true">*</span>
          </label>
          <div className="relative">
            <input
              id="kata-sandi-hapus"
              type={tampilKataSandi ? "text" : "password"}
              autoComplete="current-password"
              disabled={sedangMemproses}
              {...register("kata_sandi")}
              className={`w-full rounded-[var(--jernih-radius-md)] border bg-[var(--jernih-surface)] px-3 py-2.5 pr-10 text-body-md text-[var(--jernih-on-surface)] transition-colors duration-150 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.kata_sandi
                  ? "border-[var(--jernih-error)] focus:border-[var(--jernih-error)]"
                  : "border-[var(--jernih-neutral)]/30 focus:border-[var(--jernih-error)]"
              }`}
              aria-invalid={!!errors.kata_sandi}
            />
            <button
              type="button"
              onClick={() => setTampilKataSandi((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--jernih-neutral)] hover:text-[var(--jernih-on-surface)]"
              aria-label={tampilKataSandi ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            >
              {tampilKataSandi ? (
                <EyeOff className="h-4 w-4" strokeWidth={1.5} />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={1.5} />
              )}
            </button>
          </div>
          {errors.kata_sandi && (
            <p className="mt-1.5 text-label-sm text-[var(--jernih-error)]" role="alert">
              {errors.kata_sandi.message}
            </p>
          )}
        </div>

        {/* Error server */}
        {status === "gagal" && pesanError && (
          <div
            className="flex items-center gap-2 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-error)]/30 bg-[var(--jernih-error)]/5 px-3 py-2.5"
            role="alert"
          >
            <AlertCircle
              className="h-4 w-4 shrink-0 text-[var(--jernih-error)]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <p className="text-body-md text-[var(--jernih-error)]">{pesanError}</p>
          </div>
        )}

        {/* Tombol aksi — destruktif, bukan btn-brutal (DESIGN.md) */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={sedangMemproses}
            className="inline-flex items-center gap-2 rounded-[var(--jernih-radius-md)] border-2 border-[var(--jernih-error)] bg-[var(--jernih-error)] px-5 py-2.5 text-body-md font-medium text-white transition-all duration-150 hover:bg-[var(--jernih-error)]/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            {sedangMemproses ? "Menghapus..." : "Hapus Akun Saya"}
          </button>
          <button
            type="button"
            onClick={onBatal}
            disabled={sedangMemproses}
            className="text-body-md text-[var(--jernih-neutral)] underline-offset-2 hover:text-[var(--jernih-on-surface)] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            Batal
          </button>
        </div>
      </motion.form>
    </AnimatePresence>
  );
}