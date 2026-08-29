import Link from "next/link";
import { FileSearch } from "lucide-react";

// ============================================================
// EmptyStateKontrak — tampilan saat belum ada kontrak diaudit
// Sesuai DESIGN.md — empty state pakai ilustrasi bermakna
// PRD F-DASH-01 — tampilkan CTA untuk mulai audit pertama
// ============================================================
export default function EmptyStateKontrak() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      {/* Ikon placeholder — akan diganti dotLottie saat tersedia */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--jernih-primary)]/8">
        <FileSearch
          className="h-10 w-10 text-[var(--jernih-primary)]"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>

      <div className="max-w-xs">
        <h3
          className="text-headline-md text-[var(--jernih-on-surface)]"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Belum ada kontrak diaudit
        </h3>
        <p className="mt-2 text-body-md text-[var(--jernih-neutral)]">
          Unggah kontrak pertamamu dan dapatkan skor risiko dalam kurang dari 60 detik.
        </p>
      </div>

      <Link
        href="/unggah"
        className="btn-brutal inline-flex items-center px-6 py-3 text-body-md font-medium"
      >
        Audit Kontrak Pertama
      </Link>
    </div>
  );
}
