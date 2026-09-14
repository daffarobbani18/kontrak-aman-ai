"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Globe, CheckCircle, ArrowLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useDaftar } from "@/features/autentikasi/hooks/use-daftar";
import { masukDenganGoogle } from "@/features/autentikasi/services/autentikasi.service";

// ============================================================
// FormDaftar — UI form halaman registrasi
// Endpoint: POST /auth/daftar + GET /auth/google (api.md 4.1, 4.4)
// Checkbox persetujuan kebijakan privasi wajib (F-PRIV-01 PRD)
// ============================================================
export default function FormDaftar() {
  const { form, kirimDaftar, sedangMemuat, pesanKesalahan, status, emailTerdaftar } = useDaftar();
  const [tampilKataSandi, setTampilKataSandi] = useState(false);
  const [tampilKonfirmasi, setTampilKonfirmasi] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const nilaiSetuju = watch("setuju_kebijakan_privasi");
  const [langkah, setLangkah] = useState<1 | 2>(1);

  // Validasi langkah 1 sebelum lanjut ke langkah 2
  async function lanjutKeLangkah2() {
    const valid = await form.trigger(["nama_lengkap", "email"]);
    if (valid) setLangkah(2);
  }

  // Tampilkan halaman sukses setelah daftar berhasil
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
          <h2 className="text-headline-lg text-[var(--jernih-on-surface)]">Cek emailmu!</h2>
          <p className="mt-2 text-body-md text-[var(--jernih-neutral)]">
            Kami mengirim tautan verifikasi ke{" "}
            <span className="font-medium text-[var(--jernih-on-surface)]">{emailTerdaftar}</span>.
            Klik tautan tersebut untuk mengaktifkan akunmu.
          </p>
        </div>
        <p className="text-body-md text-[var(--jernih-neutral)]">
          Sudah punya akun?{" "}
          <Link href="/masuk" className="text-[var(--jernih-primary)] hover:underline">
            Masuk sekarang
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Indikator langkah */}
      <div className="flex items-center gap-2">
        <div
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            langkah >= 1 ? "bg-[var(--jernih-primary)]" : "bg-[var(--jernih-neutral)]/20"
          }`}
        />
        <div
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            langkah >= 2 ? "bg-[var(--jernih-primary)]" : "bg-[var(--jernih-neutral)]/20"
          }`}
        />
      </div>

      {/* ============ LANGKAH 1: Identitas + Google ============ */}
      {langkah === 1 && (
        <div className="flex flex-col gap-6">
          {/* Judul */}
          <div>
            <p className="text-label-sm font-medium text-[var(--jernih-neutral)]">
              Langkah 1 dari 2
            </p>
            <h1 className="mt-1 text-headline-lg text-[var(--jernih-on-surface)]">
              Buat akun gratis
            </h1>
            <p className="mt-1 text-body-md text-[var(--jernih-neutral)]">
              Mulai audit kontrak pertamamu hari ini.
            </p>
          </div>

          {/* Tombol Google OAuth */}
          <button
            type="button"
            onClick={masukDenganGoogle}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-neutral)]/30 bg-[var(--jernih-surface)] px-4 py-2.5 text-body-md font-medium text-[var(--jernih-on-surface)] transition-colors duration-150 hover:border-[var(--jernih-neutral)]/50 hover:bg-[var(--jernih-on-surface)]/5"
          >
            <Globe className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span>Daftar dengan Google</span>
          </button>

          {/* Pemisah */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--jernih-neutral)]/20" />
            <span className="text-label-sm text-[var(--jernih-neutral)]">atau dengan email</span>
            <div className="h-px flex-1 bg-[var(--jernih-neutral)]/20" />
          </div>

          {/* Field nama + email */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="nama_lengkap"
                className="text-body-md font-medium text-[var(--jernih-on-surface)]"
              >
                Nama Lengkap
              </Label>
              <Input
                id="nama_lengkap"
                type="text"
                autoComplete="name"
                placeholder="Nama lengkapmu"
                aria-invalid={!!errors.nama_lengkap}
                aria-describedby={errors.nama_lengkap ? "nama-error" : undefined}
                className={`rounded-[var(--jernih-radius-sm)] border text-body-md ${
                  errors.nama_lengkap
                    ? "border-[var(--jernih-error)] focus-visible:ring-[var(--jernih-error)]"
                    : "border-[var(--jernih-neutral)]/40 focus-visible:border-[var(--jernih-primary)] focus-visible:ring-[var(--jernih-primary)]"
                }`}
                {...register("nama_lengkap")}
              />
              {errors.nama_lengkap && (
                <p
                  id="nama-error"
                  className="text-label-sm text-[var(--jernih-error)]"
                  role="alert"
                >
                  {errors.nama_lengkap.message}
                </p>
              )}
            </div>

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
                <p
                  id="email-error"
                  className="text-label-sm text-[var(--jernih-error)]"
                  role="alert"
                >
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Tombol lanjut */}
          <button
            type="button"
            onClick={lanjutKeLangkah2}
            className="btn-brutal w-full py-3 text-body-md font-medium"
          >
            Lanjut
          </button>

          {/* Link masuk */}
          <p className="text-center text-body-md text-[var(--jernih-neutral)]">
            Sudah punya akun?{" "}
            <Link href="/masuk" className="text-[var(--jernih-primary)] hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      )}

      {/* ============ LANGKAH 2: Kata Sandi + Kebijakan ============ */}
      {langkah === 2 && (
        <div className="flex flex-col gap-6">
          {/* Judul */}
          <div>
            <p className="text-label-sm font-medium text-[var(--jernih-neutral)]">
              Langkah 2 dari 2
            </p>
            <h1 className="mt-1 text-headline-lg text-[var(--jernih-on-surface)]">
              Buat kata sandi
            </h1>
            <p className="mt-1 text-body-md text-[var(--jernih-neutral)]">
              Kata sandi digunakan untuk masuk ke akunmu.
            </p>
          </div>

          <form onSubmit={handleSubmit(kirimDaftar)} noValidate className="flex flex-col gap-4">
            {/* Pesan kesalahan level form */}
            {pesanKesalahan && (
              <div
                role="alert"
                className="rounded-[var(--jernih-radius-md)] border border-[var(--jernih-error)]/30 bg-[color-mix(in_srgb,var(--jernih-error)_5%,transparent)] px-4 py-3"
              >
                <p className="text-body-md text-[var(--jernih-error)]">{pesanKesalahan}</p>
              </div>
            )}

            {/* Field kata sandi */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="kata_sandi"
                className="text-body-md font-medium text-[var(--jernih-on-surface)]"
              >
                Kata Sandi
              </Label>
              <div className="relative">
                <Input
                  id="kata_sandi"
                  type={tampilKataSandi ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 karakter, huruf besar, angka, simbol"
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

            {/* Field konfirmasi kata sandi */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="konfirmasi_kata_sandi"
                className="text-body-md font-medium text-[var(--jernih-on-surface)]"
              >
                Konfirmasi Kata Sandi
              </Label>
              <div className="relative">
                <Input
                  id="konfirmasi_kata_sandi"
                  type={tampilKonfirmasi ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Ulangi kata sandi"
                  aria-invalid={!!errors.konfirmasi_kata_sandi}
                  aria-describedby={errors.konfirmasi_kata_sandi ? "konfirmasi-error" : undefined}
                  className={`rounded-[var(--jernih-radius-sm)] border pr-10 text-body-md ${
                    errors.konfirmasi_kata_sandi
                      ? "border-[var(--jernih-error)] focus-visible:ring-[var(--jernih-error)]"
                      : "border-[var(--jernih-neutral)]/40 focus-visible:border-[var(--jernih-primary)] focus-visible:ring-[var(--jernih-primary)]"
                  }`}
                  {...register("konfirmasi_kata_sandi")}
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
              {errors.konfirmasi_kata_sandi && (
                <p
                  id="konfirmasi-error"
                  className="text-label-sm text-[var(--jernih-error)]"
                  role="alert"
                >
                  {errors.konfirmasi_kata_sandi.message}
                </p>
              )}
            </div>

            {/* Checkbox kebijakan privasi — F-PRIV-01 PRD wajib */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="setuju_kebijakan_privasi"
                  checked={nilaiSetuju}
                  onCheckedChange={(checked) =>
                    setValue("setuju_kebijakan_privasi", checked === true, {
                      shouldValidate: true,
                    })
                  }
                  aria-invalid={!!errors.setuju_kebijakan_privasi}
                  aria-describedby={errors.setuju_kebijakan_privasi ? "privasi-error" : undefined}
                  className="mt-0.5 shrink-0"
                />
                <label
                  htmlFor="setuju_kebijakan_privasi"
                  className="cursor-pointer text-body-md text-[var(--jernih-neutral)]"
                >
                  Saya menyetujui{" "}
                  <Link href="/privasi" className="text-[var(--jernih-primary)] hover:underline">
                    Kebijakan Privasi
                  </Link>{" "}
                  dan memahami cara data saya diproses.
                </label>
              </div>
              {errors.setuju_kebijakan_privasi && (
                <p
                  id="privasi-error"
                  className="text-label-sm text-[var(--jernih-error)]"
                  role="alert"
                >
                  {errors.setuju_kebijakan_privasi.message}
                </p>
              )}
            </div>

            {/* Tombol submit + kembali */}
            <div className="flex flex-col gap-3 pt-1">
              <button
                type="submit"
                disabled={sedangMemuat}
                className="btn-brutal w-full py-3 text-body-md font-medium disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sedangMemuat ? "Membuat akun..." : "Buat Akun Gratis"}
              </button>
              <button
                type="button"
                onClick={() => setLangkah(1)}
                className="flex items-center justify-center gap-1.5 text-body-md text-[var(--jernih-neutral)] hover:text-[var(--jernih-on-surface)]"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                Kembali
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
