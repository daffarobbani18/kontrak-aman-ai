// ============================================================
// Tipe data notifikasi — KontrakAman AI
// F-NOTIF-01 PRD.md: notifikasi audit selesai (Must Have)
// F-NOTIF-02 PRD.md: pengingat tindak lanjut (Could Have)
//
// Saat ini: state lokal berbasis data mock dari DashboardContext
// Siap disambungkan ke api.md 11.1 (GET /notifikasi)
//
// Konvensi field:
// - ItemNotifikasi pakai camelCase (konvensi TypeScript frontend)
// - ItemNotifikasiAPI adalah shape raw dari backend (snake_case api.md 11.1)
//   → dikonversi ke ItemNotifikasi saat diterima dari API
// ============================================================

// Jenis notifikasi sesuai F-NOTIF-01 dan F-NOTIF-02 PRD.md
export type JenisNotifikasi =
  | "audit_selesai"             // F-NOTIF-01 — audit kontrak selesai diproses
  | "audit_gagal"               // F-NOTIF-01 — audit gagal (jalur error)
  | "pengingat_tindak_lanjut";  // F-NOTIF-02 — kontrak risiko Merah belum ditindaklanjuti

// Skor risiko untuk notifikasi audit selesai
export type SkorRisikoNotifikasi = "hijau" | "kuning" | "merah" | null;

// Shape internal frontend — camelCase
export interface ItemNotifikasi {
  id: string;
  jenis: JenisNotifikasi;
  judul: string;
  pesan: string;
  sudahDibaca: boolean;
  dibuatPada: string;        // ISO 8601
  hrefTujuan: string | null; // href_tujuan dari api.md 11.1
  meta: {
    auditId?: string;        // meta.audit_id dari api.md 11.1
    dokumenId?: string;      // meta.dokumen_id dari api.md 11.1
    namaDokumen?: string;    // meta.nama_dokumen dari api.md 11.1
    skorRisiko?: SkorRisikoNotifikasi; // meta.skor_risiko dari api.md 11.1
  };
}

// Shape raw dari backend — snake_case sesuai api.md 11.1
// Dipakai saat service notifikasi disambungkan ke GET /notifikasi
export interface ItemNotifikasiAPI {
  id: string;
  jenis: JenisNotifikasi;
  judul: string;
  pesan: string;
  sudah_dibaca: boolean;
  dibuat_pada: string;
  href_tujuan: string | null;
  meta: {
    audit_id?: string;
    dokumen_id?: string;
    nama_dokumen?: string;
    skor_risiko?: SkorRisikoNotifikasi;
  };
}

// Helper konversi API → internal (pakai saat disambungkan ke backend)
export function apiKeInternal(item: ItemNotifikasiAPI): ItemNotifikasi {
  return {
    id: item.id,
    jenis: item.jenis,
    judul: item.judul,
    pesan: item.pesan,
    sudahDibaca: item.sudah_dibaca,
    dibuatPada: item.dibuat_pada,
    hrefTujuan: item.href_tujuan,
    meta: {
      auditId: item.meta.audit_id,
      dokumenId: item.meta.dokumen_id,
      namaDokumen: item.meta.nama_dokumen,
      skorRisiko: item.meta.skor_risiko,
    },
  };
}

// State hook notifikasi
export interface StateNotifikasi {
  items: ItemNotifikasi[];
  jumlahBelumDibaca: number;
  sedangMemuat: boolean;
}

// Aksi yang bisa dilakukan pada notifikasi
export type AksiNotifikasi =
  | { tipe: "TAMBAH"; item: ItemNotifikasi }
  | { tipe: "TANDAI_DIBACA"; id: string }
  | { tipe: "TANDAI_SEMUA_DIBACA" }
  | { tipe: "HAPUS"; id: string }
  | { tipe: "SET_MEMUAT"; nilai: boolean };

// Tipe preferensi notifikasi — api.md 5.7 dan 5.8
// Dipakai saat F-PROF-03 disambungkan ke backend
export interface PreferensiNotifikasi {
  audit_selesai: boolean;
  pengingat_tindak_lanjut: boolean;
  info_langganan: boolean;
  diperbarui_pada: string;
}

// Key localStorage — fallback sebelum backend tersedia
export const STORAGE_KEY_PREFERENSI_NOTIFIKASI = "preferensi_notifikasi" as const;