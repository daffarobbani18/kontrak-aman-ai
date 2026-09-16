// ============================================================
// Service negosiasi — KontrakAman AI
// POST /negosiasi (api.md 8.1) dan GET /negosiasi/:id (api.md 8.2)
// ============================================================

import { apiClient } from "@/lib/api-client";
import type {
  ResponsPermintaanNegosiasi,
  HasilNegosiasi,
} from "../types";

// ============================================================
// POST /negosiasi — api.md 8.1
// Meminta AI membuat draf negosiasi untuk satu klausul
// ============================================================
export async function mintaDrafNegosiasi(
  klausulId: string,
  konteksTambahan?: string
): Promise<ResponsPermintaanNegosiasi> {
  const body: Record<string, string> = { klausul_id: klausulId };
  if (konteksTambahan) body.konteks_tambahan = konteksTambahan;

  const respons = await apiClient.post<ResponsPermintaanNegosiasi>(
    "/negosiasi",
    body,
    true
  );
  return respons.data as ResponsPermintaanNegosiasi;
}

// ============================================================
// GET /negosiasi/:id — api.md 8.2
// Ambil hasil draf negosiasi (polling sampai status selesai)
// ============================================================
export async function ambilHasilNegosiasi(
  negosiasiId: string
): Promise<HasilNegosiasi> {
  const respons = await apiClient.get<HasilNegosiasi>(
    `/negosiasi/${negosiasiId}`,
    true
  );
  return respons.data as HasilNegosiasi;
}
