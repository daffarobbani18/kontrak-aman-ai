// ============================================================
// Service dashboard — KontrakAman AI
// Hanya memanggil endpoint dari api.md Bagian 5.1 dan 6.2
// Tidak ada endpoint tambahan di luar spec
// Mock-aware: env dibaca dinamis supaya vi.stubEnv() di test bekerja
// ============================================================

import { apiClient } from "@/lib/api-client";
import { mockAmbilProfil, mockAmbilDaftarDokumen } from "@/lib/mock-dashboard";
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
  if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
    const emailMock =
      typeof window !== "undefined"
        ? (sessionStorage.getItem("mock_email") ?? "rani@example.com")
        : "rani@example.com";
    return mockAmbilProfil(emailMock);
  }
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
  if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
    const emailMock =
      typeof window !== "undefined"
        ? (sessionStorage.getItem("mock_email") ?? "rani@example.com")
        : "rani@example.com";
    // Ambil profil dulu untuk dapatkan userId, lalu ambil dokumen
    const responsProfil = await mockAmbilProfil(emailMock);
    const responsDokumen = await mockAmbilDaftarDokumen(responsProfil.data.id);

    // Terapkan filter status di sisi client untuk mock
    const dokumenTerfilter = opsi?.status
      ? responsDokumen.data.filter((d) => d.status === opsi.status)
      : responsDokumen.data;

    return {
      ...responsDokumen,
      data: dokumenTerfilter,
      paginasi: {
        ...responsDokumen.paginasi,
        total: dokumenTerfilter.length,
      },
    };
  }

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
