import type { Metadata } from "next";
import { Shield, Clock, Lock, Trash2, Download, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import TombolKembali from "./tombol-kembali";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — KontrakAman AI",
  description:
    "Kebijakan privasi KontrakAman AI — cara kami mengumpulkan, memproses, dan melindungi data pribadimu sesuai UU Pelindungan Data Pribadi.",
};

// ============================================================
// Halaman Kebijakan Privasi — F-PRIV-01 PRD.md
// Bisa diakses sebelum login (link dari form daftar)
// Konten statis — tidak ada API endpoint
// DESIGN.md: satu kolom max-w-2xl, tipografi body-lg untuk teks panjang
// ============================================================

const SEKSI_PRIVASI = [
  {
    id: "pengumpulan-data",
    Ikon: FileText,
    judul: "Data yang Kami Kumpulkan",
    konten: [
      "Saat kamu mendaftar: nama lengkap, alamat email, dan kata sandi (disimpan dalam bentuk hash, tidak pernah dalam bentuk teks biasa).",
      "Saat kamu menggunakan layanan: dokumen kontrak yang kamu unggah, hasil audit yang dihasilkan AI, dan draf negosiasi yang kamu buat atau simpan.",
      "Data teknis: log akses, alamat IP, jenis perangkat, dan browser — digunakan hanya untuk keamanan sistem dan investigasi insiden.",
      "Kami tidak mengumpulkan data lokasi, data keuangan, atau data biometrik.",
    ],
  },
  {
    id: "penggunaan-data",
    Ikon: Shield,
    judul: "Cara Kami Menggunakan Data",
    konten: [
      "Menjalankan layanan audit kontrak dan pembuatan draf negosiasi yang kamu minta.",
      "Mengirim notifikasi hasil audit dan informasi akun ke email terdaftarmu.",
      "Meningkatkan akurasi model AI — dokumen diproses secara anonim tanpa menghubungkan konten ke identitasmu dalam proses pelatihan ulang model.",
      "Mematuhi kewajiban hukum termasuk UU Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.",
      "Kami tidak menjual, menyewakan, atau membagikan data pribadimu ke pihak ketiga untuk tujuan pemasaran.",
    ],
  },
  {
    id: "keamanan-data",
    Ikon: Lock,
    judul: "Keamanan Data",
    konten: [
      "Seluruh data dienkripsi saat disimpan (at rest) dan saat dikirim (in transit) menggunakan TLS.",
      "Dokumen kontrak yang kamu unggah hanya dapat diakses oleh akunmu sendiri — tidak ada akses lintas pengguna.",
      "Akses ke sistem produksi dibatasi hanya untuk tim teknis yang berwenang dengan autentikasi berlapis.",
      "Audit log dicatat untuk setiap akses dan pemrosesan dokumen kontrak, untuk kebutuhan investigasi insiden.",
      "Jika terjadi insiden kebocoran data, kami wajib dan akan memberitahumu serta otoritas terkait dalam waktu 3×24 jam sesuai UU Pelindungan Data Pribadi.",
    ],
  },
  {
    id: "retensi-data",
    Ikon: Clock,
    judul: "Retensi dan Penghapusan Otomatis",
    konten: [
      "Dokumen kontrak yang kamu unggah disimpan selama 90 hari sejak tanggal pengunggahan.",
      "Setelah melewati batas retensi, dokumen beserta hasil audit dan draf terkait dihapus otomatis dari sistem kami.",
      "Kamu akan mendapat notifikasi email sebelum penghapusan otomatis terjadi.",
      "Kamu bisa menghapus dokumen kapan saja sebelum batas retensi dari halaman riwayat kontrak.",
      "Data profil akun (nama dan email) disimpan selama akunmu aktif dan dihapus permanen 30 hari setelah kamu menghapus akun.",
    ],
  },
  {
    id: "hak-pengguna",
    Ikon: Download,
    judul: "Hak-Hakmu sebagai Subjek Data",
    konten: [
      "Hak akses: kamu bisa melihat data pribadimu kapan saja lewat halaman profil.",
      "Hak koreksi: kamu bisa memperbarui nama dan email dari halaman profil.",
      "Hak penghapusan: kamu bisa menghapus akun dan seluruh data terkait kapan saja dari halaman profil — penghapusan permanen terjadi 30 hari setelah permintaan.",
      "Hak portabilitas: kamu bisa mengajukan ekspor seluruh data pribadimu — fitur ini sedang disiapkan dan akan segera tersedia.",
      "Untuk pertanyaan atau permintaan terkait hak data pribadimu, hubungi kami di privasi@kontrakaman.id.",
    ],
  },
  {
    id: "hapus-akun",
    Ikon: Trash2,
    judul: "Penghapusan Akun",
    konten: [
      "Kamu bisa menghapus akun kapan saja dari halaman Profil → bagian Privasi & Data → Hapus Akun.",
      "Penghapusan memerlukan konfirmasi ganda (teks konfirmasi dan kata sandi) karena tindakan ini permanen.",
      "Setelah permintaan dikirim, akunmu dinonaktifkan segera dan seluruh data dihapus permanen 30 hari kemudian.",
      "Masuk kembali sebelum 30 hari jika kamu ingin membatalkan penghapusan.",
    ],
  },
];

export default function HalamanPrivasi() {
  return (
    <div className="min-h-screen bg-[var(--jernih-surface)]">
      {/* Header sederhana untuk halaman publik */}
      <header className="border-b border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)]">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-body-lg font-semibold text-[var(--jernih-on-surface)]"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            KontrakAman AI
          </Link>
        </div>
      </header>

      {/* Konten utama */}
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        {/* Tombol kembali */}
        <TombolKembali />

        {/* Judul */}
        <div className="mb-10 mt-6">
          <h1
            className="text-headline-lg text-[var(--jernih-on-surface)]"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Kebijakan Privasi
          </h1>
          <p className="mt-2 text-body-md text-[var(--jernih-neutral)]">
            Terakhir diperbarui: 23 Agustus 2026
          </p>
          <p className="mt-4 text-body-lg text-[var(--jernih-neutral)]">
            KontrakAman AI berkomitmen melindungi privasi dan data pribadimu sesuai
            UU Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi. Kebijakan ini
            menjelaskan secara jelas dan jujur apa yang kami kumpulkan, cara kami
            menggunakannya, dan hak-hakmu sebagai pengguna.
          </p>
        </div>

        {/* Daftar seksi */}
        <div className="space-y-10">
          {SEKSI_PRIVASI.map((seksi) => {
            const { Ikon } = seksi;
            return (
              <section
                key={seksi.id}
                id={seksi.id}
                aria-labelledby={`judul-${seksi.id}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--jernih-radius-md)] bg-[var(--jernih-tertiary)]/10">
                    <Ikon
                      className="h-4 w-4 text-[var(--jernih-tertiary)]"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </div>
                  <h2
                    id={`judul-${seksi.id}`}
                    className="text-headline-md text-[var(--jernih-on-surface)]"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    {seksi.judul}
                  </h2>
                </div>
                <ul className="space-y-3">
                  {seksi.konten.map((paragraf, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-body-lg text-[var(--jernih-neutral)]"
                    >
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--jernih-tertiary)]"
                        aria-hidden="true"
                      />
                      {paragraf}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        {/* Footer kontak */}
        <div className="mt-12 rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-neutral)]/5 p-6">
          <p className="text-body-md text-[var(--jernih-neutral)]">
            Pertanyaan tentang kebijakan privasi ini atau permintaan terkait data
            pribadimu? Hubungi tim privasi kami di{" "}
            <a
              href="mailto:privasi@kontrakaman.id"
              className="text-[var(--jernih-primary)] underline-offset-2 hover:underline"
            >
              privasi@kontrakaman.id
            </a>
            .
          </p>
          <p className="mt-3 text-body-md text-[var(--jernih-neutral)]">
            Sudah punya akun?{" "}
            <Link
              href="/profil"
              className="text-[var(--jernih-primary)] underline-offset-2 hover:underline"
            >
              Kelola data pribadimu di halaman Profil
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}