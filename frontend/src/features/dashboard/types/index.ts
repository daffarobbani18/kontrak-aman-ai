// ============================================================
// Tipe data dashboard — KontrakAman AI
// Selaras dengan format respons api.md Bagian 2, 5, 6, 7
// ============================================================

// Tipe pengguna dari GET /pengguna/saya (api.md 5.1)
export interface DataKuota {
  digunakan: number;
  batas: number | null; // null = tidak terbatas (tier pro/bisnis)
  reset_pada: string | null;
}

export interface DataLanggananAktif {
  id: string;
  tier: "gratis" | "pro" | "bisnis";
  aktif_hingga: string;
}

export interface DataProfilPengguna {
  id: string;
  nama_lengkap: string;
  email: string;
  email_terverifikasi: boolean;
  avatar_url: string | null;
  tier: "gratis" | "pro" | "bisnis";
  // Field baru dari api.md 5.1 — F-PROF-01
  // null sebelum backend implementasikan field ini
  profesi: "desainer" | "penulis" | "programmer" | "lainnya" | null;
  onboarding_selesai: boolean;
  dibuat_pada: string;
  kuota: {
    audit: DataKuota;
    negosiasi: DataKuota;
  };
  langganan_aktif: DataLanggananAktif | null;
}

// Tipe item kontrak dari GET /dokumen-kontrak (api.md 6.2)
export type SkorRisiko = "hijau" | "kuning" | "merah";
export type StatusDokumen = "menunggu" | "memproses" | "selesai" | "gagal";

export interface ItemDokumenKontrak {
  id: string;
  nama: string;
  kategori: string;
  status: StatusDokumen;
  skor_risiko: SkorRisiko | null;
  diunggah_pada: string;
  audit_id: string | null;
}

// Tipe paginasi dari api.md Bagian 1
export interface DataPaginasi {
  cursor_berikutnya: string | null;
  ada_lagi: boolean;
  total: number;
}

// Tipe respons GET /dokumen-kontrak
export interface ResponsDaftarDokumen {
  berhasil: boolean;
  pesan: string;
  data: ItemDokumenKontrak[];
  paginasi: DataPaginasi;
}

// Tipe state dashboard yang dipakai hook
export interface StateDashboard {
  profil: DataProfilPengguna | null;
  dokumen: ItemDokumenKontrak[];
  sedangMemuat: boolean;
  kesalahan: string | null;
  paginasi: DataPaginasi | null;
}
