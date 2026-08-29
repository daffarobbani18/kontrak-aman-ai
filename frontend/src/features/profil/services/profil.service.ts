// ============================================================
// Service profil — KontrakAman AI
// PATCH /pengguna/saya (api.md 5.2) — perbaruhiProfil & simpanOnboarding
// POST /pengguna/saya/ubah-kata-sandi (api.md 5.3)
// Mock-aware: env dibaca dinamis supaya vi.stubEnv() di test bekerja
// ============================================================

import { apiClient, KesalahanAPI } from "@/lib/api-client";
import type { ResponsEditProfil, NilaiProfesi } from "../types";
import type { ResponsAPI } from "@/features/autentikasi/types";

// ------------------------------------------------------------
// PATCH /pengguna/saya — api.md 5.2
// Hanya nama_lengkap via JSON (avatar upload sprint berikutnya)
// ------------------------------------------------------------
export async function perbaruhiProfil(
  namaLengkap: string
): Promise<ResponsAPI<ResponsEditProfil>> {
  if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
    return mockPerbaruiProfil(namaLengkap);
  }

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
  if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
    return mockSimpanOnboarding(profesi);
  }

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
  if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
    return mockUbahKataSandi(kataSandiLama);
  }

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

// ============================================================
// Mock untuk development
// ============================================================
function tundaMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// State mock profil — disimpan di memory selama sesi dev
// Dipakai bersama mockPerbaruiProfil dan mockSimpanOnboarding
let stateMockProfil = {
  nama_lengkap: "Rani Desainer",
  profesi: null as NilaiProfesi | null,
  onboarding_selesai: false,
};

// Helper untuk testing — reset state mock ke default
export function resetStateMockProfil(): void {
  stateMockProfil = {
    nama_lengkap: "Rani Desainer",
    profesi: null,
    onboarding_selesai: false,
  };
}

async function mockPerbaruiProfil(
  namaLengkap: string
): Promise<ResponsAPI<ResponsEditProfil>> {
  await tundaMs(600);

  // Baca email mock dari sessionStorage untuk konsistensi
  const emailMock =
    typeof window !== "undefined"
      ? (sessionStorage.getItem("mock_email") ?? "rani@example.com")
      : "rani@example.com";

  // Update state mock nama
  stateMockProfil.nama_lengkap = namaLengkap;

  return {
    berhasil: true,
    pesan: "Profil berhasil diperbarui.",
    data: {
      id: "usr_dummy_mock",
      nama_lengkap: namaLengkap,
      email: emailMock,
      avatar_url: null,
      profesi: stateMockProfil.profesi,
      onboarding_selesai: stateMockProfil.onboarding_selesai,
    },
  };
}

async function mockSimpanOnboarding(
  profesi: NilaiProfesi | null
): Promise<ResponsAPI<ResponsEditProfil>> {
  await tundaMs(500);

  // Baca email mock dari sessionStorage untuk konsistensi
  const emailMock =
    typeof window !== "undefined"
      ? (sessionStorage.getItem("mock_email") ?? "rani@example.com")
      : "rani@example.com";

  // Update state mock — partial update sesuai perilaku backend
  if (profesi !== null) {
    stateMockProfil.profesi = profesi;
  }
  stateMockProfil.onboarding_selesai = true;

  return {
    berhasil: true,
    pesan: "Profil berhasil diperbarui.",
    data: {
      id: "usr_dummy_mock",
      nama_lengkap: stateMockProfil.nama_lengkap,
      email: emailMock,
      avatar_url: null,
      profesi: stateMockProfil.profesi,
      onboarding_selesai: true,
    },
  };
}

async function mockUbahKataSandi(
  kataSandiLama: string
): Promise<ResponsAPI<null>> {
  await tundaMs(700);

  // Simulasi kata sandi lama salah — untuk testing jalur error
  if (kataSandiLama === "salah123") {
    throw new KesalahanAPI(
      "Kata sandi lama tidak cocok.",
      "VALIDASI_GAGAL",
      400
    );
  }

  return {
    berhasil: true,
    pesan: "Kata sandi berhasil diubah.",
    data: null,
  };
}