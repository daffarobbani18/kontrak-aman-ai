import Link from "next/link";
import { ShieldCheck } from "lucide-react";

// Layout bersama untuk semua halaman autentikasi
// Struktur dua kolom: branding kiri + form kanan (desktop)
// Satu kolom di mobile — form di atas, branding disederhanakan
interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--jernih-surface)] lg:flex-row">
      {/* Panel kiri — branding (hanya tampil di desktop) */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between bg-[var(--jernih-on-surface)] p-12">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="KontrakAman AI — Kembali ke beranda"
        >
          <ShieldCheck
            className="h-7 w-7 text-[var(--jernih-primary)]"
            strokeWidth={2}
            aria-hidden="true"
          />
          <span
            className="text-headline-md text-[var(--jernih-surface)]"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            KontrakAman AI
          </span>
        </Link>

        {/* Konten tengah */}
        <div className="flex flex-col gap-8">
          <div>
            <h2
              className="text-headline-lg text-[var(--jernih-surface)]"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Kontrakmu, hakmu.
              <br />
              <span className="text-[var(--jernih-primary)]">Pahami sebelum tanda tangan.</span>
            </h2>
            <p className="mt-4 text-body-lg text-[var(--jernih-surface)]/60">
              Ribuan freelancer sudah mengaudit kontrak mereka dan bernegosiasi dengan lebih percaya
              diri.
            </p>
          </div>

          {/* Contoh badge skor risiko — dekoratif, menampilkan value proposition */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-[var(--jernih-radius-md)] bg-[var(--jernih-surface)]/5 p-3">
              <span className="badge-risiko-merah shrink-0 px-2 py-0.5 text-label-sm font-medium">
                Merah
              </span>
              <p className="text-body-md text-[var(--jernih-surface)]/70">
                Denda 5% per hari tanpa batas maksimum
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-[var(--jernih-radius-md)] bg-[var(--jernih-surface)]/5 p-3">
              <span className="badge-risiko-kuning shrink-0 px-2 py-0.5 text-label-sm font-medium">
                Kuning
              </span>
              <p className="text-body-md text-[var(--jernih-surface)]/70">
                Hak cipta berpindah sebelum lunas
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-[var(--jernih-radius-md)] bg-[var(--jernih-surface)]/5 p-3">
              <span className="badge-risiko-hijau shrink-0 px-2 py-0.5 text-label-sm font-medium">
                Hijau
              </span>
              <p className="text-body-md text-[var(--jernih-surface)]/70">
                Termin pembayaran 14 hari kerja
              </p>
            </div>
          </div>
        </div>

        {/* Footer branding */}
        <p className="text-label-sm text-[var(--jernih-surface)]/40">
          &copy; {new Date().getFullYear()} KontrakAman AI
        </p>
      </div>

      {/* Panel kanan — form, bisa scroll jika konten panjang */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Header mobile — logo untuk layar kecil */}
        <div className="flex items-center justify-between border-b border-[var(--jernih-neutral)]/20 px-4 py-4 lg:hidden">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="KontrakAman AI — Kembali ke beranda"
          >
            <ShieldCheck
              className="h-5 w-5 text-[var(--jernih-primary)]"
              strokeWidth={2}
              aria-hidden="true"
            />
            <span
              className="text-body-lg font-semibold text-[var(--jernih-on-surface)]"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              KontrakAman AI
            </span>
          </Link>
          <Link
            href="/"
            className="text-body-md text-[var(--jernih-neutral)] hover:text-[var(--jernih-on-surface)]"
          >
            Kembali
          </Link>
        </div>

        {/* Konten form — padding vertikal cukup, tidak dipaksakan muat dalam satu layar */}
        <div className="flex min-h-full flex-1 items-start justify-center px-6 py-12 sm:px-10 lg:items-center">
          <div className="w-full max-w-lg">{children}</div>
        </div>
      </div>
    </div>
  );
}
