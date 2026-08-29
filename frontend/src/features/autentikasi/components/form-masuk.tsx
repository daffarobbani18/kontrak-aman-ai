"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Globe } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMasuk } from "@/features/autentikasi/hooks/use-masuk";
import { masukDenganGoogle } from "@/features/autentikasi/services/autentikasi.service";

// ============================================================
// FormMasuk — UI form halaman masuk
// Endpoint: POST /auth/masuk + GET /auth/google (api.md 4.3, 4.4)
// ============================================================
export default function FormMasuk() {
  const { form, kirimMasuk, sedangMemuat, pesanKesalahan } = useMasuk();
  const [tampilKataSandi, setTampilKataSandi] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div className="flex flex-col gap-6">
      {/* Judul */}
      <div>
        <h1 className="text-headline-lg text-[var(--jernih-on-surface)]">Selamat datang kembali</h1>
        <p className="mt-1 text-body-md text-[var(--jernih-neutral)]">
          Masuk untuk melanjutkan audit kontrakmu.
        </p>
      </div>

      {/* Tombol Google OAuth — GET /auth/google */}
      <button
        type="button"
        onClick={masukDenganGoogle}
        className="flex w-full items-center justify-center gap-3 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-neutral)]/30 bg-[var(--jernih-surface)] px-4 py-3 text-body-md font-medium text-[var(--jernih-on-surface)] transition-colors duration-150 hover:border-[var(--jernih-neutral)]/50 hover:bg-[var(--jernih-on-surface)]/5"
      >
        <Globe className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
        Masuk dengan Google
      </button>

      {/* Pemisah */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--jernih-neutral)]/20" />
        <span className="text-label-sm text-[var(--jernih-neutral)]">atau</span>
        <div className="h-px flex-1 bg-[var(--jernih-neutral)]/20" />
      </div>

      {/* Form email + kata sandi */}
      <form onSubmit={handleSubmit(kirimMasuk)} noValidate className="flex flex-col gap-4">
        {/* Pesan kesalahan level form */}
        {pesanKesalahan && (
          <div
            role="alert"
            className="rounded-[var(--jernih-radius-md)] border border-[var(--jernih-error)]/30 bg-[color-mix(in_srgb,var(--jernih-error)_5%,transparent)] px-4 py-3"
          >
            <p className="text-body-md text-[var(--jernih-error)]">{pesanKesalahan}</p>
          </div>
        )}

        {/* Field email */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="email"
            className="text-body-md font-medium text-[var(--jernih-on-surface)]"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="nama@email.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={`rounded-[var(--jernih-radius-sm)] border text-body-md ${
              errors.email
                ? "border-[var(--jernih-error)] focus-visible:ring-[var(--jernih-error)]"
                : "border-[var(--jernih-neutral)]/40 focus-visible:border-[var(--jernih-primary)] focus-visible:ring-[var(--jernih-primary)]"
            }`}
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" className="text-label-sm text-[var(--jernih-error)]" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Field kata sandi dengan toggle show/hide */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="kata_sandi"
              className="text-body-md font-medium text-[var(--jernih-on-surface)]"
            >
              Kata Sandi
            </Label>
            <Link
              href="/lupa-kata-sandi"
              className="text-label-sm text-[var(--jernih-primary)] hover:underline"
            >
              Lupa kata sandi?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="kata_sandi"
              type={tampilKataSandi ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Masukkan kata sandi"
              aria-invalid={!!errors.kata_sandi}
              aria-describedby={errors.kata_sandi ? "kata-sandi-error" : undefined}
              className={`rounded-[var(--jernih-radius-sm)] border pr-10 text-body-md ${
                errors.kata_sandi
                  ? "border-[var(--jernih-error)] focus-visible:ring-[var(--jernih-error)]"
                  : "border-[var(--jernih-neutral)]/40 focus-visible:border-[var(--jernih-primary)] focus-visible:ring-[var(--jernih-primary)]"
              }`}
              {...register("kata_sandi")}
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
          {errors.kata_sandi && (
            <p
              id="kata-sandi-error"
              className="text-label-sm text-[var(--jernih-error)]"
              role="alert"
            >
              {errors.kata_sandi.message}
            </p>
          )}
        </div>

        {/* Tombol submit — neo-brutalism primer */}
        <button
          type="submit"
          disabled={sedangMemuat}
          className="btn-brutal mt-2 w-full py-3 text-body-md font-medium disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sedangMemuat ? "Sedang masuk..." : "Masuk"}
        </button>
      </form>

      {/* Link daftar */}
      <p className="text-center text-body-md text-[var(--jernih-neutral)]">
        Belum punya akun?{" "}
        <Link href="/daftar" className="text-[var(--jernih-primary)] hover:underline">
          Daftar gratis
        </Link>
      </p>
    </div>
  );
}
