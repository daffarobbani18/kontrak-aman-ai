// ============================================================
// Service dashboard — KontrakAman AI
// Hanya memanggil endpoint dari api.md Bagian 5.1 dan 6.2
// Tidak ada endpoint tambahan di luar spec
// ============================================================

import { apiClient } from "@/lib/api-client";
import type {
  DataProfilPengguna,
  ItemDokumenKontrak,
  DataPaginasi,
} from "@/features/dashboard/types";
import type { ResponsAPI } from "@/features/autentikasi/types";

// ------------------------------------------------------------
// GET /pengguna/saya — api.md 5.1
// Profil + status kuota + langganan aktif
// ------------------------------------------------------------
export async function ambilProfil(): Promise<ResponsAPI<DataProfilPengguna>> {
  return apiClient.get<DataProfilPengguna>("/pengguna/saya", true);
}

// ------------------------------------------------------------
// GET /dokumen-kontrak — api.md 6.2
// Daftar dokumen kontrak milik pengguna yang sedang login
// Mendukung filter status dan paginasi cursor
// ------------------------------------------------------------
export async function ambilDaftarDokumen(opsi?: {
  status?: "menunggu" | "memproses" | "selesai" | "gagal";
  limit?: number;
  cursor?: string;
}): Promise<ResponsAPI<ItemDokumenKontrak[]> & { paginasi: DataPaginasi }> {
  const params = new URLSearchParams();
  // Backend DTO (DtoDaftarDokumen) hanya menerima: cursor, batas, risikoLevel
  if (opsi?.limit) params.set("batas", String(opsi.limit));
  if (opsi?.cursor) params.set("cursor", opsi.cursor);

  const queryString = params.toString();
  const path = queryString ? `/dokumen-kontrak?${queryString}` : "/dokumen-kontrak";

  const respons = await apiClient.get<{
    data: any[];
    cursorBerikut: string | null;
    adaHalamanBerikut: boolean;
    total?: number;
  }>(path, true);

  const dataMentah = respons.data.data || [];
  const dataDiproses: ItemDokumenKontrak[] = dataMentah.map((item: any) => {
    let statusMapped: ItemDokumenKontrak["status"] = "menunggu";
    const s = String(item.status).toUpperCase();
    if (s === "PROCESSING" || s === "MEMPROSES") statusMapped = "memproses";
    else if (s === "COMPLETED" || s === "SELESAI") statusMapped = "selesai";
    else if (s === "FAILED" || s === "GAGAL") statusMapped = "gagal";

    return {
      id: item.id,
      nama: item.file_name || item.nama || "Dokumen Tanpa Nama",
      kategori: item.kategori || "lainnya",
      status: statusMapped,
      skor_risiko: item.skor_risiko || null,
      diunggah_pada: item.created_at || item.diunggah_pada || new Date().toISOString(),
      audit_id: item.audit_id || null,
    };
  });

  return {
    berhasil: respons.berhasil,
    pesan: respons.pesan,
    data: dataDiproses,
    paginasi: {
      cursor_berikutnya: respons.data.cursorBerikut || null,
      ada_lagi: respons.data.adaHalamanBerikut || false,
      total: respons.data.total || dataDiproses.length,
    },
  };
}
