// ============================================================
// Service audit klausul — KontrakAman AI
// Memanggil GET /audit/:id (api.md 7.2)
// ============================================================

import { apiClient } from "@/lib/api-client";
import type { HasilAudit } from "../types";

// ============================================================
// GET /audit/:id — api.md 7.2
// Mengembalikan hasil audit (selesai) atau status progres (memproses)
// ============================================================
export async function ambilHasilAudit(auditId: string): Promise<HasilAudit> {
  const respons = await apiClient.get<HasilAudit>(`/audit/${auditId}`, true);
  return respons.data as HasilAudit;
}
