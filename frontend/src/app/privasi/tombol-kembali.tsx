"use client";

// ============================================================
// TombolKembali — tombol kembali ke halaman sebelumnya
// Client Component karena butuh useRouter
// DESIGN.md: flat, warna neutral, ikon ArrowLeft Lucide
// ============================================================

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function TombolKembali() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-1.5 text-body-md text-[var(--jernih-neutral)] transition-colors duration-150 hover:text-[var(--jernih-on-surface)]"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
      Kembali
    </button>
  );
}