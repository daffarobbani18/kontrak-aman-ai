// ============================================================
// Test notifikasi — KontrakAman AI
// Cakupan: reducer, generator notifikasi, deduplication, service mock
// Sesuai AGENTS.md Bagian 6: 70% untuk hooks/services/utils
//
// Reducer dan helper diimport dari notifikasi.utils.ts —
// tidak ada duplikasi (AGENTS.md Bagian 5: DRY)
// ============================================================

import { describe, it, expect, beforeEach, vi } from "vitest";
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
  resetStateMockNotifikasi,
} from "./services/notifikasi.service";

// Paksa mode mock agar service tidak memanggil backend sungguhan
// Pola yang sama dengan privasi.test.ts
vi.stubEnv("NEXT_PUBLIC_MOCK_AUTH", "true");

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
// Test notifikasi.service.ts — mode mock
// Memverifikasi service mengembalikan data yang benar
// tanpa memanggil backend sungguhan
// ============================================================
describe("ambilNotifikasi — mode mock", () => {
  beforeEach(() => {
    resetStateMockNotifikasi();
    // Pastikan session storage menunjuk ke user yang punya dokumen
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("mock_email", "rani@example.com");
    }
  });

  it("mengembalikan array notifikasi", async () => {
    const respons = await ambilNotifikasi();
    expect(Array.isArray(respons.data)).toBe(true);
  });

  it("mengembalikan objek paginasi yang valid", async () => {
    const respons = await ambilNotifikasi();
    expect(respons.paginasi).toHaveProperty("cursor_berikutnya");
    expect(respons.paginasi).toHaveProperty("ada_lagi");
    expect(respons.paginasi).toHaveProperty("total");
  });

  it("setiap notifikasi memiliki field wajib sesuai api.md 11.1", async () => {
    const respons = await ambilNotifikasi();
    // Rani punya 2 dokumen selesai — pastikan ada notifikasi
    expect(respons.data.length).toBeGreaterThan(0);
    for (const item of respons.data) {
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("jenis");
      expect(item).toHaveProperty("judul");
      expect(item).toHaveProperty("pesan");
      expect(item).toHaveProperty("sudahDibaca");
      expect(item).toHaveProperty("dibuatPada");
      expect(item).toHaveProperty("hrefTujuan");
      expect(item).toHaveProperty("meta");
    }
  });

  it("jenis notifikasi hanya berisi nilai yang valid", async () => {
    const jenisValid = ["audit_selesai", "audit_gagal", "pengingat_tindak_lanjut"];
    const respons = await ambilNotifikasi();
    for (const item of respons.data) {
      expect(jenisValid).toContain(item.jenis);
    }
  });

  it("notifikasi audit_selesai memiliki hrefTujuan ke /audit/:id", async () => {
    const respons = await ambilNotifikasi();
    const auditSelesai = respons.data.filter((n) => n.jenis === "audit_selesai");
    for (const item of auditSelesai) {
      expect(item.hrefTujuan).toMatch(/^\/audit\//);
    }
  });

  it("sudahDibaca berupa boolean", async () => {
    const respons = await ambilNotifikasi();
    for (const item of respons.data) {
      expect(typeof item.sudahDibaca).toBe("boolean");
    }
  });

  it("filter sudah_dibaca=false mengembalikan hanya yang belum dibaca", async () => {
    const respons = await ambilNotifikasi({ sudah_dibaca: false });
    for (const item of respons.data) {
      expect(item.sudahDibaca).toBe(false);
    }
  });

  it("limit membatasi jumlah notifikasi yang dikembalikan", async () => {
    const respons = await ambilNotifikasi({ limit: 1 });
    expect(respons.data.length).toBeLessThanOrEqual(1);
  });
});

describe("tandaiDibaca — mode mock", () => {
  beforeEach(() => {
    resetStateMockNotifikasi();
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("mock_email", "rani@example.com");
    }
  });

  it("tidak melempar error saat dipanggil dengan id valid", async () => {
    await expect(tandaiDibaca("notif_audit_aud_rani_001")).resolves.toBeUndefined();
  });

  it("notifikasi yang ditandai muncul sebagai dibaca di fetch berikutnya", async () => {
    // Ambil dulu — cari id notifikasi yang ada
    const sebelum = await ambilNotifikasi();
    const itemPertama = sebelum.data[0];
    if (!itemPertama) return; // skip jika tidak ada notifikasi

    await tandaiDibaca(itemPertama.id);

    const sesudah = await ambilNotifikasi();
    const itemSesudah = sesudah.data.find((n) => n.id === itemPertama.id);
    expect(itemSesudah?.sudahDibaca).toBe(true);
  });
});

describe("tandaiSemuaDibaca — mode mock", () => {
  beforeEach(() => {
    resetStateMockNotifikasi();
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("mock_email", "rani@example.com");
    }
  });

  it("tidak melempar error saat dipanggil", async () => {
    await expect(tandaiSemuaDibaca()).resolves.toBeUndefined();
  });

  it("semua notifikasi menjadi dibaca setelah dipanggil", async () => {
    await tandaiSemuaDibaca();
    const respons = await ambilNotifikasi();
    for (const item of respons.data) {
      expect(item.sudahDibaca).toBe(true);
    }
  });

  it("filter sudah_dibaca=false tidak mengembalikan item setelah tandai semua", async () => {
    await tandaiSemuaDibaca();
    const respons = await ambilNotifikasi({ sudah_dibaca: false });
    expect(respons.data.length).toBe(0);
  });
});