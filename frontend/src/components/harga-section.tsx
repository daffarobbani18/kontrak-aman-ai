import Link from "next/link";
import { Check } from "lucide-react";

// Paket harga sesuai api.md endpoint GET /langganan/paket
// Harga: Gratis / Pro Rp99.000 / Bisnis Rp299.000
const paketHarga = [
  {
    id: "pkg_gratis",
    nama: "Gratis",
    harga: "Rp0",
    periode: "selamanya",
    deskripsi: "Untuk mencoba dan memahami kontrakmu pertama kali.",
    fitur: [
      "Kuota audit bulanan terbatas",
      "Skor risiko Hijau / Kuning / Merah",
      "Penjelasan klausul bahasa awam",
      "Riwayat kontrak tersimpan",
    ],
    cta: "Mulai Gratis",
    href: "/daftar",
    unggulan: false,
  },
  {
    id: "pkg_pro",
    nama: "Pro",
    harga: "Rp99.000",
    periode: "per bulan",
    deskripsi: "Untuk freelancer aktif yang rutin menerima kontrak baru.",
    fitur: [
      "Audit kontrak tidak terbatas",
      "Draf negosiasi tidak terbatas",
      "3 versi draf: sopan, profesional, tegas",
      "Ekspor PDF dan Word",
      "Notifikasi email hasil audit",
      "Semua fitur Gratis",
    ],
    cta: "Mulai Pro",
    href: "/daftar",
    unggulan: true,
  },
  {
    id: "pkg_bisnis",
    nama: "Bisnis",
    harga: "Rp299.000",
    periode: "per bulan",
    deskripsi: "Untuk tim kecil atau agensi yang mengelola banyak kontrak.",
    fitur: [
      "Semua fitur Pro",
      "Multi-pengguna dalam satu akun",
      "Prioritas dukungan",
      "Akses lebih awal ke fitur baru",
    ],
    cta: "Mulai Bisnis",
    href: "/daftar",
    unggulan: false,
  },
];

export default function HargaSection() {
  return (
    <section id="harga" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header section */}
        <div className="mb-12 text-center">
          <h2 className="text-headline-lg text-[var(--jernih-on-surface)]">
            Harga yang adil untuk pekerja lepas
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-body-lg text-[var(--jernih-neutral)]">
            Mulai gratis, upgrade kapan saja. Tidak ada kontrak jangka panjang — batalkan kapan
            saja.
          </p>
        </div>

        {/* Kartu harga */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {paketHarga.map((paket) => (
            <div
              key={paket.id}
              className={`relative flex flex-col rounded-[var(--jernih-radius-lg)] border p-6 ${
                paket.unggulan
                  ? "border-[var(--jernih-on-surface)] bg-[var(--jernih-surface)]"
                  : "border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)]"
              }`}
            >
              {/* Label unggulan — hanya untuk paket Pro */}
              {paket.unggulan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[var(--jernih-primary)] px-3 py-1 text-label-sm font-medium text-[var(--jernih-surface)]">
                    Paling Populer
                  </span>
                </div>
              )}

              {/* Info paket */}
              <div className="mb-6">
                <h3 className="text-headline-md text-[var(--jernih-on-surface)]">{paket.nama}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-headline-lg text-[var(--jernih-on-surface)]">
                    {paket.harga}
                  </span>
                  <span className="text-body-md text-[var(--jernih-neutral)]">{paket.periode}</span>
                </div>
                <p className="mt-2 text-body-md text-[var(--jernih-neutral)]">{paket.deskripsi}</p>
              </div>

              {/* Daftar fitur */}
              <ul className="mb-8 flex flex-col gap-3" aria-label={`Fitur paket ${paket.nama}`}>
                {paket.fitur.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--jernih-primary)]"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    <span className="text-body-md text-[var(--jernih-on-surface)]">{item}</span>
                  </li>
                ))}
              </ul>

              {/* Tombol CTA — primer untuk unggulan, sekunder untuk lainnya */}
              <div className="mt-auto">
                {paket.unggulan ? (
                  <Link
                    href={paket.href}
                    className="btn-brutal block w-full py-3 text-center text-body-md font-medium"
                  >
                    {paket.cta}
                  </Link>
                ) : (
                  <Link
                    href={paket.href}
                    className="block w-full rounded-[var(--jernih-radius-md)] border border-[var(--jernih-on-surface)]/20 py-3 text-center text-body-md font-medium text-[var(--jernih-on-surface)] transition-colors duration-150 hover:border-[var(--jernih-on-surface)]/40 hover:bg-[var(--jernih-on-surface)]/5"
                  >
                    {paket.cta}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
