// ============================================================
// Tipe dan schema validasi dokumen kontrak — KontrakAman AI
// Selaras dengan api.md Bagian 6 (POST /dokumen-kontrak) dan 7 (POST /audit)
// ============================================================

import { z } from "zod";

// ============================================================
// Konstanta
// ============================================================
export const TIPE_FILE_DIDUKUNG = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;
export const EKSTENSI_DIDUKUNG = [".pdf", ".jpg", ".jpeg", ".png", ".webp"] as const;
export const UKURAN_MAKS_BYTES = 10 * 1024 * 1024; // 10MB sesuai api.md 6.1
export const UKURAN_MAKS_LABEL = "10MB";

export const KATEGORI_KONTRAK = [
  { nilai: "desain", label: "Desain" },
  { nilai: "penulisan", label: "Penulisan" },
  { nilai: "pemrograman", label: "Pemrograman" },
  { nilai: "lainnya", label: "Lainnya" },
] as const;

export type NilaiKategori = (typeof KATEGORI_KONTRAK)[number]["nilai"];

// ============================================================
// Schema Zod untuk validasi form unggah — sesuai AGENTS.md Bagian 4
// Pesan error dalam Bahasa Indonesia
// ============================================================
export const skemaUnggahDokumen = z.object({
  file: z
    .custom<File>((val) => val instanceof File, "File wajib dipilih.")
    .refine(
      (file) => TIPE_FILE_DIDUKUNG.includes(file.type as (typeof TIPE_FILE_DIDUKUNG)[number]),
      "Format file tidak didukung. Gunakan PDF, JPG, PNG, atau WEBP."
    )
    .refine(
      (file) => file.size <= UKURAN_MAKS_BYTES,
      `Ukuran file melebihi batas maksimum ${UKURAN_MAKS_LABEL}.`
    ),
  nama: z.string().max(200, "Nama terlalu panjang (maks 200 karakter).").optional(),
  kategori: z
    .enum(["desain", "penulisan", "pemrograman", "lainnya"])
    .optional(),
});

export type NilaiFormUnggah = z.infer<typeof skemaUnggahDokumen>;

// ============================================================
// Tipe respons POST /dokumen-kontrak (api.md 6.1) — status 202
// ============================================================
export interface ResponsUnggahDokumen {
  id: string;
  nama: string;
  kategori: string;
  status: "menunggu" | "memproses" | "selesai" | "gagal";
  ukuran_bytes: number;
  tipe_file: string;
  diunggah_pada: string;
}

// ============================================================
// Tipe respons POST /audit (api.md 7.1) — status 202
// ============================================================
export interface ResponsMulaiAudit {
  id: string;
  dokumen_kontrak_id: string;
  status: "memproses";
  dimulai_pada: string;
  estimasi_selesai_detik: number;
}

// ============================================================
// Tipe respons DELETE /dokumen-kontrak/:id (api.md 6.4)
// ============================================================
export interface ResponsHapusDokumen {
  berhasil: boolean;
  pesan: string;
  data: null;
}

// ============================================================
// Tipe respons POST /dokumen-kontrak/:id/revisi (api.md 6.5)
// Status 202 — revisi diterima dan audit ulang dijadwalkan
// ============================================================
export interface ResponsUnggahRevisi {
  id: string;
  nama: string;
  status: "menunggu" | "memproses" | "selesai" | "gagal";
  revisi_dari_id: string;
  nomor_revisi: number;
  diunggah_pada: string;
}

// ============================================================
// Tipe satu item dari GET /dokumen-kontrak/:id/revisi (api.md 6.6)
// Urut terlama ke terbaru — nomor_revisi 0 adalah dokumen asal
// ============================================================
export interface ItemRevisi {
  id: string;
  nama: string;
  nomor_revisi: number;
  catatan_revisi?: string;
  status: "menunggu" | "memproses" | "selesai" | "gagal";
  skor_risiko: "hijau" | "kuning" | "merah" | null;
  diunggah_pada: string;
  audit_id: string | null;
}

// ============================================================
// Schema Zod untuk form unggah revisi — api.md 6.5
// Validasi file sama dengan skemaUnggahDokumen (reuse aturan yang sama)
// catatan_revisi opsional, max 500 karakter sesuai api.md 6.5
// ============================================================
export const skemaUnggahRevisi = z.object({
  file: z
    .custom<File>((val) => val instanceof File, "File wajib dipilih.")
    .refine(
      (file) => TIPE_FILE_DIDUKUNG.includes(file.type as (typeof TIPE_FILE_DIDUKUNG)[number]),
      "Format file tidak didukung. Gunakan PDF, JPG, PNG, atau WEBP."
    )
    .refine(
      (file) => file.size <= UKURAN_MAKS_BYTES,
      `Ukuran file melebihi batas maksimum ${UKURAN_MAKS_LABEL}.`
    ),
  catatan_revisi: z
    .string()
    .max(500, "Catatan revisi maksimal 500 karakter.")
    .optional(),
});

export type NilaiFormUnggahRevisi = z.infer<typeof skemaUnggahRevisi>;

// ============================================================
// State machine hook use-revisi-dokumen
// ============================================================
export type StatusMuatRevisi = "idle" | "memuat" | "selesai" | "gagal";

export interface StateRevisi {
  statusMuat: StatusMuatRevisi;
  // Reuse StatusUnggah untuk alur unggah revisi — pola konsisten dengan use-unggah-dokumen.ts
  statusUnggah: StatusUnggah;
  revisi: ItemRevisi[];
  pesanErrorMuat: string | null;
  pesanErrorUnggah: string | null;
  auditIdBaru: string | null; // audit_id dari revisi terbaru — untuk redirect setelah selesai
  kuotaHabis: boolean;
}

// ============================================================
// Status alur unggah — state machine di hook
// idle → memvalidasi → mengunggah → memproses → selesai | gagal
// ============================================================
export type StatusUnggah =
  | "idle"
  | "memvalidasi"
  | "mengunggah"
  | "memproses"
  | "selesai"
  | "gagal";

export interface StateUnggah {
  status: StatusUnggah;
  progressPersen: number;
  pesanError: string | null;
  auditId: string | null;
  dokumenId: string | null;
  // Flag khusus KUOTA_HABIS — supaya StatusUnggah bisa render banner upgrade
  // bukan sekadar teks error biasa (PRD.md F-BILL-01)
  kuotaHabis: boolean;
}