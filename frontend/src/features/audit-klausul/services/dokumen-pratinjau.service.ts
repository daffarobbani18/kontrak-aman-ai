// ============================================================
// Service dokumen pratinjau — KontrakAman AI
// Memanggil GET /dokumen-kontrak/:id (api.md 6.3)
// Dipakai khusus di halaman hasil audit untuk mengambil url_pratinjau
// Mock-aware: env dibaca dinamis supaya vi.stubEnv() di test bekerja
// ============================================================

import { apiClient } from "@/lib/api-client";
import { ambilRevisiDariId } from "@/features/dokumen-kontrak/services/dokumen-kontrak.service";
import type { DetailDokumenKontrak } from "../types";

// ============================================================
// GET /dokumen-kontrak/:id — api.md 6.3
// Mengembalikan detail dokumen termasuk url_pratinjau
// ============================================================
export async function ambilDetailDokumen(
  dokumenId: string
): Promise<DetailDokumenKontrak> {
  if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
    return mockAmbilDetailDokumen(dokumenId);
  }

  const respons = await apiClient.get<DetailDokumenKontrak>(
    `/dokumen-kontrak/${dokumenId}`,
    true // butuh auth
  );

  return respons.data as DetailDokumenKontrak;
}

// ============================================================
// Mock untuk development
// Selaras dengan DOKUMEN_MOCK dan AUDIT_ID_RIWAYAT di service audit
// url_pratinjau memakai placeholder gambar publik untuk simulasi tampilan
// Ganti dengan URL CDN sungguhan saat backend tersedia
// ============================================================
function tundaMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Peta dokumen_kontrak_id → data mock
// Selaras dengan mock-dashboard.ts dan audit-klausul.service.ts
const DETAIL_DOKUMEN_MOCK: Record<string, DetailDokumenKontrak> = {
  // Dokumen milik Rani — dokumen asal (nomor_revisi 0, revisi_dari_id null)
  dok_rani_001: {
    id: "dok_rani_001",
    nama: "kontrak-desain-logo-startup.pdf",
    kategori: "desain",
    status: "selesai",
    skor_risiko: "merah",
    ukuran_bytes: 524288,
    tipe_file: "pdf",
    url_pratinjau: "https://placehold.co/800x1100/fafaf9/18181b?text=Pratinjau+Dokumen",
    diunggah_pada: "2026-08-22T10:30:00Z",
    dihapus_pada: "2026-11-20T10:30:00Z",
    audit_id: "aud_rani_001",
    revisi_dari_id: null,
    nomor_revisi: 0,
  },
  dok_rani_002: {
    id: "dok_rani_002",
    nama: "kontrak-branding-umkm.pdf",
    kategori: "desain",
    status: "selesai",
    skor_risiko: "kuning",
    ukuran_bytes: 307200,
    tipe_file: "pdf",
    url_pratinjau: "https://placehold.co/800x1100/fafaf9/18181b?text=Pratinjau+Dokumen",
    diunggah_pada: "2026-08-15T09:00:00Z",
    dihapus_pada: "2026-11-13T09:00:00Z",
    audit_id: "aud_rani_002",
    revisi_dari_id: null,
    nomor_revisi: 0,
  },
  // Dokumen milik Bima — dokumen asal (nomor_revisi 0, revisi_dari_id null)
  dok_bima_001: {
    id: "dok_bima_001",
    nama: "kontrak-pengembangan-aplikasi-fintech.pdf",
    kategori: "pemrograman",
    status: "selesai",
    skor_risiko: "kuning",
    ukuran_bytes: 819200,
    tipe_file: "pdf",
    url_pratinjau: "https://placehold.co/800x1100/fafaf9/18181b?text=Pratinjau+Dokumen",
    diunggah_pada: "2026-08-23T08:00:00Z",
    dihapus_pada: "2026-11-21T08:00:00Z",
    audit_id: "aud_bima_001",
    revisi_dari_id: null,
    nomor_revisi: 0,
  },
  dok_bima_002: {
    id: "dok_bima_002",
    nama: "kontrak-maintenance-website.pdf",
    kategori: "pemrograman",
    status: "selesai",
    skor_risiko: "hijau",
    ukuran_bytes: 204800,
    tipe_file: "pdf",
    url_pratinjau: "https://placehold.co/800x1100/fafaf9/18181b?text=Pratinjau+Dokumen",
    diunggah_pada: "2026-08-18T14:00:00Z",
    dihapus_pada: "2026-11-16T14:00:00Z",
    audit_id: "aud_bima_002",
    revisi_dari_id: null,
    nomor_revisi: 0,
  },
  // Fallback untuk dokumen dari alur /unggah (id mock dinamis)
  dok_mock_001: {
    id: "dok_mock_001",
    nama: "kontrak-baru.pdf",
    kategori: "lainnya",
    status: "selesai",
    skor_risiko: "kuning",
    ukuran_bytes: 409600,
    tipe_file: "pdf",
    url_pratinjau: "https://placehold.co/800x1100/fafaf9/18181b?text=Pratinjau+Dokumen",
    diunggah_pada: new Date().toISOString(),
    dihapus_pada: null,
    audit_id: null,
    revisi_dari_id: null,
    nomor_revisi: 0,
  },
};

async function mockAmbilDetailDokumen(
  dokumenId: string
): Promise<DetailDokumenKontrak> {
  await tundaMs(400);

  const detail = DETAIL_DOKUMEN_MOCK[dokumenId];
  if (detail) {
    return detail;
  }

  // Fallback untuk ID dinamis dari alur unggah atau revisi
  // (dok_mock_<timestamp>, dok_mock_rev_<timestamp>) — kembalikan data generik
  const adalahRevisi = dokumenId.includes("_rev_");

  // Untuk dokumen revisi, ambil ID dokumen asal lewat fungsi accessor
  // yang diisi saat mockUnggahRevisi dipanggil di dokumen-kontrak.service.ts
  // Ini memastikan revisi_dari_id berisi ID dokumen asal yang benar (misal: "dok_rani_001")
  const revisiDariId = adalahRevisi ? ambilRevisiDariId(dokumenId) : null;

  return {
    id: dokumenId,
    nama: adalahRevisi ? "kontrak-revisi.pdf" : "kontrak.pdf",
    kategori: "lainnya",
    status: "selesai",
    skor_risiko: null,
    ukuran_bytes: 0,
    tipe_file: "pdf",
    url_pratinjau: "https://placehold.co/800x1100/fafaf9/18181b?text=Pratinjau+Dokumen",
    diunggah_pada: new Date().toISOString(),
    dihapus_pada: null,
    audit_id: null,
    revisi_dari_id: revisiDariId,
    nomor_revisi: adalahRevisi ? 1 : 0,
  };
}