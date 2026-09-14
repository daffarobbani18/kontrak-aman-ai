// ============================================================
// Tipe dan schema Zod untuk fitur profil — KontrakAman AI
// Selaras dengan api.md Bagian 5.2 dan 5.3
// Pesan error WAJIB Bahasa Indonesia sesuai AGENTS.md Bagian 5
// ============================================================

import { z } from "zod";

// ------------------------------------------------------------
// Tipe profesi — F-PROF-01 PRD.md
// Selaras dengan KATEGORI_KONTRAK di dokumen-kontrak/types
// Disimpan via PATCH /pengguna/saya (api.md 5.2) — field profesi dan onboarding_selesai
// Dipanggil oleh simpanOnboarding() di profil.service.ts
// ------------------------------------------------------------
export const PILIHAN_PROFESI = [
  {
    nilai: "desainer",
    label: "Desainer",
    deskripsi: "Desainer grafis, UI/UX, ilustrator",
    ikonNama: "Palette",
  },
  {
    nilai: "penulis",
    label: "Penulis",
    deskripsi: "Content writer, copywriter, jurnalis",
    ikonNama: "PenLine",
  },
  {
    nilai: "programmer",
    label: "Programmer",
    deskripsi: "Developer, software engineer, data scientist",
    ikonNama: "Code2",
  },
  {
    nilai: "lainnya",
    label: "Lainnya",
    deskripsi: "Fotografer, videografer, konsultan, dll",
    ikonNama: "Briefcase",
  },
] as const;

export type NilaiProfesi = (typeof PILIHAN_PROFESI)[number]["nilai"];

// ------------------------------------------------------------
// Schema edit profil — PATCH /pengguna/saya (api.md 5.2)
// Hanya nama_lengkap yang bisa diedit lewat JSON (avatar via multipart — sprint berikutnya)
// ------------------------------------------------------------
export const skemaEditProfil = z.object({
  nama_lengkap: z
    .string()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter"),
});

export type TipeEditProfil = z.infer<typeof skemaEditProfil>;

// ------------------------------------------------------------
// Schema ubah kata sandi — POST /pengguna/saya/ubah-kata-sandi (api.md 5.3)
// ------------------------------------------------------------
const aturanKataSandi = z
  .string()
  .min(8, "Kata sandi minimal 8 karakter")
  .regex(/[A-Z]/, "Kata sandi harus mengandung minimal 1 huruf besar")
  .regex(/[0-9]/, "Kata sandi harus mengandung minimal 1 angka")
  .regex(/[^A-Za-z0-9]/, "Kata sandi harus mengandung minimal 1 simbol");

export const skemaUbahKataSandi = z
  .object({
    kata_sandi_lama: z.string().min(1, "Kata sandi lama tidak boleh kosong"),
    kata_sandi_baru: aturanKataSandi,
    konfirmasi_kata_sandi_baru: z
      .string()
      .min(1, "Konfirmasi kata sandi tidak boleh kosong"),
  })
  .refine((data) => data.kata_sandi_baru === data.konfirmasi_kata_sandi_baru, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["konfirmasi_kata_sandi_baru"],
  });

export type TipeUbahKataSandi = z.infer<typeof skemaUbahKataSandi>;

// ------------------------------------------------------------
// Tipe respons PATCH /pengguna/saya (api.md 5.2)
// Field profesi dan onboarding_selesai ditambah sesuai api.md 5.2 terbaru
// ------------------------------------------------------------
export interface ResponsEditProfil {
  id: string;
  nama_lengkap: string;
  email: string;
  avatar_url: string | null;
  profesi: NilaiProfesi | null;
  onboarding_selesai: boolean;
}

// ------------------------------------------------------------
// State form
// ------------------------------------------------------------
export type StatusForm = "idle" | "menyimpan" | "tersimpan" | "gagal";

// ------------------------------------------------------------
// Tipe preferensi notifikasi — api.md 5.7 dan 5.8
// GET /pengguna/saya/preferensi-notifikasi  → ambilPreferensiNotifikasi()
// PATCH /pengguna/saya/preferensi-notifikasi → perbaruiPreferensiNotifikasi()
//
// PreferensiNotifikasi juga didefinisikan di notifikasi/types/index.ts
// (untuk kebutuhan hook notifikasi). Di sini dipakai khusus
// oleh service dan hook profil supaya tidak ada cross-feature import.
// Kedua definisi sengaja disinkronkan manual sesuai AGENTS.md Bagian 3.
// ------------------------------------------------------------

// Shape respons dari GET /pengguna/saya/preferensi-notifikasi (api.md 5.7)
export interface PreferensiNotifikasiData {
  audit_selesai: boolean;
  pengingat_tindak_lanjut: boolean;
  info_langganan: boolean;
  diperbarui_pada: string; // ISO 8601
}

// Payload untuk PATCH /pengguna/saya/preferensi-notifikasi (api.md 5.8)
// Partial update — hanya kirim field yang berubah
export type PayloadPerbaruiPreferensi = Partial<
  Pick<PreferensiNotifikasiData, "audit_selesai" | "pengingat_tindak_lanjut" | "info_langganan">
>;

// State machine hook use-preferensi-notifikasi
export type StatusMuatPreferensi = "idle" | "memuat" | "selesai" | "gagal";
export type StatusSimpanPreferensi = "idle" | "menyimpan" | "tersimpan" | "gagal";

export interface StatePreferensiNotifikasi {
  statusMuat: StatusMuatPreferensi;
  statusSimpan: StatusSimpanPreferensi;
  data: PreferensiNotifikasiData | null;
  pesanError: string | null;
}