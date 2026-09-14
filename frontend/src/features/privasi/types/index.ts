// ============================================================
// Tipe dan schema Zod untuk fitur privasi — KontrakAman AI
// F-PRIV-01: kebijakan privasi (PRD.md Epic I)
// F-PRIV-02: info retensi data (PRD.md Epic I)
// F-PRIV-03: ekspor data — POST /pengguna/saya/ekspor-data (api.md 5.5)
//                          GET  /pengguna/saya/ekspor-data/status (api.md 5.6)
// F-PRIV-04: hapus akun — DELETE /pengguna/saya (api.md 5.4)
// ============================================================

import { z } from "zod";

// ------------------------------------------------------------
// Schema konfirmasi hapus akun — DELETE /pengguna/saya (api.md 5.4)
// Konfirmasi ganda: teks konfirmasi + kata sandi
// ------------------------------------------------------------
export const TEKS_KONFIRMASI_HAPUS = "HAPUS AKUN SAYA" as const;

export const skemaHapusAkun = z.object({
  // .superRefine dipakai (bukan .refine) agar tipe konfirmasi tetap string
  // .refine mengubah tipe menjadi literal yang tidak kompatibel dengan useForm
  konfirmasi: z.string().superRefine((val, ctx) => {
    if (val !== TEKS_KONFIRMASI_HAPUS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Ketik "${TEKS_KONFIRMASI_HAPUS}" untuk mengkonfirmasi`,
      });
    }
  }),
  kata_sandi: z.string().min(1, "Kata sandi tidak boleh kosong"),
});

export type TipeHapusAkun = z.infer<typeof skemaHapusAkun>;

// ------------------------------------------------------------
// F-PRIV-03: Tipe respons POST /pengguna/saya/ekspor-data (api.md 5.5)
// ------------------------------------------------------------
export interface ResponsAjukanEkspor {
  diminta_pada: string;             // ISO 8601
  estimasi_selesai_menit: number;   // estimasi waktu pemrosesan
}

// ------------------------------------------------------------
// F-PRIV-03: Tipe respons GET /pengguna/saya/ekspor-data/status (api.md 5.6)
// status: "memproses" | "selesai" | "tidak_ada"
// "tidak_ada" = belum pernah mengajukan permintaan ekspor
// ------------------------------------------------------------
export interface ResponsStatusEkspor {
  status: "memproses" | "selesai" | "tidak_ada";
  diminta_pada: string | null;  // ISO 8601, null jika tidak_ada
  selesai_pada: string | null;  // ISO 8601, null jika belum selesai
}

// ------------------------------------------------------------
// F-PRIV-03: State machine hook useEksporData
// idle → mengajukan → memproses → selesai | gagal
// ------------------------------------------------------------
export type StatusEksporData =
  | "idle"          // belum ada permintaan
  | "mengajukan"    // POST /ekspor-data sedang berjalan
  | "memproses"     // backend sedang menyiapkan berkas, polling status
  | "selesai"       // berkas siap, tautan sudah dikirim ke email
  | "gagal";        // request gagal

export interface StateEksporData {
  status: StatusEksporData;
  pesanError: string | null;
  estimasiMenit: number | null;  // dari respons api.md 5.5
  dimintaPada: string | null;    // ISO 8601, dari respons api.md 5.5/5.6
}

// ------------------------------------------------------------
// Tipe respons DELETE /pengguna/saya (api.md 5.4)
// ------------------------------------------------------------
export interface ResponsHapusAkun {
  dihapus_pada: string; // ISO 8601 — tanggal penghapusan permanen (30 hari dari sekarang)
}

// ------------------------------------------------------------
// State machine hook hapus akun
// idle → mengkonfirmasi → memproses → selesai | gagal
// ------------------------------------------------------------
export type StatusHapusAkun =
  | "idle"
  | "mengkonfirmasi"  // form konfirmasi terbuka
  | "memproses"       // request ke API sedang berjalan
  | "selesai"         // akun berhasil dihapus, redirect ke /masuk
  | "gagal";          // request gagal, tampilkan error

export interface StateHapusAkun {
  status: StatusHapusAkun;
  pesanError: string | null;
  tanggalHapusPermanen: string | null; // dari respons API
}