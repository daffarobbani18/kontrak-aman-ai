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
  if (opsi?.status) params.set("status", opsi.status);
  if (opsi?.limit) params.set("limit", String(opsi.limit));
  if (opsi?.cursor) params.set("cursor", opsi.cursor);

  const queryString = params.toString();
  const path = queryString ? `/dokumen-kontrak?${queryString}` : "/dokumen-kontrak";

  return apiClient.get<ItemDokumenKontrak[]>(path, true) as Promise<
    ResponsAPI<ItemDokumenKontrak[]> & { paginasi: DataPaginasi }
  >;
}
