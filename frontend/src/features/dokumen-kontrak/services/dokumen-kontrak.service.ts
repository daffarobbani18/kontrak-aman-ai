// ============================================================
// Service dokumen kontrak — KontrakAman AI
// Menangani:
//   POST /dokumen-kontrak       (api.md 6.1)
//   POST /audit                 (api.md 7.1)
//   DELETE /dokumen-kontrak/:id (api.md 6.4)
// Mock-aware: cek NEXT_PUBLIC_MOCK_AUTH untuk development
// ============================================================

import { apiClient, KesalahanAPI } from "@/lib/api-client";
import type {
  ResponsUnggahDokumen,
  ResponsMulaiAudit,
  ResponsHapusDokumen,
  ResponsUnggahRevisi,
  ItemRevisi,
  NilaiKategori,
} from "../types";
import type { ResponsAPI } from "@/features/autentikasi/types";

// Dibaca dinamis (bukan top-level constant) supaya vi.stubEnv() di test bekerja
// Sesuai pola di dashboard.service.ts
function pakaiMock(): boolean {
  return process.env.NEXT_PUBLIC_MOCK_AUTH === "true";
}

// ============================================================
// Unggah dokumen kontrak — POST /dokumen-kontrak (api.md 6.1)
// Menerima FormData dengan field: file, nama (opsional), kategori (opsional)
// ============================================================
export async function unggahDokumen(
  file: File,
  opsi?: { nama?: string; kategori?: NilaiKategori }
): Promise<ResponsUnggahDokumen> {
  if (pakaiMock()) {
    return mockUnggahDokumen(file, opsi);
  }

  const formData = new FormData();
  formData.append("file", file);
  if (opsi?.nama) formData.append("nama", opsi.nama);
  if (opsi?.kategori) formData.append("kategori", opsi.kategori);

  const respons = await apiClient.postForm<ResponsUnggahDokumen>(
    "/dokumen-kontrak",
    formData,
    true // butuh auth
  );

  return respons.data as ResponsUnggahDokumen;
}

// ============================================================
// Mulai audit — POST /audit (api.md 7.1)
// Dipanggil setelah dokumen berhasil diunggah
// ============================================================
export async function mulaiAudit(
  dokumenKontrakId: string
): Promise<ResponsMulaiAudit> {
  if (pakaiMock()) {
    return mockMulaiAudit(dokumenKontrakId);
  }

  const respons = await apiClient.post<ResponsMulaiAudit>(
    "/audit",
    { dokumen_kontrak_id: dokumenKontrakId },
    true // butuh auth
  );

  return respons.data as ResponsMulaiAudit;
}

// ============================================================
// Hapus dokumen kontrak — DELETE /dokumen-kontrak/:id (api.md 6.4)
// Menghapus dokumen dan semua data terkait (audit, negosiasi) secara permanen
// ============================================================
export async function hapusDokumen(
  dokumenId: string
): Promise<ResponsHapusDokumen> {
  if (pakaiMock()) {
    return mockHapusDokumen(dokumenId);
  }

  const respons = await apiClient.delete<null>(
    `/dokumen-kontrak/${dokumenId}`,
    true // butuh auth
  );

  return {
    berhasil: respons.berhasil,
    pesan: respons.pesan,
    data: null,
  };
}

// ============================================================
// Unggah revisi dokumen — POST /dokumen-kontrak/:id/revisi (api.md 6.5)
// Mengunggah versi baru kontrak dan menautkannya ke dokumen asal
// Audit ulang otomatis dijadwalkan oleh backend setelah revisi diterima
// ============================================================
export async function unggahRevisi(
  dokumenId: string,
  file: File,
  opsi?: { nama?: string; catatan_revisi?: string }
): Promise<ResponsUnggahRevisi> {
  if (pakaiMock()) {
    return mockUnggahRevisi(dokumenId, file, opsi);
  }

  const formData = new FormData();
  formData.append("file", file);
  if (opsi?.nama) formData.append("nama", opsi.nama);
  if (opsi?.catatan_revisi) formData.append("catatan_revisi", opsi.catatan_revisi);

  const respons = await apiClient.postForm<ResponsUnggahRevisi>(
    `/dokumen-kontrak/${dokumenId}/revisi`,
    formData,
    true
  );

  return respons.data as ResponsUnggahRevisi;
}

// ============================================================
// Ambil riwayat revisi — GET /dokumen-kontrak/:id/revisi (api.md 6.6)
// Mengembalikan semua versi dokumen, urut terlama ke terbaru
// nomor_revisi 0 = dokumen asal, 1 = revisi pertama, dst
// ============================================================
export async function ambilRiwayatRevisi(
  dokumenId: string
): Promise<ResponsAPI<ItemRevisi[]>> {
  if (pakaiMock()) {
    return mockAmbilRiwayatRevisi(dokumenId);
  }

  return apiClient.get<ItemRevisi[]>(
    `/dokumen-kontrak/${dokumenId}/revisi`,
    true
  );
}

// ============================================================
// Mock untuk development — simulasi delay realistis
// Hapus saat backend tersedia (set NEXT_PUBLIC_MOCK_AUTH=false)
// ============================================================
function tundaMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ------------------------------------------------------------
// State mock revisi — disimpan di memory selama sesi dev
// Key: dokumenId → array ItemRevisi (termasuk dokumen asal nomor_revisi 0)
// Diinisialisasi lazy saat pertama kali dipanggil
// ------------------------------------------------------------
const STATE_MOCK_REVISI: Map<string, ItemRevisi[]> = new Map();

// Mapping revisiId → dokumenAsalId — diisi saat mockUnggahRevisi dipanggil
// Diakses lewat ambilRevisiDariId() — jangan import Map ini langsung dari luar
const REVISI_KE_ASAL_MAP: Map<string, string> = new Map();

// Fungsi accessor untuk dokumen-pratinjau.service.ts
// Mengembalikan ID dokumen asal dari ID dokumen revisi, atau null jika tidak ditemukan
export function ambilRevisiDariId(revisiId: string): string | null {
  return REVISI_KE_ASAL_MAP.get(revisiId) ?? null;
}

// Peta nama file dan skor risiko asal per dokumen mock yang dikenal
// Supaya tiap dokumen punya identitas berbeda saat testing di browser
const DATA_ASAL_DOKUMEN_MOCK: Record<
  string,
  { nama: string; skor_risiko: "hijau" | "kuning" | "merah" }
> = {
  dok_rani_001: { nama: "kontrak-desain-logo-startup.pdf", skor_risiko: "merah" },
  dok_rani_002: { nama: "kontrak-branding-umkm.pdf", skor_risiko: "kuning" },
  dok_bima_001: { nama: "kontrak-pengembangan-aplikasi-fintech.pdf", skor_risiko: "kuning" },
  dok_bima_002: { nama: "kontrak-maintenance-website.pdf", skor_risiko: "hijau" },
  dok_bima_003: { nama: "kontrak-api-integration.pdf", skor_risiko: null as unknown as "merah" },
};

// Helper: inisialisasi state mock dengan dokumen asal (nomor_revisi 0)
// Menggunakan data dari peta di atas jika dokumenId dikenal,
// fallback generik untuk ID yang tidak dikenal (misal: dok_mock_xxx saat testing)
// Peta audit_id yang dikenal per dokumenId — selaras dengan AUDIT_ID_RIWAYAT
// Supaya tombol "Lihat Kontrak Asal" mengarah ke audit yang langsung selesai
const AUDIT_ID_ASAL_DOKUMEN: Record<string, string> = {
  dok_rani_001: "aud_rani_001",
  dok_rani_002: "aud_rani_002",
  dok_bima_001: "aud_bima_001",
  dok_bima_002: "aud_bima_002",
};

function inisialisasiMockRevisi(dokumenId: string): ItemRevisi[] {
  if (!STATE_MOCK_REVISI.has(dokumenId)) {
    const dataAsal = DATA_ASAL_DOKUMEN_MOCK[dokumenId];
    const namaFile = dataAsal?.nama ?? `kontrak-${dokumenId.slice(-6)}.pdf`;
    const skorAsal = dataAsal?.skor_risiko ?? "merah";
    // Pakai audit_id yang dikenal jika tersedia supaya tidak trigger polling
    const auditId = AUDIT_ID_ASAL_DOKUMEN[dokumenId] ?? `aud_mock_${dokumenId}`;

    STATE_MOCK_REVISI.set(dokumenId, [
      {
        id: dokumenId,
        nama: namaFile,
        nomor_revisi: 0,
        catatan_revisi: undefined,
        status: skorAsal === null ? "memproses" : "selesai",
        skor_risiko: skorAsal,
        diunggah_pada: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        audit_id: auditId,
      },
    ]);
  }
  return STATE_MOCK_REVISI.get(dokumenId)!;
}

// Helper untuk testing — reset state mock revisi per dokumen
export function resetStateMockRevisi(dokumenId?: string): void {
  if (dokumenId) {
    STATE_MOCK_REVISI.delete(dokumenId);
  } else {
    STATE_MOCK_REVISI.clear();
  }
}

async function mockUnggahDokumen(
  file: File,
  opsi?: { nama?: string; kategori?: NilaiKategori }
): Promise<ResponsUnggahDokumen> {
  // Simulasi upload delay berdasarkan ukuran file
  const delayMs = Math.min(800 + file.size / 50000, 2500);
  await tundaMs(delayMs);

  const dokumenId = `dok_mock_${Date.now()}`;

  return {
    id: dokumenId,
    nama: opsi?.nama ?? file.name,
    kategori: opsi?.kategori ?? "lainnya",
    status: "menunggu",
    ukuran_bytes: file.size,
    tipe_file: file.type.includes("pdf") ? "pdf" : "gambar",
    diunggah_pada: new Date().toISOString(),
  };
}

async function mockMulaiAudit(
  dokumenKontrakId: string
): Promise<ResponsMulaiAudit> {
  // Simulasi server menerima job
  await tundaMs(500);

  return {
    id: `aud_mock_${Date.now()}`,
    dokumen_kontrak_id: dokumenKontrakId,
    status: "memproses",
    dimulai_pada: new Date().toISOString(),
    estimasi_selesai_detik: 60,
  };
}

async function mockUnggahRevisi(
  dokumenId: string,
  file: File,
  opsi?: { nama?: string; catatan_revisi?: string }
): Promise<ResponsUnggahRevisi> {
  const delayMs = Math.min(800 + file.size / 50000, 2000);
  await tundaMs(delayMs);

  // Simulasi dokumen tidak ditemukan — konsisten dengan api.md 6.5 error TIDAK_DITEMUKAN
  if (!dokumenId || !dokumenId.startsWith("dok_")) {
    throw new KesalahanAPI(
      "Dokumen tidak ditemukan atau bukan milikmu.",
      "TIDAK_DITEMUKAN",
      404
    );
  }

  const revisiSaatIni = inisialisasiMockRevisi(dokumenId);
  const nomorRevisiBerikutnya = revisiSaatIni.length; // 0-indexed, length = nomor berikutnya
  const idRevisiMock = `dok_mock_rev_${Date.now()}`;
  const auditIdMock = `aud_mock_rev_${Date.now()}`;

  // Simpan mapping revisiId → dokumenAsalId supaya ambilDetailDokumen
  // bisa mengisi revisi_dari_id yang benar (bukan placeholder "dok_mock")
  REVISI_KE_ASAL_MAP.set(idRevisiMock, dokumenId);

  // Tambah revisi baru ke state mock — status "memproses" dulu, audit berjalan async
  const itemRevisiMock: ItemRevisi = {
    id: idRevisiMock,
    nama: opsi?.nama ?? file.name,
    nomor_revisi: nomorRevisiBerikutnya,
    catatan_revisi: opsi?.catatan_revisi,
    status: "memproses",
    skor_risiko: null,
    diunggah_pada: new Date().toISOString(),
    audit_id: auditIdMock,
  };

  revisiSaatIni.push(itemRevisiMock);

  // Simulasi audit selesai setelah 2 detik (async) — skor acak untuk demonstrasi
  const skorAcak: Array<"hijau" | "kuning" | "merah"> = ["hijau", "kuning", "merah"];
  const skorDipilih = skorAcak[Math.floor(Math.random() * skorAcak.length)];
  setTimeout(() => {
    itemRevisiMock.status = "selesai";
    itemRevisiMock.skor_risiko = skorDipilih;
  }, 2000);

  return {
    id: idRevisiMock,
    nama: opsi?.nama ?? file.name,
    status: "menunggu",
    revisi_dari_id: dokumenId,
    nomor_revisi: nomorRevisiBerikutnya,
    diunggah_pada: new Date().toISOString(),
  };
}

async function mockAmbilRiwayatRevisi(
  dokumenId: string
): Promise<ResponsAPI<ItemRevisi[]>> {
  await tundaMs(400);

  const revisi = inisialisasiMockRevisi(dokumenId);

  return {
    berhasil: true,
    pesan: "Riwayat revisi berhasil diambil.",
    data: [...revisi], // spread supaya tidak mutate array asli
  };
}

async function mockHapusDokumen(
  dokumenId: string
): Promise<ResponsHapusDokumen> {
  // Simulasi latensi jaringan
  await tundaMs(600);

  // Simulasi dokumen tidak ditemukan jika ID tidak dikenal
  // (pada mock, semua ID dianggap valid karena tidak ada DB)
  if (!dokumenId || !dokumenId.startsWith("dok_")) {
    throw new Error("Dokumen tidak ditemukan.");
  }

  return {
    berhasil: true,
    pesan: "Dokumen berhasil dihapus.",
    data: null,
  };
}