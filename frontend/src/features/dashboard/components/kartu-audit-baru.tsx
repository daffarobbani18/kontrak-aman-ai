"use client";

import Link from "next/link";
import { Upload, ArrowRight } from "lucide-react";

// ============================================================
// KartuAuditBaru — tile CTA utama dashboard
// Entry point untuk Alur Kritikal 1 (PRD.md 4.11)
// Tombol neo-brutalism primer sesuai DESIGN.md
// ============================================================
export default function KartuAuditBaru() {
  return (
    <div className="flex h-full flex-col justify-between rounded-[var(--jernih-radius-lg)] border-2 border-[var(--jernih-on-surface)] bg-[var(--jernih-primary)] p-6">
      {/* Ikon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-[var(--jernih-radius-md)] bg-[var(--jernih-surface)]/10">
        <Upload
          className="h-6 w-6 text-[var(--jernih-surface)]"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>

      {/* Teks */}
      <div className="mt-4 flex flex-col gap-1">
        <h2
          className="text-headline-md text-[var(--jernih-surface)]"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Audit Kontrak Baru
        </h2>
        <p className="text-body-md text-[var(--jernih-surface)]/70">
          Unggah PDF atau foto kontrak dan dapatkan skor risiko dalam kurang dari 60 detik.
        </p>
      </div>

      {/* Tombol aksi */}
      <Link
        href="/unggah"
        className="mt-6 inline-flex items-center justify-between gap-2 rounded-[var(--jernih-radius-md)] border-2 border-[var(--jernih-surface)] bg-[var(--jernih-surface)] px-4 py-2.5 text-body-md font-medium text-[var(--jernih-primary)] transition-all duration-150 hover:bg-[var(--jernih-surface)]/90"
      >
        Mulai Audit
        <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      </Link>
    </div>
  );
}
