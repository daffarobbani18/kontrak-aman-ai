import Link from "next/link";
import { Upload, Zap, FileText } from "lucide-react";

// Hero section landing page KontrakAman AI
// Inspirasi: GitHub landing — headline besar + subheadline + CTA + visual demonstrasi
export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--jernih-surface)] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Teks utama */}
          <div className="flex flex-col gap-6">
            {/* Label atas */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--jernih-primary)]/30 bg-[var(--jernih-primary)]/8 px-3 py-1">
              <span
                className="h-2 w-2 rounded-full bg-[var(--jernih-primary)]"
                aria-hidden="true"
              />
              <span className="text-label-sm font-medium text-[var(--jernih-primary)]">
                Gratis untuk memulai — tanpa kartu kredit
              </span>
            </div>

            {/* Headline utama — Space Grotesk 700 sesuai DESIGN.md */}
            <h1 className="text-headline-lg text-[var(--jernih-on-surface)] sm:text-4xl sm:leading-tight lg:text-5xl lg:leading-tight">
              Kontrak freelance-mu aman?{" "}
              <span className="text-[var(--jernih-primary)]">
                Cek sekarang sebelum tanda tangan.
              </span>
            </h1>

            {/* Subheadline — Inter body-lg */}
            <p className="text-body-lg text-[var(--jernih-neutral)] lg:max-w-lg">
              Unggah foto atau PDF kontrak, dapatkan skor risiko instan, dan negosiasikan klausul
              jebakan dengan draf siap pakai. Dalam bahasa yang kamu mengerti, bukan bahasa
              pengacara.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* CTA primer — neo-brutalism */}
              <Link
                href="/daftar"
                className="btn-brutal inline-flex items-center justify-center gap-2 px-6 py-3 text-body-md font-medium"
              >
                <Upload className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                Mulai Audit Gratis
              </Link>

              {/* CTA sekunder — flat */}
              <a
                href="#cara-kerja"
                className="inline-flex items-center justify-center gap-2 rounded-[var(--jernih-radius-md)] px-6 py-3 text-body-md font-medium text-[var(--jernih-on-surface)] transition-colors duration-150 hover:bg-[var(--jernih-on-surface)]/5"
              >
                Lihat cara kerjanya
              </a>
            </div>

            {/* Statistik sosial proof */}
            <div className="flex flex-wrap gap-6 border-t border-[var(--jernih-neutral)]/20 pt-6">
              <div>
                <p className="text-headline-md text-[var(--jernih-primary)]">10.000+</p>
                <p className="text-label-sm text-[var(--jernih-neutral)]">Kontrak diaudit</p>
              </div>
              <div>
                <p className="text-headline-md text-[var(--jernih-primary)]">&lt; 60 detik</p>
                <p className="text-label-sm text-[var(--jernih-neutral)]">
                  Waktu analisis rata-rata
                </p>
              </div>
              <div>
                <p className="text-headline-md text-[var(--jernih-primary)]">Gratis</p>
                <p className="text-label-sm text-[var(--jernih-neutral)]">Untuk memulai</p>
              </div>
            </div>
          </div>

          {/* Visual demonstrasi — mockup kartu hasil audit */}
          <div className="relative flex justify-center lg:justify-end" aria-hidden="true">
            <div className="w-full max-w-sm rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-6">
              {/* Header kartu */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[var(--jernih-neutral)]" strokeWidth={1.5} />
                  <span className="text-body-md font-medium text-[var(--jernih-on-surface)]">
                    kontrak-desain-web.pdf
                  </span>
                </div>
                {/* Badge skor risiko kuning — menggunakan token warna risiko */}
                <span className="badge-risiko-kuning px-2 py-0.5 text-label-sm font-medium">
                  Risiko Sedang
                </span>
              </div>

              {/* Ringkasan */}
              <p className="mb-4 text-body-md text-[var(--jernih-neutral)]">
                Ditemukan 3 klausul yang perlu diperhatikan sebelum kamu tanda tangan.
              </p>

              {/* Daftar klausul contoh */}
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 rounded-[var(--jernih-radius-md)] bg-[var(--jernih-surface)] p-3">
                  <span className="badge-risiko-merah mt-0.5 shrink-0 px-1.5 py-0.5 text-label-sm font-medium">
                    Merah
                  </span>
                  <div>
                    <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
                      Denda tanpa batas maksimum
                    </p>
                    <p className="text-label-sm text-[var(--jernih-neutral)]">
                      Klausul 5 — Keterlambatan
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-[var(--jernih-radius-md)] bg-[var(--jernih-surface)] p-3">
                  <span className="badge-risiko-kuning mt-0.5 shrink-0 px-1.5 py-0.5 text-label-sm font-medium">
                    Kuning
                  </span>
                  <div>
                    <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
                      Hak cipta berpindah sebelum lunas
                    </p>
                    <p className="text-label-sm text-[var(--jernih-neutral)]">
                      Klausul 8 — Kepemilikan Karya
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-[var(--jernih-radius-md)] bg-[var(--jernih-surface)] p-3">
                  <span className="badge-risiko-hijau mt-0.5 shrink-0 px-1.5 py-0.5 text-label-sm font-medium">
                    Hijau
                  </span>
                  <div>
                    <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
                      Termin pembayaran jelas
                    </p>
                    <p className="text-label-sm text-[var(--jernih-neutral)]">
                      Klausul 3 — Pembayaran
                    </p>
                  </div>
                </div>
              </div>

              {/* Tombol aksi dalam kartu */}
              <div className="mt-4 flex items-center gap-2">
                <Zap
                  className="h-4 w-4 text-[var(--jernih-primary)]"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span className="text-label-sm font-medium text-[var(--jernih-primary)]">
                  Draf negosiasi siap dibuat
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
