// ============================================================
// API Client terpusat — KontrakAman AI
// Selaras dengan format respons api.md Bagian 2
// Base URL dari env variable NEXT_PUBLIC_API_URL
// ============================================================

import type { ResponsAPI, ResponsKesalahan } from "@/features/autentikasi/types";

// Kode error dari api.md Bagian 3
export const KODE_ERROR = {
  PERMINTAAN_TIDAK_VALID: "PERMINTAAN_TIDAK_VALID",
  VALIDASI_GAGAL: "VALIDASI_GAGAL",
  TOKEN_TIDAK_VALID: "TOKEN_TIDAK_VALID",
  TOKEN_TIDAK_ADA: "TOKEN_TIDAK_ADA",
  AKSES_DITOLAK: "AKSES_DITOLAK",
  KUOTA_HABIS: "KUOTA_HABIS",
  LANGGANAN_DIPERLUKAN: "LANGGANAN_DIPERLUKAN",
  TIDAK_DITEMUKAN: "TIDAK_DITEMUKAN",
  EMAIL_SUDAH_TERDAFTAR: "EMAIL_SUDAH_TERDAFTAR",
  FORMAT_FILE_TIDAK_DIDUKUNG: "FORMAT_FILE_TIDAK_DIDUKUNG",
  UKURAN_FILE_MELEBIHI_BATAS: "UKURAN_FILE_MELEBIHI_BATAS",
  FILE_TIDAK_DAPAT_DIBACA: "FILE_TIDAK_DAPAT_DIBACA",
  TERLALU_BANYAK_PERMINTAAN: "TERLALU_BANYAK_PERMINTAAN",
  KESALAHAN_INTERNAL: "KESALAHAN_INTERNAL",
  LAYANAN_TIDAK_TERSEDIA: "LAYANAN_TIDAK_TERSEDIA",
} as const;

export type KodeError = (typeof KODE_ERROR)[keyof typeof KODE_ERROR];

// Kelas error khusus API agar bisa dibedakan dari error jaringan biasa
export class KesalahanAPI extends Error {
  kode: KodeError | string;
  statusHttp: number;
  detail?: Record<string, unknown>;

  constructor(
    pesan: string,
    kode: KodeError | string,
    statusHttp: number,
    detail?: Record<string, unknown>
  ) {
    super(pesan);
    this.name = "KesalahanAPI";
    this.kode = kode;
    this.statusHttp = statusHttp;
    this.detail = detail;
  }
}

// ============================================================
// Manajemen access token — disimpan di memory (bukan localStorage)
// Sesuai AGENTS.md Bagian 7: tidak bisa dicuri via XSS
// Refresh token dihandle backend via httpOnly cookie
// ============================================================
let accessTokenMemory: string | null = null;

export function simpanAccessToken(token: string): void {
  accessTokenMemory = token;
}

export function ambilAccessToken(): string | null {
  return accessTokenMemory;
}

export function hapusAccessToken(): void {
  accessTokenMemory = null;
}

// ============================================================
// Fungsi fetch utama
// ============================================================
const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.kontrakaman.id/v1";

interface OpsiPermintaan extends Omit<RequestInit, "body"> {
  body?: Record<string, unknown> | FormData;
  butuhAuth?: boolean;
}

export async function permintaanAPI<T = null>(
  path: string,
  opsi: OpsiPermintaan = {}
): Promise<ResponsAPI<T>> {
  const { body, butuhAuth = false, headers: headersTambahan, ...restOpsi } = opsi;

  // Susun headers
  const headers: Record<string, string> = {};

  // Tambahkan Content-Type hanya untuk JSON (bukan FormData)
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Tambahkan Authorization jika butuh auth
  if (butuhAuth) {
    const token = ambilAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // Gabungkan headers tambahan
  if (headersTambahan) {
    Object.assign(headers, headersTambahan);
  }

  let respons: Response;
  try {
    respons = await fetch(`${baseUrl}${path}`, {
      ...restOpsi,
      headers,
      // Sertakan cookies (refresh token httpOnly) setiap request
      credentials: "include",
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Error jaringan — bukan error dari server
    throw new KesalahanAPI(
      "Tidak dapat terhubung ke server. Periksa koneksi internetmu.",
      "KESALAHAN_JARINGAN",
      0
    );
  }

  // Parse body respons
  let dataRespons: ResponsAPI<T> | ResponsKesalahan;
  try {
    dataRespons = await respons.json();
  } catch {
    throw new KesalahanAPI(
      "Respons server tidak valid. Coba lagi dalam beberapa saat.",
      "KESALAHAN_INTERNAL",
      respons.status
    );
  }

  // Handle respons error dari server
  if (!dataRespons.berhasil) {
    const errorData = dataRespons as ResponsKesalahan;
    throw new KesalahanAPI(
      errorData.pesan,
      errorData.kesalahan?.kode ?? "KESALAHAN_INTERNAL",
      respons.status,
      errorData.kesalahan?.detail
    );
  }

  return dataRespons as ResponsAPI<T>;
}

// ============================================================
// Helper untuk method HTTP yang umum dipakai
// ============================================================
export const apiClient = {
  get: <T = null>(path: string, butuhAuth = true) =>
    permintaanAPI<T>(path, { method: "GET", butuhAuth }),

  post: <T = null>(path: string, body?: Record<string, unknown>, butuhAuth = false) =>
    permintaanAPI<T>(path, { method: "POST", body, butuhAuth }),

  patch: <T = null>(path: string, body?: Record<string, unknown>, butuhAuth = true) =>
    permintaanAPI<T>(path, { method: "PATCH", body, butuhAuth }),

  delete: <T = null>(path: string, butuhAuth = true) =>
    permintaanAPI<T>(path, { method: "DELETE", butuhAuth }),

  postForm: <T = null>(path: string, body: FormData, butuhAuth = true) =>
    permintaanAPI<T>(path, { method: "POST", body, butuhAuth }),
};
