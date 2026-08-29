"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useLupaKataSandi } from "@/features/autentikasi/hooks/use-lupa-kata-sandi";

// ============================================================
// FormLupaKataSandi — UI form lupa kata sandi
// Endpoint: POST /auth/lupa-kata-sandi (api.md 4.7)
// Respons selalu generik — tidak bocorkan status email
// ============================================================
export default function FormLupaKataSandi() {
  const { form, kirimLupaKataSandi, sedangMemuat, pesanKesalahan, status } = useLupaKataSandi();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  // Tampilkan konfirmasi setelah submit — pesan generik sesuai api.md 4.7
  if (status === "terkirim") {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--jernih-primary)_10%,transparent)]">
          <Mail
            className="h-8 w-8 text-[var(--jernih-primary)]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
        <div>
          <h2 className="text-headline-lg text-[var(--jernih-on-surface)]">Cek emailmu</h2>
          <p className="mt-2 text-body-md text-[var(--jernih-neutral)]">
            Jika email tersebut terdaftar, kami telah mengirimkan instruksi reset kata sandi.
            Silakan cek kotak masuk dan folder spam.
          </p>
        </div>
        <Link href="/masuk" className="text-body-md text-[var(--jernih-primary)] hover:underline">
          Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Judul */}
      <div>
        <h1 className="text-headline-lg text-[var(--jernih-on-surface)]">Lupa kata sandi?</h1>
        <p className="mt-1 text-body-md text-[var(--jernih-neutral)]">
          Masukkan emailmu dan kami akan mengirimkan instruksi untuk mengatur ulang kata sandi.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(kirimLupaKataSandi)} noValidate className="flex flex-col gap-4">
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

        {/* Tombol submit */}
        <button
          type="submit"
          disabled={sedangMemuat}
          className="btn-brutal mt-2 w-full py-3 text-body-md font-medium disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sedangMemuat ? "Mengirim instruksi..." : "Kirim Instruksi Reset"}
        </button>
      </form>

      {/* Link kembali */}
      <p className="text-center text-body-md text-[var(--jernih-neutral)]">
        <Link href="/masuk" className="text-[var(--jernih-primary)] hover:underline">
          Kembali ke halaman masuk
        </Link>
      </p>
    </div>
  );
}
