// ============================================================
// Service dokumen pratinjau — KontrakAman AI
// Memanggil GET /dokumen-kontrak/:id (api.md 6.3)
// Dipakai khusus di halaman hasil audit untuk mengambil url_pratinjau
// ============================================================

import { apiClient } from "@/lib/api-client";
import type { DetailDokumenKontrak } from "../types";

// ============================================================
// GET /dokumen-kontrak/:id — api.md 6.3
// Mengembalikan detail dokumen termasuk url_pratinjau
// ============================================================
export async function ambilDetailDokumen(
  dokumenId: string
): Promise<DetailDokumenKontrak> {
  const respons = await apiClient.get<DetailDokumenKontrak>(
    `/dokumen-kontrak/${dokumenId}`,
    true // butuh auth
  );

  return respons.data as DetailDokumenKontrak;
}
