import type { Metadata } from "next";
import { FormUnggah } from "@/features/dokumen-kontrak/components/form-unggah";

export const metadata: Metadata = {
  title: "Unggah Kontrak — KontrakAman AI",
  description: "Unggah kontrak kerja untuk diaudit oleh AI dan dapatkan skor risiko instan.",
};

// Halaman unggah kontrak — F-DOC-01 (PDF) dan F-DOC-02 (foto/OCR) PRD.md
// Layout satu kolom max-w-2xl: dokumen hukum tidak perlu lebar penuh (DESIGN.md)
export default function HalamanUnggah() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Header halaman */}
      <div className="mb-8">
        <h1
          className="text-headline-lg text-[var(--jernih-on-surface)]"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Unggah Kontrak
        </h1>
        <p className="mt-2 text-body-lg text-[var(--jernih-neutral)]">
          Unggah foto atau file PDF kontrakmu. AI akan menganalisis dan memberi
          skor risiko dalam hitungan menit.
        </p>
      </div>

      {/* Form unggah — semua logika ada di features/dokumen-kontrak */}
      <FormUnggah />
    </div>
  );
}
