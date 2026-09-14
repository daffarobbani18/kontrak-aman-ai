"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { verifikasiEmail } from "@/features/autentikasi/services/autentikasi.service";
import { KesalahanAPI } from "@/lib/api-client";

// ============================================================
// KontenVerifikasiEmail — halaman verifikasi email
// Endpoint: GET /auth/verifikasi-email?token={token} (api.md 4.2)
// Langsung panggil API saat mount, tidak ada form
// Token hanya berlaku sekali
// ============================================================
interface PropKontenVerifikasiEmail {
  token: string;
}

type StatusVerifikasi = "memuat" | "berhasil" | "gagal" | "token-tidak-ada";

export default function KontenVerifikasiEmail({ token }: PropKontenVerifikasiEmail) {
  const [status, setStatus] = useState<StatusVerifikasi>(token ? "memuat" : "token-tidak-ada");
  const [pesanKesalahan, setPesanKesalahan] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    async function lakukanVerifikasi() {
      try {
        await verifikasiEmail(token);
        setStatus("berhasil");
      } catch (error) {
        if (error instanceof KesalahanAPI) {
          setPesanKesalahan(error.message);
        } else {
          setPesanKesalahan("Tidak dapat terhubung ke server. Coba lagi.");
        }
        setStatus("gagal");
      }
    }

    lakukanVerifikasi();
  }, [token]);

  // Status: sedang memverifikasi
  if (status === "memuat") {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <Loader2
          className="h-12 w-12 animate-spin text-[var(--jernih-primary)]"
          aria-hidden="true"
        />
        <div>
          <h1 className="text-headline-lg text-[var(--jernih-on-surface)]">
            Memverifikasi email...
          </h1>
          <p className="mt-2 text-body-md text-[var(--jernih-neutral)]">Mohon tunggu sebentar.</p>
        </div>
      </div>
    );
  }

  // Status: berhasil diverifikasi
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
          <h1 className="text-headline-lg text-[var(--jernih-on-surface)]">
            Email berhasil diverifikasi!
          </h1>
          <p className="mt-2 text-body-md text-[var(--jernih-neutral)]">
            Akunmu sudah aktif. Silakan masuk untuk mulai mengaudit kontrak.
          </p>
        </div>
        {/* Setelah verifikasi, arahkan ke /onboarding untuk F-PROF-01 PRD */}
        <Link
          href="/masuk"
          className="btn-brutal inline-flex items-center px-6 py-3 text-body-md font-medium"
        >
          Masuk &amp; Mulai Onboarding
        </Link>
      </div>
    );
  }

  // Status: token tidak ada di URL
  if (status === "token-tidak-ada") {
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
          <h1 className="text-headline-lg text-[var(--jernih-on-surface)]">Tautan tidak valid</h1>
          <p className="mt-2 text-body-md text-[var(--jernih-neutral)]">
            Tautan verifikasi ini tidak valid. Pastikan kamu membuka tautan langsung dari email
            verifikasi.
          </p>
        </div>
        <Link href="/masuk" className="text-body-md text-[var(--jernih-primary)] hover:underline">
          Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  // Status: gagal (token expired atau error lain)
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
        <h1 className="text-headline-lg text-[var(--jernih-on-surface)]">Verifikasi gagal</h1>
        <p className="mt-2 text-body-md text-[var(--jernih-neutral)]">
          {pesanKesalahan ?? "Tautan verifikasi sudah kedaluwarsa atau sudah pernah digunakan."}
        </p>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Link
          href="/masuk"
          className="btn-brutal inline-flex items-center px-6 py-3 text-body-md font-medium"
        >
          Kembali ke halaman masuk
        </Link>
      </div>
    </div>
  );
}
