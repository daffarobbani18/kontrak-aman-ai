"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useResetKataSandi } from "@/features/autentikasi/hooks/use-reset-kata-sandi";

// ============================================================
// FormResetKataSandi — UI form reset kata sandi
// Endpoint: POST /auth/reset-kata-sandi (api.md 4.8)
// Token dibaca dari query param URL, berlaku 1 jam sekali pakai
// ============================================================
interface PropFormResetKataSandi {
  token: string;
}

export default function FormResetKataSandi({ token }: PropFormResetKataSandi) {
  const { form, kirimResetKataSandi, sedangMemuat, pesanKesalahan, status } =
    useResetKataSandi(token);
  const [tampilKataSandi, setTampilKataSandi] = useState(false);
  const [tampilKonfirmasi, setTampilKonfirmasi] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  // Token tidak valid atau tidak ada di URL
  if (status === "token-tidak-valid") {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--jernih-error)_10%,transparent)]">
          <AlertTriangle
            className="h-8 w-8 text-[var(--jernih-error)]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
        <div>
          <h2 className="text-headline-lg text-[var(--jernih-on-surface)]">Tautan tidak valid</h2>
          <p className="mt-2 text-body-md text-[var(--jernih-neutral)]">
            Tautan reset kata sandi ini sudah kedaluwarsa atau sudah pernah digunakan. Tautan hanya
            berlaku selama 1 jam.
          </p>
        </div>
        <Link
          href="/lupa-kata-sandi"
          className="btn-brutal inline-flex items-center px-6 py-3 text-body-md font-medium"
        >
          Minta tautan baru
        </Link>
        <Link href="/masuk" className="text-body-md text-[var(--jernih-primary)] hover:underline">
          Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  // Reset berhasil
  if (status === "berhasil") {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--jernih-success)_10%,transparent)]">
          <CheckCircle
            className="h-8 w-8 text-[var(--jernih-success)]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
        <div>
          <h2 className="text-headline-lg text-[var(--jernih-on-surface)]">
            Kata sandi berhasil diubah
          </h2>
          <p className="mt-2 text-body-md text-[var(--jernih-neutral)]">
            Kata sandimu sudah berhasil diperbarui. Silakan masuk dengan kata sandi baru.
          </p>
        </div>
        <Link
          href="/masuk"
          className="btn-brutal inline-flex items-center px-6 py-3 text-body-md font-medium"
        >
          Masuk sekarang
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Judul */}
      <div>
        <h1 className="text-headline-lg text-[var(--jernih-on-surface)]">Buat kata sandi baru</h1>
        <p className="mt-1 text-body-md text-[var(--jernih-neutral)]">
          Kata sandi baru harus berbeda dari kata sandi sebelumnya.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(kirimResetKataSandi)} noValidate className="flex flex-col gap-4">
        {/* Token tersembunyi — dikirim ke API */}
        <input type="hidden" {...register("token")} />

        {/* Pesan kesalahan level form */}
        {pesanKesalahan && (
          <div
            role="alert"
            className="rounded-[var(--jernih-radius-md)] border border-[var(--jernih-error)]/30 bg-[color-mix(in_srgb,var(--jernih-error)_5%,transparent)] px-4 py-3"
          >
            <p className="text-body-md text-[var(--jernih-error)]">{pesanKesalahan}</p>
          </div>
        )}

        {/* Field kata sandi baru */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="kata_sandi_baru"
            className="text-body-md font-medium text-[var(--jernih-on-surface)]"
          >
            Kata Sandi Baru
          </Label>
          <div className="relative">
            <Input
              id="kata_sandi_baru"
              type={tampilKataSandi ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 karakter, huruf besar, angka, simbol"
              aria-invalid={!!errors.kata_sandi_baru}
              aria-describedby={errors.kata_sandi_baru ? "kata-sandi-baru-error" : undefined}
              className={`rounded-[var(--jernih-radius-sm)] border pr-10 text-body-md ${
                errors.kata_sandi_baru
                  ? "border-[var(--jernih-error)] focus-visible:ring-[var(--jernih-error)]"
                  : "border-[var(--jernih-neutral)]/40 focus-visible:border-[var(--jernih-primary)] focus-visible:ring-[var(--jernih-primary)]"
              }`}
              {...register("kata_sandi_baru")}
            />
            <button
              type="button"
              onClick={() => setTampilKataSandi((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--jernih-neutral)] hover:text-[var(--jernih-on-surface)]"
              aria-label={tampilKataSandi ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            >
              {tampilKataSandi ? (
                <EyeOff className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.kata_sandi_baru && (
            <p
              id="kata-sandi-baru-error"
              className="text-label-sm text-[var(--jernih-error)]"
              role="alert"
            >
              {errors.kata_sandi_baru.message}
            </p>
          )}
        </div>

        {/* Field konfirmasi kata sandi baru */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="konfirmasi_kata_sandi_baru"
            className="text-body-md font-medium text-[var(--jernih-on-surface)]"
          >
            Konfirmasi Kata Sandi Baru
          </Label>
          <div className="relative">
            <Input
              id="konfirmasi_kata_sandi_baru"
              type={tampilKonfirmasi ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Ulangi kata sandi baru"
              aria-invalid={!!errors.konfirmasi_kata_sandi_baru}
              aria-describedby={
                errors.konfirmasi_kata_sandi_baru ? "konfirmasi-baru-error" : undefined
              }
              className={`rounded-[var(--jernih-radius-sm)] border pr-10 text-body-md ${
                errors.konfirmasi_kata_sandi_baru
                  ? "border-[var(--jernih-error)] focus-visible:ring-[var(--jernih-error)]"
                  : "border-[var(--jernih-neutral)]/40 focus-visible:border-[var(--jernih-primary)] focus-visible:ring-[var(--jernih-primary)]"
              }`}
              {...register("konfirmasi_kata_sandi_baru")}
            />
            <button
              type="button"
              onClick={() => setTampilKonfirmasi((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--jernih-neutral)] hover:text-[var(--jernih-on-surface)]"
              aria-label={
                tampilKonfirmasi
                  ? "Sembunyikan konfirmasi kata sandi"
                  : "Tampilkan konfirmasi kata sandi"
              }
            >
              {tampilKonfirmasi ? (
                <EyeOff className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.konfirmasi_kata_sandi_baru && (
            <p
              id="konfirmasi-baru-error"
              className="text-label-sm text-[var(--jernih-error)]"
              role="alert"
            >
              {errors.konfirmasi_kata_sandi_baru.message}
            </p>
          )}
        </div>

        {/* Tombol submit */}
        <button
          type="submit"
          disabled={sedangMemuat}
          className="btn-brutal mt-2 w-full py-3 text-body-md font-medium disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sedangMemuat ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
        </button>
      </form>
    </div>
  );
}
