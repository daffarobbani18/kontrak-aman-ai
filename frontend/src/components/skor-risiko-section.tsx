import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

// Demonstrasi visual skor risiko — mendidik pemula (Persona Sari, PRD Bagian 3)
// Warna risiko EKSKLUSIF untuk skor risiko, tidak untuk dekorasi (DESIGN.md)
const contohKlausul = [
  {
    skor: "merah" as const,
    label: "Risiko Tinggi",
    ikon: XCircle,
    judul: "Denda keterlambatan tanpa batas",
    kutipan:
      '"Freelancer wajib membayar denda 5% per hari dari total nilai proyek tanpa batas maksimum."',
    penjelasan:
      "Klausul ini bisa melebihi nilai proyekmu dalam hitungan minggu. Dalam proyek Rp10 juta, 20 hari terlambat berarti kamu berhutang Rp10 juta lagi.",
  },
  {
    skor: "kuning" as const,
    label: "Perlu Diperhatikan",
    ikon: AlertTriangle,
    judul: "Hak cipta berpindah sebelum lunas",
    kutipan: '"Seluruh hasil karya menjadi milik klien sejak pekerjaan dimulai."',
    penjelasan:
      "Jika klien tidak membayar, kamu sudah kehilangan hak atas karyamu. Hak cipta seharusnya berpindah hanya setelah pembayaran penuh.",
  },
  {
    skor: "hijau" as const,
    label: "Aman",
    ikon: CheckCircle,
    judul: "Termin pembayaran jelas",
    kutipan:
      '"Pembayaran dilakukan dalam 14 hari kerja setelah hasil kerja diterima dan disetujui."',
    penjelasan:
      "Klausul ini wajar dan melindungi kedua pihak. Batas waktu 14 hari kerja adalah standar industri yang umum.",
  },
];

const warnaKonfigurasi = {
  merah: {
    badgeClass: "badge-risiko-merah",
    bgClass: "bg-[color-mix(in_srgb,var(--jernih-error)_5%,transparent)]",
    borderClass: "border-[var(--jernih-error)]/20",
    ikonClass: "text-[var(--jernih-error)]",
  },
  kuning: {
    badgeClass: "badge-risiko-kuning",
    bgClass: "bg-[color-mix(in_srgb,var(--jernih-warning)_5%,transparent)]",
    borderClass: "border-[var(--jernih-warning)]/20",
    ikonClass: "text-[var(--jernih-warning)]",
  },
  hijau: {
    badgeClass: "badge-risiko-hijau",
    bgClass: "bg-[color-mix(in_srgb,var(--jernih-success)_5%,transparent)]",
    borderClass: "border-[var(--jernih-success)]/20",
    ikonClass: "text-[var(--jernih-success)]",
  },
};

export default function SkorRisikoSection() {
  return (
    <section className="bg-[var(--jernih-on-surface)]/[0.02] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header section */}
        <div className="mb-12 text-center">
          <h2 className="text-headline-lg text-[var(--jernih-on-surface)]">
            Tiga warna yang mengubah cara kamu membaca kontrak
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-body-lg text-[var(--jernih-neutral)]">
            Tidak perlu jadi ahli hukum. Merah artinya negosiasikan, kuning artinya perhatikan,
            hijau artinya aman.
          </p>
        </div>

        {/* Kartu contoh klausul */}
        <div className="flex flex-col gap-4">
          {contohKlausul.map((klausul) => {
            const Ikon = klausul.ikon;
            const warna = warnaKonfigurasi[klausul.skor];
            return (
              <div
                key={klausul.judul}
                className={`rounded-[var(--jernih-radius-lg)] border p-6 ${
                  warna.bgClass
                } ${warna.borderClass}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
                  {/* Badge + ikon */}
                  <div className="flex shrink-0 items-center gap-2">
                    <Ikon
                      className={`h-5 w-5 ${warna.ikonClass}`}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    <span className={`${warna.badgeClass} px-2 py-0.5 text-label-sm font-medium`}>
                      {klausul.label}
                    </span>
                  </div>

                  {/* Konten */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-headline-md text-[var(--jernih-on-surface)]">
                      {klausul.judul}
                    </h3>
                    {/* Kutipan klausul — body-lg sesuai DESIGN.md untuk teks yang dibaca lama */}
                    <blockquote className="text-body-lg italic text-[var(--jernih-neutral)]">
                      {klausul.kutipan}
                    </blockquote>
                    <p className="text-body-md text-[var(--jernih-on-surface)]">
                      {klausul.penjelasan}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
