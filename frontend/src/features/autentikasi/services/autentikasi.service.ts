// ============================================================
// Service autentikasi — KontrakAman AI
// Hanya memanggil endpoint dari api.md Bagian 4
// Tidak ada logika bisnis di sini, hanya pemanggil API
// ============================================================

import { apiClient, simpanAccessToken, hapusAccessToken } from "@/lib/api-client";
import type {
  TipeMasuk,
  TipeDaftar,
  TipeLupaKataSandi,
  TipeResetKataSandi,
  ResponsAPI,
  ResponsMasuk,
  ResponsDaftar,
  ResponsPembaruanToken,
} from "@/features/autentikasi/types";

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.kontrakaman.id/v1";

// ------------------------------------------------------------
// POST /auth/daftar
// Mendaftarkan akun baru — api.md 4.1
// ------------------------------------------------------------
export async function daftar(
  payload: Omit<TipeDaftar, "setuju_kebijakan_privasi">
): Promise<ResponsAPI<ResponsDaftar>> {
  return apiClient.post<ResponsDaftar>("/auth/daftar", {
    nama_lengkap: payload.nama_lengkap,
    email: payload.email,
    kata_sandi: payload.kata_sandi,
    konfirmasi_kata_sandi: payload.konfirmasi_kata_sandi,
  });
}

// ------------------------------------------------------------
// POST /auth/masuk
// Login email + kata sandi — api.md 4.3
// Menyimpan access token ke memory setelah berhasil
// ------------------------------------------------------------
export async function masuk(payload: TipeMasuk): Promise<ResponsAPI<ResponsMasuk>> {
  const respons = await apiClient.post<ResponsMasuk>("/auth/masuk", {
    email: payload.email,
    kata_sandi: payload.kata_sandi,
  });

  // Simpan access token di memory — refresh token diset backend via httpOnly cookie
  if (respons.berhasil && respons.data.access_token) {
    simpanAccessToken(respons.data.access_token);
  }

  return respons;
}

// ------------------------------------------------------------
// GET /auth/google
// Redirect ke Google OAuth — api.md 4.4
// Tidak bisa pakai fetch biasa, harus redirect browser langsung
// ------------------------------------------------------------
export function masukDenganGoogle(): void {
  window.location.href = `${baseUrl}/auth/google`;
}

// ------------------------------------------------------------
// POST /auth/keluar
// Logout — cabut refresh token — api.md 4.6
// ------------------------------------------------------------
export async function keluar(refreshToken: string): Promise<ResponsAPI<null>> {
  const respons = await apiClient.post<null>(
    "/auth/keluar",
    { refresh_token: refreshToken },
    true // butuh auth
  );

  // Hapus access token dari memory setelah logout
  hapusAccessToken();

  return respons;
}

// ------------------------------------------------------------
// POST /auth/lupa-kata-sandi
// Kirim email reset kata sandi — api.md 4.7
// Selalu respons 200, tidak bocorkan apakah email terdaftar
// ------------------------------------------------------------
export async function lupaKataSandi(payload: TipeLupaKataSandi): Promise<ResponsAPI<null>> {
  return apiClient.post<null>("/auth/lupa-kata-sandi", {
    email: payload.email,
  });
}

// ------------------------------------------------------------
// POST /auth/reset-kata-sandi
// Reset kata sandi dengan token dari email — api.md 4.8
// Token berlaku 1 jam
// ------------------------------------------------------------
export async function resetKataSandi(payload: TipeResetKataSandi): Promise<ResponsAPI<null>> {
  return apiClient.post<null>("/auth/reset-kata-sandi", {
    token: payload.token,
    kata_sandi_baru: payload.kata_sandi_baru,
    konfirmasi_kata_sandi_baru: payload.konfirmasi_kata_sandi_baru,
  });
}

// ------------------------------------------------------------
// GET /auth/verifikasi-email?token={token}
// Verifikasi email dari link di email — api.md 4.2
// Token hanya bisa dipakai sekali
// ------------------------------------------------------------
export async function verifikasiEmail(token: string): Promise<ResponsAPI<null>> {
  return apiClient.get<null>(
    `/auth/verifikasi-email?token=${encodeURIComponent(token)}`,
    false // tidak butuh auth
  );
}

// ------------------------------------------------------------
// POST /auth/perbarui-token
// Refresh access token — api.md 4.5
// Dipanggil otomatis saat access token expired
// ------------------------------------------------------------
export async function perbaruiToken(
  refreshToken: string
): Promise<ResponsAPI<ResponsPembaruanToken>> {
  const respons = await apiClient.post<ResponsPembaruanToken>("/auth/perbarui-token", {
    refresh_token: refreshToken,
  });

  // Perbarui access token di memory
  if (respons.berhasil && respons.data.access_token) {
    simpanAccessToken(respons.data.access_token);
  }

  return respons;
}
