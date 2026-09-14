import { z } from "zod";

// ============================================================
// Schema Zod untuk fitur autentikasi — KontrakAman AI
// Selaras dengan validasi di api.md Bagian 4
// Pesan error WAJIB Bahasa Indonesia sesuai AGENTS.md Bagian 5
// ============================================================

// Aturan kata sandi — min 8 karakter, 1 huruf besar, 1 angka, 1 simbol
// Sesuai validasi api.md POST /auth/daftar
const aturanKataSandi = z
  .string()
  .min(8, "Kata sandi minimal 8 karakter")
  .regex(/[A-Z]/, "Kata sandi harus mengandung minimal 1 huruf besar")
  .regex(/[0-9]/, "Kata sandi harus mengandung minimal 1 angka")
  .regex(/[^A-Za-z0-9]/, "Kata sandi harus mengandung minimal 1 simbol");

// ------------------------------------------------------------
// Schema masuk — POST /auth/masuk
// ------------------------------------------------------------
export const skemaMasuk = z.object({
  email: z.string().min(1, "Email tidak boleh kosong").email("Format email tidak valid"),
  kata_sandi: z.string().min(1, "Kata sandi tidak boleh kosong"),
});

export type TipeMasuk = z.infer<typeof skemaMasuk>;

// ------------------------------------------------------------
// Schema daftar — POST /auth/daftar
// ------------------------------------------------------------
export const skemaDaftar = z
  .object({
    nama_lengkap: z
      .string()
      .min(2, "Nama lengkap minimal 2 karakter")
      .max(100, "Nama lengkap maksimal 100 karakter"),
    email: z.string().min(1, "Email tidak boleh kosong").email("Format email tidak valid"),
    kata_sandi: aturanKataSandi,
    konfirmasi_kata_sandi: z.string().min(1, "Konfirmasi kata sandi tidak boleh kosong"),
    setuju_kebijakan_privasi: z.boolean().refine((val) => val === true, {
      message: "Kamu harus menyetujui kebijakan privasi untuk melanjutkan",
    }),
  })
  .refine((data) => data.kata_sandi === data.konfirmasi_kata_sandi, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["konfirmasi_kata_sandi"],
  });

export type TipeDaftar = z.infer<typeof skemaDaftar>;

// ------------------------------------------------------------
// Schema lupa kata sandi — POST /auth/lupa-kata-sandi
// ------------------------------------------------------------
export const skemaLupaKataSandi = z.object({
  email: z.string().min(1, "Email tidak boleh kosong").email("Format email tidak valid"),
});

export type TipeLupaKataSandi = z.infer<typeof skemaLupaKataSandi>;

// ------------------------------------------------------------
// Schema reset kata sandi — POST /auth/reset-kata-sandi
// ------------------------------------------------------------
export const skemaResetKataSandi = z
  .object({
    token: z.string().min(1, "Token reset tidak valid"),
    kata_sandi_baru: aturanKataSandi,
    konfirmasi_kata_sandi_baru: z.string().min(1, "Konfirmasi kata sandi tidak boleh kosong"),
  })
  .refine((data) => data.kata_sandi_baru === data.konfirmasi_kata_sandi_baru, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["konfirmasi_kata_sandi_baru"],
  });

export type TipeResetKataSandi = z.infer<typeof skemaResetKataSandi>;

// ------------------------------------------------------------
// Tipe respons API — sesuai format respons api.md Bagian 2
// ------------------------------------------------------------
export interface ResponsAPI<T = null> {
  berhasil: boolean;
  pesan: string;
  data: T;
}

export interface ResponsKesalahan {
  berhasil: false;
  pesan: string;
  kesalahan: {
    kode: string;
    detail?: Record<string, unknown>;
  };
}

// Tipe data pengguna dari respons masuk
export interface DataPengguna {
  id: string;
  nama_lengkap: string;
  email: string;
  tier: "gratis" | "pro" | "bisnis";
  avatar_url: string | null;
}

// Tipe respons masuk — data.data dari POST /auth/masuk
export interface ResponsMasuk {
  access_token: string;
  refresh_token: string;
  tipe_token: "Bearer";
  kedaluwarsa_dalam: number;
  pengguna: DataPengguna;
}

// Tipe respons daftar — data.data dari POST /auth/daftar
export interface ResponsDaftar {
  id: string;
  nama_lengkap: string;
  email: string;
  email_terverifikasi: boolean;
  dibuat_pada: string;
}

// Tipe respons perbarui token — data.data dari POST /auth/perbarui-token
export interface ResponsPembaruanToken {
  access_token: string;
  refresh_token: string;
  tipe_token: "Bearer";
  kedaluwarsa_dalam: number;
}
