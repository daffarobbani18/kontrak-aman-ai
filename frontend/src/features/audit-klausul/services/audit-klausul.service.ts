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
  const respons = await apiClient.get<any>(`/audit/${auditId}`, true);
  const data = respons.data;

  // Map status
  let statusMapped = "memproses";
  const s = String(data.status).toUpperCase();
  if (s === "COMPLETED" || s === "SELESAI") statusMapped = "selesai";
  else if (s === "FAILED" || s === "GAGAL") statusMapped = "gagal";
  else statusMapped = "memproses";

  return {
    ...data,
    status: statusMapped,
    dokumen_kontrak_id: data.dokumenKontrakId || data.dokumen_kontrak_id || data.dokumenId,
    skor_risiko: data.skorRisiko || data.skor_risiko,
    dimulai_pada: data.dibuatPada || data.dimulai_pada,
    selesai_pada: data.selesaiPada || data.selesai_pada,
    progres_persen: data.progresPersen ?? data.progres_persen ?? 0,
  } as HasilAudit;
}
