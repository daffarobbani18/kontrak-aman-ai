// ============================================================
// Data statis artikel edukasi pasal karet
// F-EDU-02 PRD.md — Could Have, konten statis (tidak ada API endpoint)
// Dikelola manual oleh tim konten / mitra hukum
// DESIGN.md: warna tertiary (teal) untuk aksen ikon fitur edukasi
// ============================================================

export interface ArtikelPasalKaret {
  id: string;
  judul: string;
  slug: string;
  ringkasan: string;
  kategori: "denda" | "hak-cipta" | "pembayaran" | "non-compete" | "terminasi";
  konten: string; // teks panjang, boleh pakai \n untuk paragraf
  ditinjauOleh: string; // nama mitra hukum yang memvalidasi
  dipublikasikanPada: string; // ISO 8601
}

export const ARTIKEL_PASAL_KARET: ArtikelPasalKaret[] = [
  {
    id: "art_001",
    judul: "Klausul Denda Keterlambatan Tanpa Batas Maksimum",
    slug: "denda-keterlambatan-tanpa-batas",
    ringkasan:
      "Denda tanpa batas maksimum bisa menghabiskan seluruh nilai kontrak dalam hitungan hari. Kenali pola ini dan cara menegosiasikannya.",
    kategori: "denda",
    konten:
      "Klausul denda keterlambatan yang tidak menyebutkan batas maksimum adalah salah satu jebakan paling umum dalam kontrak kerja freelance di Indonesia.\n\nContoh klausul berbahaya: 'Freelancer wajib membayar denda sebesar 5% per hari keterlambatan dari total nilai proyek.' Tanpa kata 'maksimum', denda ini bisa terus bertambah tanpa henti.\n\nPada kontrak senilai Rp 10 juta, keterlambatan 7 hari saja menghasilkan denda Rp 3,5 juta — 35% dari nilai proyek. Keterlambatan 20 hari sudah melampaui nilai proyek itu sendiri.\n\nCara menegosiasikan: Minta penambahan kalimat 'dengan batas maksimum 10% dari total nilai kontrak' dan definisi jelas apa yang dihitung sebagai keterlambatan — termasuk apakah keterlambatan akibat revisi berlebihan dari klien ikut dihitung.",
    ditinjauOleh: "Tim Hukum KontrakAman AI",
    dipublikasikanPada: "2026-08-23T00:00:00Z",
  },
  {
    id: "art_002",
    judul: "Pengalihan Hak Cipta Sebelum Pelunasan",
    slug: "pengalihan-hak-cipta-sebelum-lunas",
    ringkasan:
      "Hak cipta hasil karyamu bisa berpindah ke klien bahkan sebelum kamu dibayar. Pahami kapan pengalihan hak cipta boleh terjadi.",
    kategori: "hak-cipta",
    konten:
      "Di Indonesia, pengalihan hak cipta diatur dalam UU Hak Cipta No. 28 Tahun 2014. Hak cipta bisa dialihkan, tapi waktu pengalihannya sangat penting bagi freelancer.\n\nKlausul berbahaya: 'Seluruh hasil karya menjadi milik klien sejak pekerjaan dimulai.' Ini artinya begitu kamu mulai mengerjakan, hak cipta sudah berpindah — bahkan sebelum kamu menerima satu rupiah pun.\n\nDampaknya: jika klien tidak membayar, kamu sudah kehilangan hak atas karya tersebut dan tidak bisa menggunakannya kembali atau menjualnya ke pihak lain.\n\nAlternatif yang adil: 'Pengalihan hak cipta efektif hanya setelah pembayaran penuh diterima oleh freelancer.' Atau untuk proyek panjang: 'Pengalihan hak cipta per milestone dilakukan setelah pembayaran milestone tersebut lunas.'",
    ditinjauOleh: "Tim Hukum KontrakAman AI",
    dipublikasikanPada: "2026-08-23T00:00:00Z",
  },
  {
    id: "art_003",
    judul: "Termin Pembayaran yang Tidak Jelas atau Terlalu Panjang",
    slug: "termin-pembayaran-tidak-jelas",
    ringkasan:
      "Klausul 'pembayaran 90 hari setelah selesai' bisa melumpuhkan arus kas freelancer. Kenali batasan wajar termin pembayaran.",
    kategori: "pembayaran",
    konten:
      "Termin pembayaran adalah salah satu sumber konflik terbesar antara freelancer dan klien. Klausul yang tidak jelas atau terlalu panjang merugikan freelancer yang bergantung pada arus kas bulanan.\n\nKlausul bermasalah: 'Pembayaran dilakukan dalam waktu yang wajar setelah penyelesaian.' Kata 'wajar' tidak punya definisi hukum yang pasti dan bisa diinterpretasikan berbeda oleh tiap pihak.\n\nKlausul bermasalah lain: 'Pembayaran dilakukan 90 hari kalender setelah invoice diterima.' Ini terlalu panjang untuk freelancer individu.\n\nStandar industri di Indonesia untuk proyek freelance: 14–30 hari kerja setelah invoice atau milestone diterima. Untuk proyek kecil di bawah Rp 5 juta, pembayaran 50% di muka adalah praktik umum yang wajar diminta.\n\nCara menegosiasikan: Minta termin pembayaran tidak lebih dari 30 hari kalender dan minta denda keterlambatan pembayaran dari klien yang simetris dengan denda keterlambatan pengerjaan darimu.",
    ditinjauOleh: "Tim Hukum KontrakAman AI",
    dipublikasikanPada: "2026-08-23T00:00:00Z",
  },
  {
    id: "art_004",
    judul: "Klausul Non-Compete yang Terlalu Luas",
    slug: "non-compete-terlalu-luas",
    ringkasan:
      "Larangan mengerjakan proyek serupa selama 2 tahun bisa melumpuhkan karier freelance. Kenali batasan yang masuk akal.",
    kategori: "non-compete",
    konten:
      "Klausul non-compete (larangan bersaing) dalam kontrak freelance sering kali jauh lebih luas dari yang diperlukan klien, dan bisa membatasi kemampuanmu mengambil klien baru.\n\nKlausul berbahaya: 'Freelancer dilarang mengerjakan proyek serupa untuk pihak manapun selama 24 bulan setelah kontrak berakhir.' Ini berlebihan untuk hubungan kerja freelance yang tidak eksklusif.\n\nDampak nyata: seorang desainer grafis yang mengerjakan logo untuk startup fintech tidak boleh mengerjakan proyek desain untuk perusahaan fintech lain selama 2 tahun. Ini bisa menghapus sebagian besar pasarnya.\n\nBatasan yang lebih wajar: non-compete terbatas pada klien langsung yang sama (bukan industri secara keseluruhan), untuk jangka waktu 3–6 bulan, dan hanya berlaku untuk proyek yang secara langsung bersaing dengan produk spesifik klien.",
    ditinjauOleh: "Tim Hukum KontrakAman AI",
    dipublikasikanPada: "2026-08-23T00:00:00Z",
  },
  {
    id: "art_005",
    judul: "Terminasi Sepihak Tanpa Kompensasi",
    slug: "terminasi-sepihak-tanpa-kompensasi",
    ringkasan:
      "Klien bisa membatalkan proyek kapan saja tanpa membayarmu. Pastikan ada klausul kill fee yang adil.",
    kategori: "terminasi",
    konten:
      "Terminasi sepihak tanpa kompensasi adalah risiko nyata freelancer, terutama untuk proyek jangka panjang. Klien bisa memutus kontrak di tengah jalan dan kamu tidak mendapat bayaran untuk pekerjaan yang sudah dilakukan.\n\nKlausul berbahaya: 'Klien berhak mengakhiri kontrak kapan saja tanpa kewajiban pembayaran tambahan.' Ini artinya seluruh pekerjaan yang sudah kamu kerjakan tidak harus dibayar.\n\nYang adil adalah kill fee: kompensasi yang harus dibayar klien jika membatalkan proyek setelah pekerjaan dimulai. Besaran kill fee yang lazim: 25–50% dari nilai kontrak yang tersisa jika dibatalkan setelah pekerjaan dimulai, atau 100% dari milestone yang sudah selesai dikerjakan.\n\nPastikan juga ada klausul yang mengatur hak atas pekerjaan yang sudah diselesaikan: jika klien membatalkan setelah 50% pekerjaan selesai dan membayar kill fee, apakah mereka boleh menggunakan 50% hasil kerja itu?",
    ditinjauOleh: "Tim Hukum KontrakAman AI",
    dipublikasikanPada: "2026-08-23T00:00:00Z",
  },
];

// Kategori artikel dengan label dan warna
export const KATEGORI_ARTIKEL = {
  denda: { label: "Denda & Penalti", kelasWarna: "text-[var(--jernih-error)] bg-[var(--jernih-error)]/10 border-[var(--jernih-error)]/30" },
  "hak-cipta": { label: "Hak Cipta", kelasWarna: "text-[var(--jernih-warning)] bg-[var(--jernih-warning)]/10 border-[var(--jernih-warning)]/30" },
  pembayaran: { label: "Pembayaran", kelasWarna: "text-[var(--jernih-warning)] bg-[var(--jernih-warning)]/10 border-[var(--jernih-warning)]/30" },
  "non-compete": { label: "Non-Compete", kelasWarna: "text-[var(--jernih-tertiary)] bg-[var(--jernih-tertiary)]/10 border-[var(--jernih-tertiary)]/30" },
  terminasi: { label: "Terminasi", kelasWarna: "text-[var(--jernih-neutral)] bg-[var(--jernih-neutral)]/10 border-[var(--jernih-neutral)]/30" },
} as const;