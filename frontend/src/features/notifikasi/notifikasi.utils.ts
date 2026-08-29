// ============================================================
// notifikasi.utils.ts — logika bisnis murni notifikasi
// Diekstrak dari use-notifikasi.ts agar bisa ditest tanpa React
// dan dipakai bersama oleh hook dan service tanpa duplikasi.
//
// AGENTS.md Bagian 5: DRY — sebelumnya reducer dan helper
// diduplikasi di notifikasi.test.ts, sekarang cukup import dari sini.
// ============================================================

import type {
  StateNotifikasi,
  AksiNotifikasi,
  ItemNotifikasi,
  SkorRisikoNotifikasi,
} from "./types";
import type { ItemDokumenKontrak } from "@/features/dashboard/types";

// ============================================================
// Reducer notifikasi
// Dipakai oleh useNotifikasi via useReducer
// ============================================================
export function hitungBelumDibaca(items: ItemNotifikasi[]): number {
  return items.filter((item) => !item.sudahDibaca).length;
}

export function reducer(
  state: StateNotifikasi,
  aksi: AksiNotifikasi
): StateNotifikasi {
  switch (aksi.tipe) {
    case "TAMBAH": {
      // Hindari duplikat berdasarkan id
      const sudahAda = state.items.some((item) => item.id === aksi.item.id);
      if (sudahAda) return state;
      const items = [aksi.item, ...state.items];
      return { ...state, items, jumlahBelumDibaca: hitungBelumDibaca(items) };
    }
    case "TANDAI_DIBACA": {
      const items = state.items.map((item) =>
        item.id === aksi.id ? { ...item, sudahDibaca: true } : item
      );
      return { ...state, items, jumlahBelumDibaca: hitungBelumDibaca(items) };
    }
    case "TANDAI_SEMUA_DIBACA": {
      const items = state.items.map((item) => ({ ...item, sudahDibaca: true }));
      return { ...state, items, jumlahBelumDibaca: 0 };
    }
    case "HAPUS": {
      const items = state.items.filter((item) => item.id !== aksi.id);
      return { ...state, items, jumlahBelumDibaca: hitungBelumDibaca(items) };
    }
    case "SET_MEMUAT":
      return { ...state, sedangMemuat: aksi.nilai };
    default:
      return state;
  }
}

export const stateAwalNotifikasi: StateNotifikasi = {
  items: [],
  jumlahBelumDibaca: 0,
  sedangMemuat: false,
};

// ============================================================
// Helper: buat ItemNotifikasi dari ItemDokumenKontrak
// Dipakai di mode mock untuk generate notifikasi dari data
// dokumen yang sudah ada tanpa memanggil GET /notifikasi
// ============================================================
export function buatNotifikasiDariDokumen(
  dokumen: ItemDokumenKontrak
): ItemNotifikasi | null {
  if (dokumen.status !== "selesai" || !dokumen.audit_id) return null;

  const skor = dokumen.skor_risiko as SkorRisikoNotifikasi;

  const labelSkor: Record<string, string> = {
    hijau: "Risiko Rendah",
    kuning: "Risiko Sedang",
    merah: "Risiko Tinggi",
  };

  const pesanSkor = skor ? `Skor risiko: ${labelSkor[skor] ?? skor}.` : "";

  return {
    id: `notif_audit_${dokumen.audit_id}`,
    jenis: "audit_selesai",
    judul: "Audit kontrak selesai",
    pesan: `${dokumen.nama} — ${pesanSkor}`,
    sudahDibaca: false,
    dibuatPada: dokumen.diunggah_pada,
    hrefTujuan: `/audit/${dokumen.audit_id}`,
    meta: {
      auditId: dokumen.audit_id,
      dokumenId: dokumen.id,
      namaDokumen: dokumen.nama,
      skorRisiko: skor,
    },
  };
}

// ============================================================
// Helper: buat notifikasi pengingat untuk dokumen risiko Merah
// F-NOTIF-02 — Could Have
// PRD.md: pengingat terkirim jika kontrak Merah belum menghasilkan
// draf negosiasi dalam jangka waktu tertentu
// ============================================================
export function buatNotifikasiPengingat(
  dokumen: ItemDokumenKontrak
): ItemNotifikasi | null {
  if (
    dokumen.status !== "selesai" ||
    dokumen.skor_risiko !== "merah" ||
    !dokumen.audit_id
  )
    return null;

  return {
    id: `notif_pengingat_${dokumen.id}`,
    jenis: "pengingat_tindak_lanjut",
    judul: "Kontrak risiko tinggi belum ditindaklanjuti",
    pesan: `${dokumen.nama} masih menunggu negosiasi. Segera tindaklanjuti sebelum menandatangani.`,
    sudahDibaca: false,
    dibuatPada: dokumen.diunggah_pada,
    hrefTujuan: `/audit/${dokumen.audit_id}`,
    meta: {
      auditId: dokumen.audit_id,
      dokumenId: dokumen.id,
      namaDokumen: dokumen.nama,
      skorRisiko: "merah",
    },
  };
}