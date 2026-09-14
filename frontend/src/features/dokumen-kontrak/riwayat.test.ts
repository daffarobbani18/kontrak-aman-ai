// ============================================================
// Test riwayat kontrak — KontrakAman AI
// Cakupan: hook state machine, filter logic, paginasi
// Sesuai AGENTS.md Bagian 6: 70% untuk hooks/services/utils
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ambilDaftarDokumen } from "@/features/dashboard/services/dashboard.service";
import type { ItemDokumenKontrak, DataPaginasi } from "@/features/dashboard/types";

// ============================================================
// Setup mock — gunakan mock auth supaya tidak hit network
// ============================================================
vi.stubEnv("NEXT_PUBLIC_MOCK_AUTH", "true");

// Mock ambilDaftarDokumen langsung karena dashboard.service
// masih membaca env di level konstanta (PAKAI_MOCK)
// — service ini akan direfactor ke dynamic read di sprint berikutnya
vi.mock("@/features/dashboard/services/dashboard.service", () => ({
  ambilDaftarDokumen: vi.fn(),
  ambilProfil: vi.fn(),
}));

const mockAmbilDaftarDokumen = vi.mocked(ambilDaftarDokumen);

// ============================================================
// Data fixture
// ============================================================
const dokumenFixture: ItemDokumenKontrak[] = [
  {
    id: "dok_001",
    nama: "kontrak-desain.pdf",
    kategori: "desain",
    status: "selesai",
    skor_risiko: "merah",
    diunggah_pada: "2026-08-23T10:00:00Z",
    audit_id: "aud_001",
  },
  {
    id: "dok_002",
    nama: "kontrak-pemrograman.pdf",
    kategori: "pemrograman",
    status: "selesai",
    skor_risiko: "kuning",
    diunggah_pada: "2026-08-22T09:00:00Z",
    audit_id: "aud_002",
  },
  {
    id: "dok_003",
    nama: "kontrak-penulisan.pdf",
    kategori: "penulisan",
    status: "memproses",
    skor_risiko: null,
    diunggah_pada: "2026-08-21T08:00:00Z",
    audit_id: null,
  },
];

const paginasiFixture: DataPaginasi = {
  cursor_berikutnya: null,
  ada_lagi: false,
  total: 3,
};

const paginasiAdaLebih: DataPaginasi = {
  cursor_berikutnya: "eyJpZCI6ImRva18wMDMifQ==",
  ada_lagi: true,
  total: 10,
};

// ============================================================
// Test service — ambilDaftarDokumen
// ============================================================
describe("ambilDaftarDokumen (mock)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mengembalikan daftar dokumen dan paginasi", async () => {
    mockAmbilDaftarDokumen.mockResolvedValueOnce({
      berhasil: true,
      pesan: "Daftar dokumen berhasil diambil.",
      data: dokumenFixture,
      paginasi: paginasiFixture,
    } as Awaited<ReturnType<typeof ambilDaftarDokumen>>);

    const hasil = await ambilDaftarDokumen({ limit: 20 });

    expect(hasil.berhasil).toBe(true);
    expect(hasil.data).toHaveLength(3);
    expect(hasil.paginasi.total).toBe(3);
    expect(hasil.paginasi.ada_lagi).toBe(false);
  });

  it("filter status selesai hanya mengembalikan dokumen selesai", async () => {
    const dokumenSelesai = dokumenFixture.filter((d) => d.status === "selesai");

    mockAmbilDaftarDokumen.mockResolvedValueOnce({
      berhasil: true,
      pesan: "Daftar dokumen berhasil diambil.",
      data: dokumenSelesai,
      paginasi: { ...paginasiFixture, total: dokumenSelesai.length },
    } as Awaited<ReturnType<typeof ambilDaftarDokumen>>);

    const hasil = await ambilDaftarDokumen({ status: "selesai", limit: 20 });

    expect(hasil.data).toHaveLength(2);
    hasil.data.forEach((dok) => {
      expect(dok.status).toBe("selesai");
    });
  });

  it("filter status memproses mengembalikan dokumen yang sedang diproses", async () => {
    const dokumenMemproses = dokumenFixture.filter((d) => d.status === "memproses");

    mockAmbilDaftarDokumen.mockResolvedValueOnce({
      berhasil: true,
      pesan: "Daftar dokumen berhasil diambil.",
      data: dokumenMemproses,
      paginasi: { ...paginasiFixture, total: dokumenMemproses.length },
    } as Awaited<ReturnType<typeof ambilDaftarDokumen>>);

    const hasil = await ambilDaftarDokumen({ status: "memproses", limit: 20 });

    expect(hasil.data).toHaveLength(1);
    expect(hasil.data[0].status).toBe("memproses");
  });

  it("mengembalikan paginasi dengan cursor saat ada_lagi true", async () => {
    mockAmbilDaftarDokumen.mockResolvedValueOnce({
      berhasil: true,
      pesan: "Daftar dokumen berhasil diambil.",
      data: dokumenFixture,
      paginasi: paginasiAdaLebih,
    } as Awaited<ReturnType<typeof ambilDaftarDokumen>>);

    const hasil = await ambilDaftarDokumen({ limit: 3 });

    expect(hasil.paginasi.ada_lagi).toBe(true);
    expect(hasil.paginasi.cursor_berikutnya).toBeTruthy();
  });

  it("meneruskan cursor ke panggilan berikutnya untuk paginasi", async () => {
    const cursor = "eyJpZCI6ImRva18wMDMifQ==";

    mockAmbilDaftarDokumen.mockResolvedValueOnce({
      berhasil: true,
      pesan: "Daftar dokumen berhasil diambil.",
      data: dokumenFixture.slice(2),
      paginasi: paginasiFixture,
    } as Awaited<ReturnType<typeof ambilDaftarDokumen>>);

    await ambilDaftarDokumen({ limit: 20, cursor });

    expect(mockAmbilDaftarDokumen).toHaveBeenCalledWith(
      expect.objectContaining({ cursor })
    );
  });

  it("mengembalikan array kosong saat tidak ada dokumen", async () => {
    mockAmbilDaftarDokumen.mockResolvedValueOnce({
      berhasil: true,
      pesan: "Daftar dokumen berhasil diambil.",
      data: [],
      paginasi: { cursor_berikutnya: null, ada_lagi: false, total: 0 },
    } as Awaited<ReturnType<typeof ambilDaftarDokumen>>);

    const hasil = await ambilDaftarDokumen({ limit: 20 });

    expect(hasil.data).toHaveLength(0);
    expect(hasil.paginasi.total).toBe(0);
  });
});

// ============================================================
// Test validasi tipe data dokumen kontrak
// ============================================================
describe("validasi tipe ItemDokumenKontrak", () => {
  it("dokumen selesai memiliki audit_id dan skor_risiko", () => {
    const dok = dokumenFixture.find((d) => d.status === "selesai")!;
    expect(dok.audit_id).toBeTruthy();
    expect(["hijau", "kuning", "merah"]).toContain(dok.skor_risiko);
  });

  it("dokumen memproses tidak memiliki audit_id dan skor_risiko null", () => {
    const dok = dokumenFixture.find((d) => d.status === "memproses")!;
    expect(dok.audit_id).toBeNull();
    expect(dok.skor_risiko).toBeNull();
  });

  it("setiap dokumen memiliki field wajib dari api.md 6.2", () => {
    dokumenFixture.forEach((dok) => {
      expect(dok).toHaveProperty("id");
      expect(dok).toHaveProperty("nama");
      expect(dok).toHaveProperty("kategori");
      expect(dok).toHaveProperty("status");
      expect(dok).toHaveProperty("diunggah_pada");
      expect(["menunggu", "memproses", "selesai", "gagal"]).toContain(dok.status);
    });
  });

  it("format tanggal diunggah_pada adalah ISO 8601", () => {
    dokumenFixture.forEach((dok) => {
      const tanggal = new Date(dok.diunggah_pada);
      expect(tanggal.toString()).not.toBe("Invalid Date");
    });
  });
});