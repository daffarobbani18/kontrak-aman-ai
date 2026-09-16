// ============================================================
// Test notifikasi — KontrakAman AI
// Cakupan: reducer, generator notifikasi, service (via mock apiClient)
// Reducer dan helper diimport dari notifikasi.utils.ts — DRY
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ItemNotifikasi, StateNotifikasi } from "./types";
import type { ItemDokumenKontrak } from "@/features/dashboard/types";
import {
  reducer,
  stateAwalNotifikasi,
  buatNotifikasiDariDokumen,
  buatNotifikasiPengingat,
} from "./notifikasi.utils";
import {
  ambilNotifikasi,
  tandaiDibaca,
  tandaiSemuaDibaca,
} from "./services/notifikasi.service";
import { apiClient } from "@/lib/api-client";

// Mock apiClient di boundary — service tidak melakukan fetch sungguhan
vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  apiClient: (await import("@/test/api-client-mock")).buatApiClientMock(),
}));

const mGet = vi.mocked(apiClient.get);
const mPatch = vi.mocked(apiClient.patch);

// ============================================================
// Fixture data
// ============================================================
const DOKUMEN_SELESAI_MERAH: ItemDokumenKontrak = {
  id: "dok_001",
  nama: "kontrak-desain-logo.pdf",
  kategori: "desain",
  status: "selesai",
  skor_risiko: "merah",
  diunggah_pada: "2026-08-22T10:30:00Z",
  audit_id: "aud_001",
};

const DOKUMEN_SELESAI_HIJAU: ItemDokumenKontrak = {
  id: "dok_002",
  nama: "kontrak-maintenance.pdf",
  kategori: "pemrograman",
  status: "selesai",
  skor_risiko: "hijau",
  diunggah_pada: "2026-08-21T09:00:00Z",
  audit_id: "aud_002",
};

const DOKUMEN_MEMPROSES: ItemDokumenKontrak = {
  id: "dok_003",
  nama: "kontrak-baru.pdf",
  kategori: "penulisan",
  status: "memproses",
  skor_risiko: null,
  diunggah_pada: "2026-08-23T11:00:00Z",
  audit_id: null,
};

const ITEM_NOTIFIKASI_CONTOH: ItemNotifikasi = {
  id: "notif_audit_aud_001",
  jenis: "audit_selesai",
  judul: "Audit kontrak selesai",
  pesan: "kontrak-desain-logo.pdf — Skor risiko: Risiko Tinggi.",
  sudahDibaca: false,
  dibuatPada: "2026-08-22T10:30:00Z",
  hrefTujuan: "/audit/aud_001",
  meta: { auditId: "aud_001", dokumenId: "dok_001", namaDokumen: "kontrak-desain-logo.pdf", skorRisiko: "merah" },
};

const STATE_AWAL: StateNotifikasi = stateAwalNotifikasi;

// ============================================================
// Test generator notifikasi
// ============================================================
describe("buatNotifikasiDariDokumen", () => {
  it("mengembalikan notifikasi untuk dokumen selesai", () => {
    const hasil = buatNotifikasiDariDokumen(DOKUMEN_SELESAI_MERAH);
    expect(hasil).not.toBeNull();
    expect(hasil?.jenis).toBe("audit_selesai");
    expect(hasil?.hrefTujuan).toBe("/audit/aud_001");
  });

  it("mengembalikan null untuk dokumen yang masih memproses", () => {
    const hasil = buatNotifikasiDariDokumen(DOKUMEN_MEMPROSES);
    expect(hasil).toBeNull();
  });

  it("mengembalikan null untuk dokumen tanpa audit_id", () => {
    const dokumen = { ...DOKUMEN_SELESAI_MERAH, audit_id: null };
    const hasil = buatNotifikasiDariDokumen(dokumen);
    expect(hasil).toBeNull();
  });

  it("menyertakan label skor risiko di pesan", () => {
    const hasil = buatNotifikasiDariDokumen(DOKUMEN_SELESAI_MERAH);
    expect(hasil?.pesan).toContain("Risiko Tinggi");
  });

  it("menyertakan label skor risiko hijau dengan benar", () => {
    const hasil = buatNotifikasiDariDokumen(DOKUMEN_SELESAI_HIJAU);
    expect(hasil?.pesan).toContain("Risiko Rendah");
  });

  it("menggunakan audit_id sebagai bagian dari id notifikasi", () => {
    const hasil = buatNotifikasiDariDokumen(DOKUMEN_SELESAI_MERAH);
    expect(hasil?.id).toBe("notif_audit_aud_001");
  });
});

describe("buatNotifikasiPengingat", () => {
  it("mengembalikan pengingat untuk dokumen risiko merah", () => {
    const hasil = buatNotifikasiPengingat(DOKUMEN_SELESAI_MERAH);
    expect(hasil).not.toBeNull();
    expect(hasil?.jenis).toBe("pengingat_tindak_lanjut");
  });

  it("mengembalikan null untuk dokumen risiko hijau", () => {
    const hasil = buatNotifikasiPengingat(DOKUMEN_SELESAI_HIJAU);
    expect(hasil).toBeNull();
  });

  it("mengembalikan null untuk dokumen yang masih memproses", () => {
    const hasil = buatNotifikasiPengingat(DOKUMEN_MEMPROSES);
    expect(hasil).toBeNull();
  });

  it("menggunakan dokumen_id sebagai bagian dari id notifikasi", () => {
    const hasil = buatNotifikasiPengingat(DOKUMEN_SELESAI_MERAH);
    expect(hasil?.id).toBe("notif_pengingat_dok_001");
  });
});

// ============================================================
// Test reducer
// ============================================================
describe("reducer notifikasi — TAMBAH", () => {
  it("menambahkan item baru ke state kosong", () => {
    const state = reducer(STATE_AWAL, { tipe: "TAMBAH", item: ITEM_NOTIFIKASI_CONTOH });
    expect(state.items).toHaveLength(1);
    expect(state.jumlahBelumDibaca).toBe(1);
  });

  it("menempatkan item baru di urutan pertama", () => {
    const itemLama: ItemNotifikasi = { ...ITEM_NOTIFIKASI_CONTOH, id: "notif_lama" };
    const stateAwal = { ...STATE_AWAL, items: [itemLama], jumlahBelumDibaca: 1 };
    const state = reducer(stateAwal, { tipe: "TAMBAH", item: ITEM_NOTIFIKASI_CONTOH });
    expect(state.items[0].id).toBe(ITEM_NOTIFIKASI_CONTOH.id);
  });

  it("tidak menambahkan item duplikat (id sama)", () => {
    const stateAwal = { ...STATE_AWAL, items: [ITEM_NOTIFIKASI_CONTOH], jumlahBelumDibaca: 1 };
    const state = reducer(stateAwal, { tipe: "TAMBAH", item: ITEM_NOTIFIKASI_CONTOH });
    expect(state.items).toHaveLength(1);
  });

  it("menghitung jumlahBelumDibaca dengan benar saat tambah item sudah dibaca", () => {
    const itemDibaca: ItemNotifikasi = { ...ITEM_NOTIFIKASI_CONTOH, sudahDibaca: true };
    const state = reducer(STATE_AWAL, { tipe: "TAMBAH", item: itemDibaca });
    expect(state.jumlahBelumDibaca).toBe(0);
  });
});

describe("reducer notifikasi — TANDAI_DIBACA", () => {
  it("menandai satu item sebagai dibaca", () => {
    const stateAwal = { ...STATE_AWAL, items: [ITEM_NOTIFIKASI_CONTOH], jumlahBelumDibaca: 1 };
    const state = reducer(stateAwal, { tipe: "TANDAI_DIBACA", id: ITEM_NOTIFIKASI_CONTOH.id });
    expect(state.items[0].sudahDibaca).toBe(true);
    expect(state.jumlahBelumDibaca).toBe(0);
  });

  it("tidak mengubah item lain saat tandai satu dibaca", () => {
    const item2: ItemNotifikasi = { ...ITEM_NOTIFIKASI_CONTOH, id: "notif_002" };
    const stateAwal = {
      ...STATE_AWAL,
      items: [ITEM_NOTIFIKASI_CONTOH, item2],
      jumlahBelumDibaca: 2,
    };
    const state = reducer(stateAwal, { tipe: "TANDAI_DIBACA", id: ITEM_NOTIFIKASI_CONTOH.id });
    expect(state.items[1].sudahDibaca).toBe(false);
    expect(state.jumlahBelumDibaca).toBe(1);
  });
});

describe("reducer notifikasi — TANDAI_SEMUA_DIBACA", () => {
  it("menandai semua item sebagai dibaca", () => {
    const item2: ItemNotifikasi = { ...ITEM_NOTIFIKASI_CONTOH, id: "notif_002" };
    const stateAwal = {
      ...STATE_AWAL,
      items: [ITEM_NOTIFIKASI_CONTOH, item2],
      jumlahBelumDibaca: 2,
    };
    const state = reducer(stateAwal, { tipe: "TANDAI_SEMUA_DIBACA" });
    expect(state.items.every((item) => item.sudahDibaca)).toBe(true);
    expect(state.jumlahBelumDibaca).toBe(0);
  });
});

describe("reducer notifikasi — HAPUS", () => {
  it("menghapus item berdasarkan id", () => {
    const stateAwal = { ...STATE_AWAL, items: [ITEM_NOTIFIKASI_CONTOH], jumlahBelumDibaca: 1 };
    const state = reducer(stateAwal, { tipe: "HAPUS", id: ITEM_NOTIFIKASI_CONTOH.id });
    expect(state.items).toHaveLength(0);
    expect(state.jumlahBelumDibaca).toBe(0);
  });

  it("tidak mengubah item lain saat hapus satu item", () => {
    const item2: ItemNotifikasi = { ...ITEM_NOTIFIKASI_CONTOH, id: "notif_002" };
    const stateAwal = {
      ...STATE_AWAL,
      items: [ITEM_NOTIFIKASI_CONTOH, item2],
      jumlahBelumDibaca: 2,
    };
    const state = reducer(stateAwal, { tipe: "HAPUS", id: ITEM_NOTIFIKASI_CONTOH.id });
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe("notif_002");
  });

  it("tidak error saat hapus id yang tidak ada", () => {
    const stateAwal = { ...STATE_AWAL, items: [ITEM_NOTIFIKASI_CONTOH], jumlahBelumDibaca: 1 };
    const state = reducer(stateAwal, { tipe: "HAPUS", id: "id_tidak_ada" });
    expect(state.items).toHaveLength(1);
  });
});

describe("reducer notifikasi — SET_MEMUAT", () => {
  it("mengubah sedangMemuat menjadi true", () => {
    const state = reducer(STATE_AWAL, { tipe: "SET_MEMUAT", nilai: true });
    expect(state.sedangMemuat).toBe(true);
  });

  it("mengubah sedangMemuat menjadi false", () => {
    const stateMemuat = { ...STATE_AWAL, sedangMemuat: true };
    const state = reducer(stateMemuat, { tipe: "SET_MEMUAT", nilai: false });
    expect(state.sedangMemuat).toBe(false);
  });
});

// ============================================================
// Test notifikasi.service.ts — via mock apiClient
// Memverifikasi path, query params, dan konversi snake_case → camelCase
// ============================================================
describe("ambilNotifikasi", () => {
  beforeEach(() => {
    mGet.mockReset();
    mPatch.mockReset();
  });

  it("memanggil GET /notifikasi tanpa query saat tidak ada opsi", async () => {
    mGet.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: { data: [], paginasi: { cursor_berikutnya: null, ada_lagi: false, total: 0 } },
    });

    await ambilNotifikasi();

    expect(mGet).toHaveBeenCalledWith("/notifikasi");
  });

  it("menyusun query params sudah_dibaca, limit, cursor", async () => {
    mGet.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: { data: [], paginasi: { cursor_berikutnya: null, ada_lagi: false, total: 0 } },
    });

    await ambilNotifikasi({ sudah_dibaca: false, limit: 5, cursor: "abc" });

    const path = mGet.mock.calls[0][0] as string;
    expect(path).toContain("/notifikasi?");
    expect(path).toContain("sudah_dibaca=false");
    expect(path).toContain("limit=5");
    expect(path).toContain("cursor=abc");
  });

  it("mengkonversi item snake_case dari API ke camelCase", async () => {
    mGet.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: {
        data: [
          {
            id: "notif_001",
            jenis: "audit_selesai",
            judul: "Audit selesai",
            pesan: "Skor: Risiko Tinggi",
            sudah_dibaca: false,
            dibuat_pada: "2026-08-22T10:30:00Z",
            href_tujuan: "/audit/aud_001",
            meta: { audit_id: "aud_001", skor_risiko: "merah" },
          },
        ],
        paginasi: { cursor_berikutnya: null, ada_lagi: false, total: 1 },
      },
    });

    const hasil = await ambilNotifikasi();

    expect(hasil.data).toHaveLength(1);
    const item = hasil.data[0];
    expect(item.sudahDibaca).toBe(false);
    expect(item.dibuatPada).toBe("2026-08-22T10:30:00Z");
    expect(item.hrefTujuan).toBe("/audit/aud_001");
    expect(item.meta.auditId).toBe("aud_001");
    expect(item.meta.skorRisiko).toBe("merah");
  });
});

describe("tandaiDibaca", () => {
  beforeEach(() => {
    mPatch.mockReset();
    mGet.mockReset();
  });

  it("memanggil PATCH /notifikasi/:id/baca", async () => {
    mPatch.mockResolvedValueOnce({ berhasil: true, pesan: "OK", data: null });

    await tandaiDibaca("notif_001");

    expect(mPatch).toHaveBeenCalledWith("/notifikasi/notif_001/baca");
  });
});

describe("tandaiSemuaDibaca", () => {
  beforeEach(() => {
    mPatch.mockReset();
    mGet.mockReset();
  });

  it("memanggil PATCH /notifikasi/baca-semua", async () => {
    mPatch.mockResolvedValueOnce({ berhasil: true, pesan: "OK", data: null });

    await tandaiSemuaDibaca();

    expect(mPatch).toHaveBeenCalledWith("/notifikasi/baca-semua");
  });
});
