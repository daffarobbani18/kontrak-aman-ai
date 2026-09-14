import Link from "next/link";
import { ShieldCheck } from "lucide-react";

// Navbar landing page — tombol Masuk dan Daftar mengarah ke halaman auth
export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-headline font-bold text-[var(--jernih-on-surface)]"
          aria-label="KontrakAman AI — Beranda"
        >
          <ShieldCheck
            className="h-6 w-6 text-[var(--jernih-primary)]"
            strokeWidth={2}
            aria-hidden="true"
          />
          <span className="text-headline-md">KontrakAman AI</span>
        </Link>

        {/* Navigasi kanan */}
        <nav className="flex items-center gap-3" aria-label="Navigasi utama">
          {/* Tombol Masuk — aksi sekunder, tanpa shadow brutal */}
          <Link
            href="/masuk"
            className="rounded-[var(--jernih-radius-md)] border border-[var(--jernih-on-surface)]/20 px-4 py-2 text-body-md font-medium text-[var(--jernih-on-surface)] transition-colors duration-150 hover:border-[var(--jernih-on-surface)]/40 hover:bg-[var(--jernih-on-surface)]/5"
          >
            Masuk
          </Link>

          {/* Tombol Daftar — aksi primer, neo-brutalism sesuai DESIGN.md */}
          <Link
            href="/daftar"
            className="btn-brutal inline-flex items-center px-4 py-2 text-body-md font-medium"
          >
            Daftar Gratis
          </Link>
        </nav>
      </div>
    </header>
  );
}
