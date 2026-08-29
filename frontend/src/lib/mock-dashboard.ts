// ============================================================
// Mock data dashboard — HANYA untuk development sebelum backend tersedia
// Hapus dan nonaktifkan NEXT_PUBLIC_MOCK_AUTH=true begitu backend berjalan
// Selaras dengan format respons api.md Bagian 5.1 dan 6.2
// ============================================================

import type {
  DataProfilPengguna,
  ItemDokumenKontrak,
  DataPaginasi,
} from "@/features/dashboard/types";
import type { ResponsAPI } from "@/features/autentikasi/types";

function tundaMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================
// Data profil mock — meniru GET /pengguna/saya (api.md 5.1)
// ============================================================
const PROFIL_MOCK: Record<string, DataProfilPengguna> = {
  "rani@example.com": {
    id: "usr_dummy_rani",
    nama_lengkap: "Rani Desainer",
    email: "rani@example.com",
    email_terverifikasi: true,
    avatar_url: null,
    tier: "gratis",
    profesi: "desainer",
    onboarding_selesai: true,
    dibuat_pada: "2026-08-01T00:00:00Z",
    kuota: {
      audit: { digunakan: 2, batas: 3, reset_pada: "2026-09-01T00:00:00Z" },
      negosiasi: { digunakan: 1, batas: 2, reset_pada: "2026-09-01T00:00:00Z" },
    },
    langganan_aktif: null,
  },
  "bima@example.com": {
    id: "usr_dummy_bima",
    nama_lengkap: "Bima Programmer",
    email: "bima@example.com",
    email_terverifikasi: true,
    avatar_url: null,
    tier: "pro",
    profesi: "programmer",
    onboarding_selesai: true,
    dibuat_pada: "2026-07-15T00:00:00Z",
    kuota: {
      audit: { digunakan: 8, batas: null, reset_pada: null },
      negosiasi: { digunakan: 3, batas: null, reset_pada: null },
    },
    langganan_aktif: {
      id: "sub_dummy_bima",
      tier: "pro",
      aktif_hingga: "2026-09-15T00:00:00Z",
    },
  },
  "sari@example.com": {
    id: "usr_dummy_sari",
    nama_lengkap: "Sari Penulis",
    email: "sari@example.com",
    email_terverifikasi: false, // email belum diverifikasi
    avatar_url: null,
    tier: "gratis",
    profesi: "penulis",
    onboarding_selesai: false, // Sari belum selesai onboarding
    dibuat_pada: "2026-08-20T00:00:00Z",
    kuota: {
      audit: { digunakan: 0, batas: 3, reset_pada: "2026-09-01T00:00:00Z" },
      negosiasi: { digunakan: 0, batas: 2, reset_pada: "2026-09-01T00:00:00Z" },
    },
    langganan_aktif: null,
  },
};

// ============================================================
// Dokumen kontrak mock — meniru GET /dokumen-kontrak (api.md 6.2)
// ============================================================
const DOKUMEN_MOCK: Record<string, ItemDokumenKontrak[]> = {
  usr_dummy_rani: [
    {
      id: "dok_rani_001",
      nama: "kontrak-desain-logo-startup.pdf",
      kategori: "desain",
      status: "selesai",
      skor_risiko: "merah",
      diunggah_pada: "2026-08-22T10:30:00Z",
      audit_id: "aud_rani_001",
    },
    {
      id: "dok_rani_002",
      nama: "kontrak-branding-umkm.pdf",
      kategori: "desain",
      status: "selesai",
      skor_risiko: "kuning",
      diunggah_pada: "2026-08-15T09:00:00Z",
      audit_id: "aud_rani_002",
    },
  ],
  usr_dummy_bima: [
    {
      id: "dok_bima_001",
      nama: "kontrak-pengembangan-aplikasi-fintech.pdf",
      kategori: "pemrograman",
      status: "selesai",
      skor_risiko: "kuning",
      diunggah_pada: "2026-08-23T08:00:00Z",
      audit_id: "aud_bima_001",
    },
    {
      id: "dok_bima_002",
      nama: "kontrak-maintenance-website.pdf",
      kategori: "pemrograman",
      status: "selesai",
      skor_risiko: "hijau",
      diunggah_pada: "2026-08-18T14:00:00Z",
      audit_id: "aud_bima_002",
    },
    {
      id: "dok_bima_003",
      nama: "kontrak-api-integration.pdf",
      kategori: "pemrograman",
      status: "memproses",
      skor_risiko: null,
      diunggah_pada: "2026-08-23T11:00:00Z",
      audit_id: null,
    },
  ],
  usr_dummy_sari: [],
};

// ============================================================
// Mock DELETE /dokumen-kontrak/:id (api.md 6.4)
// Hapus dokumen dari DOKUMEN_MOCK supaya daftar ikut terupdate
// ============================================================
export async function mockHapusDokumenDariDaftar(
  penggunaId: string,
  dokumenId: string
): Promise<{ berhasil: boolean; pesan: string }> {
  await tundaMs(600);

  const daftar = DOKUMEN_MOCK[penggunaId];
  if (!daftar) {
    throw new Error("Dokumen tidak ditemukan.");
  }

  const indeks = daftar.findIndex((d) => d.id === dokumenId);
  if (indeks === -1) {
    throw new Error("Dokumen tidak ditemukan.");
  }

  // Hapus dari array mock — efek persisten selama sesi browser
  DOKUMEN_MOCK[penggunaId] = daftar.filter((d) => d.id !== dokumenId);

  return {
    berhasil: true,
    pesan: "Dokumen berhasil dihapus.",
  };
}

// ============================================================
// Mock GET /pengguna/saya (api.md 5.1)
// ============================================================
export async function mockAmbilProfil(
  emailPengguna: string
): Promise<ResponsAPI<DataProfilPengguna>> {
  await tundaMs(400);

  const profil = PROFIL_MOCK[emailPengguna];
  if (!profil) {
    // Fallback ke profil Rani jika tidak ditemukan
    return {
      berhasil: true,
      pesan: "Data profil berhasil diambil.",
      data: PROFIL_MOCK["rani@example.com"],
    };
  }

  return {
    berhasil: true,
    pesan: "Data profil berhasil diambil.",
    data: profil,
  };
}

// ============================================================
// Mock GET /dokumen-kontrak (api.md 6.2)
// ============================================================
export async function mockAmbilDaftarDokumen(
  penggunaId: string
): Promise<{
  berhasil: boolean;
  pesan: string;
  data: ItemDokumenKontrak[];
  paginasi: DataPaginasi;
}> {
  await tundaMs(600);

  const dokumen = DOKUMEN_MOCK[penggunaId] ?? [];

  return {
    berhasil: true,
    pesan: "Daftar dokumen berhasil diambil.",
    data: dokumen,
    paginasi: {
      cursor_berikutnya: null,
      ada_lagi: false,
      total: dokumen.length,
    },
  };
}
