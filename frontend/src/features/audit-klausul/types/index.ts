// ============================================================
// Tipe data audit klausul — KontrakAman AI
// Selaras dengan api.md Bagian 7 (GET /audit/:id)
// ============================================================

// ============================================================
// Tipe inti dari api.md 7.2
// ============================================================
export type SkorRisikoAudit = "hijau" | "kuning" | "merah";
export type StatusAudit = "memproses" | "selesai" | "gagal";
export type TingkatRisiko = "hijau" | "kuning" | "merah";

export interface DataKlausul {
  id: string;
  nomor_urut: number;
  judul: string;
  teks_asli: string;
  tingkat_risiko: TingkatRisiko;
  penjelasan: string;
  rekomendasi: string;
  ada_draft_negosiasi: boolean;
}

export interface StatistikAudit {
  total_klausul: number;
  klausul_merah: number;
  klausul_kuning: number;
  klausul_hijau: number;
}

// Respons saat audit sudah selesai — api.md 7.2
export interface HasilAuditSelesai {
  id: string;
  dokumen_kontrak_id: string;
  status: "selesai";
  skor_risiko: SkorRisikoAudit;
  ringkasan: string;
  dimulai_pada: string;
  selesai_pada: string;
  klausul: DataKlausul[];
  statistik: StatistikAudit;
}

// Respons saat audit masih berjalan — api.md 7.2
export interface HasilAuditMemproses {
  id: string;
  dokumen_kontrak_id: string;
  status: "memproses";
  progres_persen: number;
}

// Respons saat audit gagal — kondisi error dari api.md 7.2
export interface HasilAuditGagal {
  id: string;
  dokumen_kontrak_id: string;
  status: "gagal";
}

export type HasilAudit = HasilAuditSelesai | HasilAuditMemproses | HasilAuditGagal;

// ============================================================
// Detail dokumen kontrak dari GET /dokumen-kontrak/:id (api.md 6.3)
// Dipakai untuk mengambil url_pratinjau di halaman hasil audit
// ============================================================
export type StatusDokumenKontrak = "menunggu" | "memproses" | "selesai" | "gagal";

export interface DetailDokumenKontrak {
  id: string;
  nama: string;
  kategori: string;
  status: StatusDokumenKontrak;
  skor_risiko: SkorRisikoAudit | null;
  ukuran_bytes: number;
  tipe_file: string;
  // URL gambar pratinjau dokumen di CDN — null jika belum tersedia
  // Gambar statis (JPG), bukan PDF. Dipakai di PratinjauDokumen.
  url_pratinjau: string | null;
  diunggah_pada: string;
  dihapus_pada: string | null;
  audit_id: string | null;
  // Field revisi dari api.md 6.3
  // revisi_dari_id: null = dokumen asal (nomor_revisi 0)
  // revisi_dari_id: string = ID dokumen asal dari revisi ini
  revisi_dari_id: string | null;
  nomor_revisi: number;
}

// ============================================================
// State machine hook polling
// idle → memuat → memproses → selesai | gagal
// ============================================================
export type StatusMuatAudit = "idle" | "memuat" | "memproses" | "selesai" | "gagal";

export interface StateMuatAudit {
  status: StatusMuatAudit;
  data: HasilAuditSelesai | null;
  progres: number; // 0–100, hanya relevan saat memproses
  pesanError: string | null;
}

// ============================================================
// Filter tampilan daftar klausul
// ============================================================
export type FilterKlausul = "semua" | TingkatRisiko;