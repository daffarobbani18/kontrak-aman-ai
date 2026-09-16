// ============================================================
// notifikasi.service.ts — service notifikasi in-app
// F-NOTIF-01 PRD.md: GET /notifikasi (api.md 11.1)
// F-NOTIF-02 PRD.md: pengingat tindak lanjut (api.md 11.1)
//
// Panggil endpoint yang terdokumentasi di api.md 11.1, 11.2, 11.3.
// Tidak ada endpoint baru — hanya yang sudah ada di api.md.
// ============================================================

import { apiClient } from "@/lib/api-client";
import { apiKeInternal, type ItemNotifikasiAPI } from "../types";
import type { ItemNotifikasi } from "../types";
import type { DataPaginasi } from "@/features/dashboard/types";

// ============================================================
// Tipe parameter dan respons
// ============================================================

export interface OpsiAmbilNotifikasi {
  sudah_dibaca?: boolean; // filter: true = sudah dibaca, false = belum dibaca
  limit?: number;         // default 20, maks 100 (api.md 11.1)
  cursor?: string;        // cursor paginasi
}

export interface ResponsNotifikasi {
  data: ItemNotifikasi[];
  paginasi: DataPaginasi;
}

// ============================================================
// ambilNotifikasi — GET /notifikasi (api.md 11.1)
// Mengembalikan daftar notifikasi in-app milik pengguna
// ============================================================
export async function ambilNotifikasi(
  opsi: OpsiAmbilNotifikasi = {}
): Promise<ResponsNotifikasi> {
  // Query params: sudah_dibaca, limit, cursor
  const params = new URLSearchParams();
  if (opsi.sudah_dibaca !== undefined) {
    params.set("sudah_dibaca", String(opsi.sudah_dibaca));
  }
  if (opsi.limit !== undefined) {
    params.set("limit", String(opsi.limit));
  }
  if (opsi.cursor) {
    params.set("cursor", opsi.cursor);
  }

  const queryString = params.toString();
  const path = queryString ? `/notifikasi?${queryString}` : "/notifikasi";

  // api.md 11.1: response wrapper { berhasil, data: { data: [...], paginasi: {...} } }
  // apiClient.get<T> mengembalikan ResponsAPI<T>, sehingga respons.data sudah bertipe T
  // T di sini adalah { data: ItemNotifikasiAPI[]; paginasi: DataPaginasi }
  type ResponsGetNotifikasi = { data: ItemNotifikasiAPI[]; paginasi: DataPaginasi };
  const respons = await apiClient.get<ResponsGetNotifikasi>(path);
  const payload = respons.data as ResponsGetNotifikasi;

  return {
    // Konversi snake_case API → camelCase internal via apiKeInternal (types/index.ts)
    data: payload.data.map(apiKeInternal),
    paginasi: payload.paginasi,
  };
}

// ============================================================
// tandaiDibaca — PATCH /notifikasi/:id/baca (api.md 11.2)
// Menandai satu notifikasi sebagai sudah dibaca
// ============================================================
export async function tandaiDibaca(id: string): Promise<void> {
  await apiClient.patch(`/notifikasi/${id}/baca`);
}

// ============================================================
// tandaiSemuaDibaca — PATCH /notifikasi/baca-semua (api.md 11.3)
// Menandai semua notifikasi milik pengguna sebagai sudah dibaca
// ============================================================
export async function tandaiSemuaDibaca(): Promise<void> {
  await apiClient.patch("/notifikasi/baca-semua");
}
