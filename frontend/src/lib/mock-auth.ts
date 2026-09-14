// ============================================================
// Mock autentikasi — HANYA untuk development, sebelum backend tersedia
// Hapus file ini dan env variable NEXT_PUBLIC_MOCK_AUTH=true
// begitu backend sudah berjalan
// ============================================================

import type { ResponsAPI, ResponsMasuk, ResponsDaftar } from "@/features/autentikasi/types";
import { KesalahanAPI } from "@/lib/api-client";

// Akun dummy yang bisa dipakai untuk login
const AKUN_DUMMY: Record<string, { kata_sandi: string; pengguna: ResponsMasuk["pengguna"] }> = {
  "rani@example.com": {
    kata_sandi: "Password123!",
    pengguna: {
      id: "usr_dummy_rani",
      nama_lengkap: "Rani Desainer",
      email: "rani@example.com",
      tier: "gratis",
      avatar_url: null,
    },
  },
  "bima@example.com": {
    kata_sandi: "Password123!",
    pengguna: {
      id: "usr_dummy_bima",
      nama_lengkap: "Bima Programmer",
      email: "bima@example.com",
      tier: "pro",
      avatar_url: null,
    },
  },
  "sari@example.com": {
    kata_sandi: "Password123!",
    pengguna: {
      id: "usr_dummy_sari",
      nama_lengkap: "Sari Penulis",
      email: "sari@example.com",
      tier: "gratis",
      avatar_url: null,
    },
  },
};

// Simulasi delay jaringan agar terasa realistis
function tundaMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mock token — tidak valid untuk backend nyata
const MOCK_ACCESS_TOKEN = "mock_access_token_dev_only";
const MOCK_REFRESH_TOKEN = "mock_refresh_token_dev_only";

// ============================================================
// Mock masuk — meniru POST /auth/masuk (api.md 4.3)
// ============================================================
export async function mockMasuk(
  email: string,
  kata_sandi: string
): Promise<ResponsAPI<ResponsMasuk>> {
  await tundaMs(800);

  const akun = AKUN_DUMMY[email.toLowerCase()];

  if (!akun) {
    throw new KesalahanAPI(
      "Email atau kata sandi yang kamu masukkan salah.",
      "TOKEN_TIDAK_VALID",
      401
    );
  }

  if (akun.kata_sandi !== kata_sandi) {
    throw new KesalahanAPI(
      "Email atau kata sandi yang kamu masukkan salah.",
      "TOKEN_TIDAK_VALID",
      401
    );
  }

  return {
    berhasil: true,
    pesan: "Berhasil masuk.",
    data: {
      access_token: MOCK_ACCESS_TOKEN,
      refresh_token: MOCK_REFRESH_TOKEN,
      tipe_token: "Bearer",
      kedaluwarsa_dalam: 900,
      pengguna: akun.pengguna,
    },
  };
}

// ============================================================
// Mock daftar — meniru POST /auth/daftar (api.md 4.1)
// ============================================================
export async function mockDaftar(
  nama_lengkap: string,
  email: string
): Promise<ResponsAPI<ResponsDaftar>> {
  await tundaMs(1000);

  // Simulasi email sudah terdaftar
  if (AKUN_DUMMY[email.toLowerCase()]) {
    throw new KesalahanAPI(
      "Email ini sudah terdaftar. Coba masuk atau gunakan email lain.",
      "EMAIL_SUDAH_TERDAFTAR",
      409
    );
  }

  return {
    berhasil: true,
    pesan: "Akun berhasil dibuat. Silakan cek email untuk verifikasi.",
    data: {
      id: `usr_dummy_${Date.now()}`,
      nama_lengkap,
      email,
      email_terverifikasi: false,
      dibuat_pada: new Date().toISOString(),
    },
  };
}

// ============================================================
// Mock lupa kata sandi — meniru POST /auth/lupa-kata-sandi (api.md 4.7)
// Selalu berhasil, tidak bocorkan status email
// ============================================================
export async function mockLupaKataSandi(): Promise<ResponsAPI<null>> {
  await tundaMs(600);
  return {
    berhasil: true,
    pesan: "Jika email terdaftar, instruksi reset kata sandi telah dikirim.",
    data: null,
  };
}

// ============================================================
// Mock reset kata sandi — meniru POST /auth/reset-kata-sandi (api.md 4.8)
// ============================================================
export async function mockResetKataSandi(token: string): Promise<ResponsAPI<null>> {
  await tundaMs(800);

  // Simulasi token tidak valid
  if (!token || token === "invalid") {
    throw new KesalahanAPI(
      "Token reset tidak valid atau sudah kedaluwarsa.",
      "TOKEN_TIDAK_VALID",
      400
    );
  }

  return {
    berhasil: true,
    pesan: "Kata sandi berhasil diubah. Silakan masuk dengan kata sandi baru.",
    data: null,
  };
}

// ============================================================
// Mock verifikasi email — meniru GET /auth/verifikasi-email (api.md 4.2)
// ============================================================
export async function mockVerifikasiEmail(token: string): Promise<ResponsAPI<null>> {
  await tundaMs(1000);

  if (!token || token === "invalid") {
    throw new KesalahanAPI(
      "Tautan verifikasi tidak valid atau sudah kedaluwarsa.",
      "TOKEN_TIDAK_VALID",
      400
    );
  }

  return {
    berhasil: true,
    pesan: "Email berhasil diverifikasi. Silakan masuk.",
    data: null,
  };
}
