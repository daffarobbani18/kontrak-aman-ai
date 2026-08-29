// ============================================================
// Tipe data negosiasi — KontrakAman AI
// Selaras dengan api.md Bagian 8 (POST /negosiasi, GET /negosiasi/:id)
// ============================================================

// ============================================================
// Tipe inti dari api.md 8.2
// ============================================================
export type StatusNegosiasi = "memproses" | "selesai" | "gagal";

export interface VersiDraf {
  label: string; // "Negosiasi Lunak", "Negosiasi Standar", "Negosiasi Tegas"
  teks: string;
}

export interface DraftNegosiasi {
  versi: VersiDraf[];
}

// Respons GET /negosiasi/:id saat selesai — api.md 8.2
export interface HasilNegosiasiSelesai {
  id: string;
  klausul_id: string;
  status: "selesai";
  teks_asli_klausul: string;
  draft_negosiasi: DraftNegosiasi;
  selesai_pada: string;
}

// Respons GET /negosiasi/:id saat masih memproses — api.md 8.2
export interface HasilNegosiasiMemproses {
  id: string;
  klausul_id: string;
  status: "memproses";
}

// Respons GET /negosiasi/:id saat gagal
export interface HasilNegosiasiGagal {
  id: string;
  klausul_id: string;
  status: "gagal";
}

export type HasilNegosiasi =
  | HasilNegosiasiSelesai
  | HasilNegosiasiMemproses
  | HasilNegosiasiGagal;

// Respons POST /negosiasi — api.md 8.1 (202 Accepted)
export interface ResponsPermintaanNegosiasi {
  id: string;
  klausul_id: string;
  status: "memproses";
  dimulai_pada: string;
}

// ============================================================
// State machine hook — use-buat-negosiasi
// idle → meminta → memproses → selesai | gagal
// ============================================================
export type StatusMuatNegosiasi =
  | "idle"
  | "meminta"
  | "memproses"
  | "selesai"
  | "gagal";

// Kode error spesifik yang perlu ditangani berbeda di UI
export type KodeErrorNegosiasi =
  | "KUOTA_HABIS"
  | "LANGGANAN_DIPERLUKAN"
  | "KONFLIK"
  | "UMUM";

export interface StateBuatNegosiasi {
  status: StatusMuatNegosiasi;
  data: HasilNegosiasiSelesai | null;
  negosiasiId: string | null; // ID dari POST /negosiasi untuk polling
  pesanError: string | null;
  kodeError: KodeErrorNegosiasi | null;
}

// ============================================================
// Tipe untuk edit manual per versi draf (F-NEGO-02)
// Disimpan di state lokal komponen, bukan di server
// ============================================================
export type EditanVersi = Record<number, string>; // index versi → teks yang diedit