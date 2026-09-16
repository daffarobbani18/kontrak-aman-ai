// ============================================================
// Service preferensi notifikasi — KontrakAman AI
// GET  /pengguna/saya/preferensi-notifikasi (api.md 5.7)
// PATCH /pengguna/saya/preferensi-notifikasi (api.md 5.8)
// F-PROF-03 PRD.md: preferensi notifikasi (Could Have)
// ============================================================

import { apiClient } from "@/lib/api-client";
import type {
  PreferensiNotifikasiData,
  PayloadPerbaruiPreferensi,
} from "../types";
import type { ResponsAPI } from "@/features/autentikasi/types";

// ------------------------------------------------------------
// GET /pengguna/saya/preferensi-notifikasi — api.md 5.7
// Mengembalikan preferensi notifikasi pengguna yang sedang login.
// Default semua true untuk pengguna baru (sesuai api.md 5.7).
// ------------------------------------------------------------
export async function ambilPreferensiNotifikasi(): Promise<
  ResponsAPI<PreferensiNotifikasiData>
> {
  return apiClient.get<PreferensiNotifikasiData>(
    "/pengguna/saya/preferensi-notifikasi",
    true
  );
}

// ------------------------------------------------------------
// PATCH /pengguna/saya/preferensi-notifikasi — api.md 5.8
// Partial update — hanya field yang dikirim yang diperbarui.
// Sesuai kontrak api.md 5.8: boleh kirim satu field saja.
// ------------------------------------------------------------
export async function perbaruiPreferensiNotifikasi(
  payload: PayloadPerbaruiPreferensi
): Promise<ResponsAPI<PreferensiNotifikasiData>> {
  return apiClient.patch<PreferensiNotifikasiData>(
    "/pengguna/saya/preferensi-notifikasi",
    payload as Record<string, unknown>,
    true
  );
}
