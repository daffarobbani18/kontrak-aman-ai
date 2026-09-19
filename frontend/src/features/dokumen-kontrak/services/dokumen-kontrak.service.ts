// ============================================================
// Service dokumen kontrak — KontrakAman AI
// Menangani POST /dokumen-kontrak/upload (api.md 6.1),
// POST /audit (api.md 7.1), DELETE /dokumen-kontrak/:id (api.md 6.4),
// POST/GET /dokumen-kontrak/:id/revisi (api.md 6.5–6.6)
// ============================================================

import { apiClient } from "@/lib/api-client";
import type {
  ResponsUnggahDokumen,
  ResponsMulaiAudit,
  ResponsHapusDokumen,
  ResponsUnggahRevisi,
  ItemRevisi,
  NilaiKategori,
} from "../types";
import type { ResponsAPI } from "@/features/autentikasi/types";

// ============================================================
// Unggah dokumen kontrak — POST /dokumen-kontrak/upload (api.md 6.1)
// Menerima FormData dengan field: file, nama (opsional), kategori (opsional)
// ============================================================
export async function unggahDokumen(
  file: File,
  opsi?: { nama?: string; kategori?: NilaiKategori }
): Promise<ResponsUnggahDokumen> {
  const formData = new FormData();
  formData.append("file", file);
  if (opsi?.nama) formData.append("nama", opsi.nama);
  if (opsi?.kategori) formData.append("kategori", opsi.kategori);

  const respons = await apiClient.postForm<ResponsUnggahDokumen>(
    "/dokumen-kontrak/upload",
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
  const respons = await apiClient.post<ResponsMulaiAudit>(
    "/audit",
    { dokumenId: dokumenKontrakId },
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
  return apiClient.get<ItemRevisi[]>(
    `/dokumen-kontrak/${dokumenId}/revisi`,
    true
  );
}
