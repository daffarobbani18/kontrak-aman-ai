"use client";

// ============================================================
// FormUbahKataSandi — ubah kata sandi pengguna yang sudah login
// POST /pengguna/saya/ubah-kata-sandi (api.md 5.3)
// DESIGN.md: input flat, btn-brutal, feedback inline
// ============================================================

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { skemaUbahKataSandi, type TipeUbahKataSandi } from "../types";
import type { StatusForm } from "../types";

interface PropFormUbahKataSandi {
  status: StatusForm;
  pesanError: string | null;
  onSimpan: (
    kataSandiLama: string,
    kataSandiBaru: string,
    konfirmasi: string
  ) => void;
  onReset: () => void;
}

export function FormUbahKataSandi({
  status,
  pesanError,
  onSimpan,
  onReset,
}: PropFormUbahKataSandi) {
  const sedangMenyimpan = status === "menyimpan";
  const tersimpan = status === "tersimpan";

  const [tampilLama, setTampilLama] = useState(false);
  const [tampilBaru, setTampilBaru] = useState(false);
  const [tampilKonfirmasi, setTampilKonfirmasi] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TipeUbahKataSandi>({
    resolver: zodResolver(skemaUbahKataSandi),
  });

  // Reset form setelah berhasil
  useEffect(() => {
    if (tersimpan) {
      reset();
      setTampilLama(false);
      setTampilBaru(false);
      setTampilKonfirmasi(false);
    }
  }, [tersimpan, reset]);

  const onSubmit = (data: TipeUbahKataSandi) => {
    onSimpan(
      data.kata_sandi_lama,
      data.kata_sandi_baru,
      data.konfirmasi_kata_sandi_baru
    );
  };

  return (
    <div className="rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-6">
      <h2
        className="mb-4 text-headline-md text-[var(--jernih-on-surface)]"
        style={{ fontFamily: "var(--font-headline)" }}
      >
        Ubah Kata Sandi
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Kata sandi lama */}
        <div>
          <label
            htmlFor="kata-sandi-lama"
            className="mb-1.5 block text-body-md font-medium text-[var(--jernih-on-surface)]"
          >
            Kata Sandi Lama
            <span className="ml-1 text-[var(--jernih-error)]" aria-hidden="true">*</span>
          </label>
          <div className="relative">
            <input
              id="kata-sandi-lama"
              type={tampilLama ? "text" : "password"}
              autoComplete="current-password"
              disabled={sedangMenyimpan}
              {...register("kata_sandi_lama")}
              className={`w-full rounded-[var(--jernih-radius-md)] border bg-[var(--jernih-surface)] px-3 py-2.5 pr-10 text-body-md text-[var(--jernih-on-surface)] transition-colors duration-150 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.kata_sandi_lama
                  ? "border-[var(--jernih-error)] focus:border-[var(--jernih-error)]"
                  : "border-[var(--jernih-neutral)]/30 focus:border-[var(--jernih-primary)]"
              }`}
              aria-invalid={!!errors.kata_sandi_lama}
            />
            <button
              type="button"
              onClick={() => setTampilLama((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--jernih-neutral)] hover:text-[var(--jernih-on-surface)]"
              aria-label={tampilLama ? "Sembunyikan kata sandi lama" : "Tampilkan kata sandi lama"}
            >
              {tampilLama ? (
                <EyeOff className="h-4 w-4" strokeWidth={1.5} />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={1.5} />
              )}
            </button>
          </div>
          {errors.kata_sandi_lama && (
            <p className="mt-1.5 text-label-sm text-[var(--jernih-error)]" role="alert">
              {errors.kata_sandi_lama.message}
            </p>
          )}
        </div>

        {/* Kata sandi baru */}
        <div>
          <label
            htmlFor="kata-sandi-baru"
            className="mb-1.5 block text-body-md font-medium text-[var(--jernih-on-surface)]"
          >
            Kata Sandi Baru
            <span className="ml-1 text-[var(--jernih-error)]" aria-hidden="true">*</span>
          </label>
          <div className="relative">
            <input
              id="kata-sandi-baru"
              type={tampilBaru ? "text" : "password"}
              autoComplete="new-password"
              disabled={sedangMenyimpan}
              {...register("kata_sandi_baru")}
              className={`w-full rounded-[var(--jernih-radius-md)] border bg-[var(--jernih-surface)] px-3 py-2.5 pr-10 text-body-md text-[var(--jernih-on-surface)] transition-colors duration-150 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.kata_sandi_baru
                  ? "border-[var(--jernih-error)] focus:border-[var(--jernih-error)]"
                  : "border-[var(--jernih-neutral)]/30 focus:border-[var(--jernih-primary)]"
              }`}
              aria-invalid={!!errors.kata_sandi_baru}
            />
            <button
              type="button"
              onClick={() => setTampilBaru((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--jernih-neutral)] hover:text-[var(--jernih-on-surface)]"
              aria-label={tampilBaru ? "Sembunyikan kata sandi baru" : "Tampilkan kata sandi baru"}
            >
              {tampilBaru ? (
                <EyeOff className="h-4 w-4" strokeWidth={1.5} />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={1.5} />
              )}
            </button>
          </div>
          {errors.kata_sandi_baru && (
            <p className="mt-1.5 text-label-sm text-[var(--jernih-error)]" role="alert">
              {errors.kata_sandi_baru.message}
            </p>
          )}
          <p className="mt-1 text-label-sm text-[var(--jernih-neutral)]">
            Min. 8 karakter, 1 huruf besar, 1 angka, 1 simbol
          </p>
        </div>

        {/* Konfirmasi kata sandi baru */}
        <div>
          <label
            htmlFor="konfirmasi-kata-sandi"
            className="mb-1.5 block text-body-md font-medium text-[var(--jernih-on-surface)]"
          >
            Konfirmasi Kata Sandi Baru
            <span className="ml-1 text-[var(--jernih-error)]" aria-hidden="true">*</span>
          </label>
          <div className="relative">
            <input
              id="konfirmasi-kata-sandi"
              type={tampilKonfirmasi ? "text" : "password"}
              autoComplete="new-password"
              disabled={sedangMenyimpan}
              {...register("konfirmasi_kata_sandi_baru")}
              className={`w-full rounded-[var(--jernih-radius-md)] border bg-[var(--jernih-surface)] px-3 py-2.5 pr-10 text-body-md text-[var(--jernih-on-surface)] transition-colors duration-150 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.konfirmasi_kata_sandi_baru
                  ? "border-[var(--jernih-error)] focus:border-[var(--jernih-error)]"
                  : "border-[var(--jernih-neutral)]/30 focus:border-[var(--jernih-primary)]"
              }`}
              aria-invalid={!!errors.konfirmasi_kata_sandi_baru}
            />
            <button
              type="button"
              onClick={() => setTampilKonfirmasi((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--jernih-neutral)] hover:text-[var(--jernih-on-surface)]"
              aria-label={tampilKonfirmasi ? "Sembunyikan konfirmasi" : "Tampilkan konfirmasi"}
            >
              {tampilKonfirmasi ? (
                <EyeOff className="h-4 w-4" strokeWidth={1.5} />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={1.5} />
              )}
            </button>
          </div>
          {errors.konfirmasi_kata_sandi_baru && (
            <p className="mt-1.5 text-label-sm text-[var(--jernih-error)]" role="alert">
              {errors.konfirmasi_kata_sandi_baru.message}
            </p>
          )}
        </div>

        {/* Feedback error server */}
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

        {/* Feedback sukses */}
        {tersimpan && (
          <div
            className="flex items-center gap-2 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-success)]/30 bg-[var(--jernih-success)]/5 px-3 py-2.5"
            role="status"
          >
            <CheckCircle
              className="h-4 w-4 shrink-0 text-[var(--jernih-success)]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <p className="text-body-md text-[var(--jernih-success)]">
              Kata sandi berhasil diubah.
            </p>
          </div>
        )}

        {/* Tombol */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={sedangMenyimpan}
            className="btn-brutal px-5 py-2.5 text-body-md font-medium disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
          >
            {sedangMenyimpan ? "Menyimpan..." : "Ubah Kata Sandi"}
          </button>
          {status === "gagal" && (
            <button
              type="button"
              onClick={onReset}
              className="text-body-md text-[var(--jernih-neutral)] hover:text-[var(--jernih-on-surface)] hover:underline"
            >
              Batal
            </button>
          )}
        </div>
      </form>
    </div>
  );
}