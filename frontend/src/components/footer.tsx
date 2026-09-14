import Link from "next/link";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Footer — disclaimer hukum WAJIB ditampilkan sesuai F-EDU-01 PRD.md
// Disclaimer tidak boleh dihapus atau disembunyikan dalam kondisi apapun
export default function Footer() {
  return (
    <footer className="border-t border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Disclaimer hukum — F-EDU-01, TIDAK BOLEH DIHAPUS */}
        <div className="mb-10 flex items-start gap-3 rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-on-surface)]/[0.02] p-4">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--jernih-neutral)]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="text-body-md text-[var(--jernih-neutral)]">
            <span className="font-medium text-[var(--jernih-on-surface)]">
              KontrakAman AI bukan pengganti nasihat hukum profesional.
            </span>{" "}
            Hasil analisis dan draf negosiasi yang dihasilkan adalah alat bantu edukasi dan
            referensi, bukan keputusan hukum final yang mengikat. Untuk kontrak bernilai tinggi atau
            situasi hukum yang kompleks, konsultasikan dengan advokat atau konsultan hukum
            berlisensi.
          </p>
        </div>

        {/* Navigasi footer */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 font-headline font-bold text-[var(--jernih-on-surface)]"
              aria-label="KontrakAman AI — Beranda"
            >
              <ShieldCheck
                className="h-5 w-5 text-[var(--jernih-primary)]"
                strokeWidth={2}
                aria-hidden="true"
              />
              <span className="text-body-lg font-semibold">KontrakAman AI</span>
            </Link>
            <p className="mt-2 text-body-md text-[var(--jernih-neutral)]">
              Audit kontrak freelance dengan AI. Untuk pekerja gig Indonesia.
            </p>
          </div>

          {/* Produk */}
          <div>
            <h3 className="text-label-sm font-medium uppercase tracking-wider text-[var(--jernih-neutral)]">
              Produk
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <a
                  href="#cara-kerja"
                  className="text-body-md text-[var(--jernih-on-surface)]/70 transition-colors hover:text-[var(--jernih-on-surface)]"
                >
                  Cara Kerja
                </a>
              </li>
              <li>
                <a
                  href="#harga"
                  className="text-body-md text-[var(--jernih-on-surface)]/70 transition-colors hover:text-[var(--jernih-on-surface)]"
                >
                  Harga
                </a>
              </li>
              <li>
                <Link
                  href="/daftar"
                  className="text-body-md text-[var(--jernih-on-surface)]/70 transition-colors hover:text-[var(--jernih-on-surface)]"
                >
                  Daftar Gratis
                </Link>
              </li>
            </ul>
          </div>

          {/* Akun */}
          <div>
            <h3 className="text-label-sm font-medium uppercase tracking-wider text-[var(--jernih-neutral)]">
              Akun
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <Link
                  href="/masuk"
                  className="text-body-md text-[var(--jernih-on-surface)]/70 transition-colors hover:text-[var(--jernih-on-surface)]"
                >
                  Masuk
                </Link>
              </li>
              <li>
                <Link
                  href="/daftar"
                  className="text-body-md text-[var(--jernih-on-surface)]/70 transition-colors hover:text-[var(--jernih-on-surface)]"
                >
                  Buat Akun
                </Link>
              </li>
            </ul>
          </div>

          {/* Hukum */}
          <div>
            <h3 className="text-label-sm font-medium uppercase tracking-wider text-[var(--jernih-neutral)]">
              Hukum
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <Link
                  href="/privasi"
                  className="text-body-md text-[var(--jernih-on-surface)]/70 transition-colors hover:text-[var(--jernih-on-surface)]"
                >
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link
                  href="/syarat"
                  className="text-body-md text-[var(--jernih-on-surface)]/70 transition-colors hover:text-[var(--jernih-on-surface)]"
                >
                  Syarat Penggunaan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-[var(--jernih-neutral)]/20" />

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-label-sm text-[var(--jernih-neutral)]">
            &copy; {new Date().getFullYear()} KontrakAman AI. Hak cipta dilindungi.
          </p>
          <p className="text-label-sm text-[var(--jernih-neutral)]">
            Dibuat untuk pekerja gig Indonesia 🇮🇩
          </p>
        </div>
      </div>
    </footer>
  );
}
