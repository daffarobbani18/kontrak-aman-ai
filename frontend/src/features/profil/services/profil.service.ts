// ============================================================
// Service profil — KontrakAman AI
// PATCH /pengguna/saya (api.md 5.2) — perbaruhiProfil & simpanOnboarding
// POST /pengguna/saya/ubah-kata-sandi (api.md 5.3)
// ============================================================

import { apiClient } from "@/lib/api-client";
import type { ResponsEditProfil, NilaiProfesi } from "../types";
import type { ResponsAPI } from "@/features/autentikasi/types";

// ------------------------------------------------------------
// PATCH /pengguna/saya — api.md 5.2
// Hanya nama_lengkap via JSON (avatar upload sprint berikutnya)
// ------------------------------------------------------------
export async function perbaruhiProfil(
  namaLengkap: string
): Promise<ResponsAPI<ResponsEditProfil>> {
  return apiClient.patch<ResponsEditProfil>(
    "/pengguna/saya",
    { nama_lengkap: namaLengkap },
    true
  );
}

// ------------------------------------------------------------
// PATCH /pengguna/saya — api.md 5.2
// Khusus untuk onboarding: simpan profesi + tandai onboarding_selesai
// Partial update — profesi bersifat opsional (saat pengguna lewati onboarding)
// Dipanggil oleh use-onboarding.ts sebagai pengganti localStorage
// ------------------------------------------------------------
export async function simpanOnboarding(
  profesi: NilaiProfesi | null
): Promise<ResponsAPI<ResponsEditProfil>> {
  // Bangun payload sesuai api.md 5.2 — hanya kirim field yang relevan
  // profesi tidak dikirim jika null (pengguna lewati onboarding)
  const payload: Record<string, unknown> = { onboarding_selesai: true };
  if (profesi !== null) {
    payload.profesi = profesi;
  }

  return apiClient.patch<ResponsEditProfil>("/pengguna/saya", payload, true);
}

// ------------------------------------------------------------
// POST /pengguna/saya/ubah-kata-sandi — api.md 5.3
// ------------------------------------------------------------
export async function ubahKataSandi(
  kataSandiLama: string,
  kataSandiBaru: string,
  konfirmasiKataSandiBaru: string
): Promise<ResponsAPI<null>> {
  return apiClient.post<null>(
    "/pengguna/saya/ubah-kata-sandi",
    {
      kata_sandi_lama: kataSandiLama,
      kata_sandi_baru: kataSandiBaru,
      konfirmasi_kata_sandi_baru: konfirmasiKataSandiBaru,
    },
    true
  );
}
