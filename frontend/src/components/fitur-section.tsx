import { ScanText, ShieldAlert, FileEdit, Bell, Lock, BookOpen } from "lucide-react";

// Daftar fitur utama — sesuai epic PRD.md Bagian 4
const fiturUtama = [
  {
    ikon: ScanText,
    judul: "Deteksi klausul jebakan otomatis",
    deskripsi:
      "AI kami membaca setiap pasal dan menandai klausul yang berpotensi merugikanmu — denda sepihak, pengalihan hak cipta dini, dan termin pembayaran tidak wajar.",
  },
  {
    ikon: ShieldAlert,
    judul: "Skor risiko Hijau, Kuning, Merah",
    deskripsi:
      "Tidak perlu baca semua pasal. Satu warna sudah cukup untuk tahu apakah kontrak ini aman, perlu diwaspadai, atau harus dinegosiasikan ulang.",
  },
  {
    ikon: FileEdit,
    judul: "Draf negosiasi siap kirim",
    deskripsi:
      "Tiga pilihan gaya — sopan, profesional, atau tegas. Salin dan kirim langsung ke klienmu tanpa perlu menyusun kalimat dari nol.",
  },
  {
    ikon: Bell,
    judul: "Notifikasi saat analisis selesai",
    deskripsi:
      "Tidak perlu menunggu di layar. Unggah kontrak, lakukan aktivitas lain, dan kami akan memberitahumu begitu analisis selesai.",
  },
  {
    ikon: Lock,
    judul: "Dokumenmu aman dan privat",
    deskripsi:
      "Kontrakmu dienkripsi dan hanya bisa diakses olehmu. Hapus kapan saja, atau atur agar otomatis terhapus setelah jangka waktu tertentu.",
  },
  {
    ikon: BookOpen,
    judul: "Edukasi bahasa hukum awam",
    deskripsi:
      "Setiap klausul bermasalah dijelaskan dalam bahasa sehari-hari. Kamu tidak hanya tahu ada masalah, tapi juga mengerti kenapa itu masalah.",
  },
];

export default function FiturSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header section */}
        <div className="mb-12 text-center">
          <h2 className="text-headline-lg text-[var(--jernih-on-surface)]">
            Semua yang kamu butuhkan sebelum tanda tangan
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-body-lg text-[var(--jernih-neutral)]">
            KontrakAman AI dirancang khusus untuk pekerja lepas — bukan untuk tim legal korporat.
          </p>
        </div>

        {/* Grid fitur — kartu flat sesuai DESIGN.md, shadow none */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {fiturUtama.map((fitur) => {
            const Ikon = fitur.ikon;
            return (
              <div
                key={fitur.judul}
                className="rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-6"
              >
                {/* Ikon — Lucide outline 20px sesuai DESIGN.md */}
                <div className="mb-4 inline-flex rounded-[var(--jernih-radius-md)] border border-[var(--jernih-neutral)]/20 p-2">
                  <Ikon
                    className="h-5 w-5 text-[var(--jernih-primary)]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </div>

                <h3 className="text-headline-md text-[var(--jernih-on-surface)]">{fitur.judul}</h3>
                <p className="mt-2 text-body-md text-[var(--jernih-neutral)]">{fitur.deskripsi}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
