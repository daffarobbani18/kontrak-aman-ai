// ============================================================
// Service preferensi notifikasi — KontrakAman AI
// GET  /pengguna/saya/preferensi-notifikasi (api.md 5.7)
// PATCH /pengguna/saya/preferensi-notifikasi (api.md 5.8)
// F-PROF-03 PRD.md: preferensi notifikasi (Could Have)
//
// Mock-aware: cek NEXT_PUBLIC_MOCK_AUTH sebelum panggil API sungguhan.
// Saat backend tersedia, set NEXT_PUBLIC_MOCK_AUTH=false — service
// langsung pakai apiClient tanpa perubahan kode lain.
// ============================================================

import { apiClient, KesalahanAPI } from "@/lib/api-client";
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
  if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
    return mockAmbilPreferensiNotifikasi();
  }

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
  if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
    return mockPerbaruiPreferensiNotifikasi(payload);
  }

  return apiClient.patch<PreferensiNotifikasiData>(
    "/pengguna/saya/preferensi-notifikasi",
    payload as Record<string, unknown>,
    true
  );
}

// ============================================================
// Mock untuk development dan testing
// Menyimulasikan perilaku backend sesuai kontrak api.md 5.7 dan 5.8
// ============================================================

function tundaMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// State mock — disimpan di memory selama sesi dev berlangsung
// Mencerminkan default "semua aktif" sesuai api.md 5.7
let stateMockPreferensi: PreferensiNotifikasiData = {
  audit_selesai: true,
  pengingat_tindak_lanjut: true,
  info_langganan: true,
  diperbarui_pada: new Date().toISOString(),
};

async function mockAmbilPreferensiNotifikasi(): Promise<
  ResponsAPI<PreferensiNotifikasiData>
> {
  await tundaMs(400);

  return {
    berhasil: true,
    pesan: "Preferensi notifikasi berhasil diambil.",
    data: { ...stateMockPreferensi },
  };
}

async function mockPerbaruiPreferensiNotifikasi(
  payload: PayloadPerbaruiPreferensi
): Promise<ResponsAPI<PreferensiNotifikasiData>> {
  await tundaMs(400);

  // Simulasi error validasi — field tidak dikenal (api.md kode error VALIDASI_GAGAL)
  const fieldDiizinkan = [
    "audit_selesai",
    "pengingat_tindak_lanjut",
    "info_langganan",
  ] as const;
  const fieldDikirim = Object.keys(payload);
  const adaFieldTidakDikenal = fieldDikirim.some(
    (f) => !fieldDiizinkan.includes(f as (typeof fieldDiizinkan)[number])
  );

  if (adaFieldTidakDikenal) {
    throw new KesalahanAPI(
      "Field tidak dikenal atau tipe bukan boolean.",
      "VALIDASI_GAGAL",
      400
    );
  }

  // Terapkan partial update ke state mock (sama seperti perilaku backend)
  stateMockPreferensi = {
    ...stateMockPreferensi,
    ...payload,
    diperbarui_pada: new Date().toISOString(),
  };

  return {
    berhasil: true,
    pesan: "Preferensi notifikasi berhasil diperbarui.",
    data: { ...stateMockPreferensi },
  };
}

// ------------------------------------------------------------
// Helper untuk testing — reset state mock ke default
// Dipanggil di beforeEach/afterEach test supaya test tidak saling bergantung
// ------------------------------------------------------------
export function resetStateMockPreferensi(): void {
  stateMockPreferensi = {
    audit_selesai: true,
    pengingat_tindak_lanjut: true,
    info_langganan: true,
    diperbarui_pada: new Date().toISOString(),
  };
}