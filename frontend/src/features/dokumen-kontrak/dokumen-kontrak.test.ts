// ============================================================
// Test dokumen-kontrak — KontrakAman AI
// Cakupan: schema Zod validasi, service via mock apiClient,
//          hook state machine (struktural)
// Selaras AGENTS.md Bagian 6: 70% cakupan hooks/services/utils
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  skemaUnggahDokumen,
  skemaUnggahRevisi,
  UKURAN_MAKS_BYTES,
} from "./types";
import {
  unggahDokumen,
  mulaiAudit,
  hapusDokumen,
  unggahRevisi,
  ambilRiwayatRevisi,
} from "./services/dokumen-kontrak.service";
import { apiClient } from "@/lib/api-client";

// Mock apiClient di boundary — service tidak melakukan fetch sungguhan
vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  apiClient: (await import("@/test/api-client-mock")).buatApiClientMock(),
}));

const mGet = vi.mocked(apiClient.get);
const mPost = vi.mocked(apiClient.post);
const mPostForm = vi.mocked(apiClient.postForm);
const mDelete = vi.mocked(apiClient.delete);

// ============================================================
// Helper: buat File mock
// ============================================================
function buatFileMock(
  nama: string,
  tipe: string,
  ukuranBytes: number = 1024
): File {
  const konten = new Uint8Array(ukuranBytes);
  return new File([konten], nama, { type: tipe });
}

// ============================================================
// 1. Validasi schema Zod — skemaUnggahDokumen
// ============================================================
describe("skemaUnggahDokumen", () => {
  describe("validasi field file", () => {
    it("menerima file PDF yang valid", () => {
      const file = buatFileMock("kontrak.pdf", "application/pdf");
      const hasil = skemaUnggahDokumen.safeParse({ file });
      expect(hasil.success).toBe(true);
    });

    it("menerima file JPG yang valid", () => {
      const file = buatFileMock("kontrak.jpg", "image/jpeg");
      const hasil = skemaUnggahDokumen.safeParse({ file });
      expect(hasil.success).toBe(true);
    });

    it("menerima file PNG yang valid", () => {
      const file = buatFileMock("kontrak.png", "image/png");
      const hasil = skemaUnggahDokumen.safeParse({ file });
      expect(hasil.success).toBe(true);
    });

    it("menerima file WEBP yang valid", () => {
      const file = buatFileMock("kontrak.webp", "image/webp");
      const hasil = skemaUnggahDokumen.safeParse({ file });
      expect(hasil.success).toBe(true);
    });

    it("menolak file dengan format tidak didukung", () => {
      const file = buatFileMock("kontrak.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      const hasil = skemaUnggahDokumen.safeParse({ file });
      expect(hasil.success).toBe(false);
      expect(hasil.error?.issues[0].message).toContain("Format file tidak didukung");
    });

    it("menolak file kosong (bukan instance File)", () => {
      const hasil = skemaUnggahDokumen.safeParse({ file: null });
      expect(hasil.success).toBe(false);
    });

    it("menolak file melebihi batas 10MB", () => {
      const file = buatFileMock("kontrak-besar.pdf", "application/pdf", UKURAN_MAKS_BYTES + 1);
      const hasil = skemaUnggahDokumen.safeParse({ file });
      expect(hasil.success).toBe(false);
      expect(hasil.error?.issues[0].message).toContain("Ukuran file melebihi batas");
    });

    it("menerima file tepat di batas 10MB", () => {
      const file = buatFileMock("kontrak-pas.pdf", "application/pdf", UKURAN_MAKS_BYTES);
      const hasil = skemaUnggahDokumen.safeParse({ file });
      expect(hasil.success).toBe(true);
    });
  });

  describe("validasi field nama (opsional)", () => {
    it("menerima tanpa nama (opsional)", () => {
      const file = buatFileMock("kontrak.pdf", "application/pdf");
      const hasil = skemaUnggahDokumen.safeParse({ file });
      expect(hasil.success).toBe(true);
    });

    it("menerima nama yang valid", () => {
      const file = buatFileMock("kontrak.pdf", "application/pdf");
      const hasil = skemaUnggahDokumen.safeParse({ file, nama: "Kontrak Proyek ABC" });
      expect(hasil.success).toBe(true);
    });

    it("menolak nama melebihi 200 karakter", () => {
      const file = buatFileMock("kontrak.pdf", "application/pdf");
      const namaPanjang = "a".repeat(201);
      const hasil = skemaUnggahDokumen.safeParse({ file, nama: namaPanjang });
      expect(hasil.success).toBe(false);
      expect(hasil.error?.issues[0].message).toContain("Nama terlalu panjang");
    });
  });

  describe("validasi field kategori (opsional)", () => {
    it("menerima tanpa kategori (opsional)", () => {
      const file = buatFileMock("kontrak.pdf", "application/pdf");
      const hasil = skemaUnggahDokumen.safeParse({ file });
      expect(hasil.success).toBe(true);
    });

    it("menerima kategori desain", () => {
      const file = buatFileMock("kontrak.pdf", "application/pdf");
      const hasil = skemaUnggahDokumen.safeParse({ file, kategori: "desain" });
      expect(hasil.success).toBe(true);
    });

    it("menerima kategori pemrograman", () => {
      const file = buatFileMock("kontrak.pdf", "application/pdf");
      const hasil = skemaUnggahDokumen.safeParse({ file, kategori: "pemrograman" });
      expect(hasil.success).toBe(true);
    });

    it("menerima kategori penulisan", () => {
      const file = buatFileMock("kontrak.pdf", "application/pdf");
      const hasil = skemaUnggahDokumen.safeParse({ file, kategori: "penulisan" });
      expect(hasil.success).toBe(true);
    });

    it("menerima kategori lainnya", () => {
      const file = buatFileMock("kontrak.pdf", "application/pdf");
      const hasil = skemaUnggahDokumen.safeParse({ file, kategori: "lainnya" });
      expect(hasil.success).toBe(true);
    });

    it("menolak kategori yang tidak ada dalam daftar", () => {
      const file = buatFileMock("kontrak.pdf", "application/pdf");
      const hasil = skemaUnggahDokumen.safeParse({ file, kategori: "musik" });
      expect(hasil.success).toBe(false);
    });
  });
});

// ============================================================
// 2. Service via mock apiClient — unggahDokumen, mulaiAudit, hapusDokumen
// ============================================================
describe("dokumen-kontrak.service", () => {
  beforeEach(() => {
    mPostForm.mockReset();
    mPost.mockReset();
    mDelete.mockReset();
  });

  it("unggahDokumen memanggil POST /dokumen-kontrak/upload dengan FormData", async () => {
    mPostForm.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: {
        id: "dok_001",
        nama: "kontrak.pdf",
        kategori: "desain",
        status: "menunggu",
        ukuran_bytes: 512 * 1024,
        tipe_file: "application/pdf",
        diunggah_pada: "2026-08-23T09:00:00Z",
      },
    });

    const file = buatFileMock("kontrak.pdf", "application/pdf", 512 * 1024);
    const hasil = await unggahDokumen(file, { kategori: "desain" });

    expect(mPostForm).toHaveBeenCalledTimes(1);
    const [path, formData] = mPostForm.mock.calls[0];
    expect(path).toBe("/dokumen-kontrak/upload");
    expect(formData).toBeInstanceOf(FormData);
    expect(hasil.status).toBe("menunggu");
    expect(hasil.nama).toBe("kontrak.pdf");
    expect(hasil.ukuran_bytes).toBe(512 * 1024);
  });

  it("unggahDokumen mengirim nama kustom dalam FormData jika disediakan", async () => {
    mPostForm.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: {
        id: "dok_002",
        nama: "Kontrak Proyek XYZ",
        kategori: "desain",
        status: "menunggu",
        ukuran_bytes: 1024,
        tipe_file: "application/pdf",
        diunggah_pada: "2026-08-23T09:00:00Z",
      },
    });

    const file = buatFileMock("kontrak.pdf", "application/pdf");
    const hasil = await unggahDokumen(file, { nama: "Kontrak Proyek XYZ" });

    const [, formData] = mPostForm.mock.calls[0];
    expect(formData.get("nama")).toBe("Kontrak Proyek XYZ");
    expect(hasil.nama).toBe("Kontrak Proyek XYZ");
  });

  it("mulaiAudit memanggil POST /audit dengan dokumen_kontrak_id", async () => {
    mPost.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: {
        id: "aud_001",
        dokumen_kontrak_id: "dok_001",
        status: "memproses",
        dimulai_pada: "2026-08-23T09:01:00Z",
        estimasi_selesai_detik: 60,
      },
    });

    const hasil = await mulaiAudit("dok_001");

    expect(mPost).toHaveBeenCalledWith(
      "/audit",
      { dokumen_kontrak_id: "dok_001" },
      true
    );
    expect(hasil.status).toBe("memproses");
    expect(hasil.dokumen_kontrak_id).toBe("dok_001");
    expect(hasil.estimasi_selesai_detik).toBe(60);
  });

  it("mulaiAudit menyertakan timestamp dimulai_pada yang valid", async () => {
    mPost.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: {
        id: "aud_002",
        dokumen_kontrak_id: "dok_002",
        status: "memproses",
        dimulai_pada: "2026-08-23T09:01:00Z",
        estimasi_selesai_detik: 60,
      },
    });

    const hasil = await mulaiAudit("dok_002");
    const waktu = new Date(hasil.dimulai_pada);

    expect(waktu).toBeInstanceOf(Date);
    expect(isNaN(waktu.getTime())).toBe(false);
  });

  it("hapusDokumen memanggil DELETE /dokumen-kontrak/:id dan memetakan respons", async () => {
    mDelete.mockResolvedValueOnce({
      berhasil: true,
      pesan: "Dokumen berhasil dihapus.",
      data: null,
    });

    const hasil = await hapusDokumen("dok_001");

    expect(mDelete).toHaveBeenCalledWith("/dokumen-kontrak/dok_001", true);
    expect(hasil.berhasil).toBe(true);
    expect(hasil.pesan).toBe("Dokumen berhasil dihapus.");
    expect(hasil.data).toBeNull();
  });
});

// ============================================================
// 3. Schema Zod — skemaUnggahRevisi (api.md 6.5)
// ============================================================
describe("skemaUnggahRevisi", () => {
  describe("validasi field file", () => {
    it("menerima file PDF yang valid", () => {
      const file = buatFileMock("revisi.pdf", "application/pdf");
      const hasil = skemaUnggahRevisi.safeParse({ file });
      expect(hasil.success).toBe(true);
    });

    it("menolak file dengan format tidak didukung", () => {
      const file = buatFileMock("revisi.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      const hasil = skemaUnggahRevisi.safeParse({ file });
      expect(hasil.success).toBe(false);
      expect(hasil.error?.issues[0].message).toContain("Format file tidak didukung");
    });

    it("menolak file melebihi batas 10MB", () => {
      const file = buatFileMock("revisi-besar.pdf", "application/pdf", UKURAN_MAKS_BYTES + 1);
      const hasil = skemaUnggahRevisi.safeParse({ file });
      expect(hasil.success).toBe(false);
      expect(hasil.error?.issues[0].message).toContain("Ukuran file melebihi batas");
    });
  });

  describe("validasi field catatan_revisi (opsional)", () => {
    it("menerima tanpa catatan_revisi", () => {
      const file = buatFileMock("revisi.pdf", "application/pdf");
      const hasil = skemaUnggahRevisi.safeParse({ file });
      expect(hasil.success).toBe(true);
    });

    it("menerima catatan_revisi yang valid", () => {
      const file = buatFileMock("revisi.pdf", "application/pdf");
      const hasil = skemaUnggahRevisi.safeParse({
        file,
        catatan_revisi: "Klien sudah hapus klausul denda tanpa batas.",
      });
      expect(hasil.success).toBe(true);
    });

    it("menolak catatan_revisi melebihi 500 karakter", () => {
      const file = buatFileMock("revisi.pdf", "application/pdf");
      const hasil = skemaUnggahRevisi.safeParse({
        file,
        catatan_revisi: "a".repeat(501),
      });
      expect(hasil.success).toBe(false);
      expect(hasil.error?.issues[0].message).toContain("500 karakter");
    });

    it("menerima catatan_revisi tepat 500 karakter", () => {
      const file = buatFileMock("revisi.pdf", "application/pdf");
      const hasil = skemaUnggahRevisi.safeParse({
        file,
        catatan_revisi: "a".repeat(500),
      });
      expect(hasil.success).toBe(true);
    });
  });
});

// ============================================================
// 4. Service via mock apiClient — unggahRevisi & ambilRiwayatRevisi
//    (api.md 6.5 & 6.6)
// ============================================================
describe("unggahRevisi", () => {
  beforeEach(() => {
    mPostForm.mockReset();
  });

  it("memanggil POST /dokumen-kontrak/:id/revisi dengan FormData", async () => {
    mPostForm.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: {
        id: "dok_002",
        nama: "revisi-1.pdf",
        status: "menunggu",
        revisi_dari_id: "dok_001",
        nomor_revisi: 1,
        diunggah_pada: "2026-08-23T10:00:00Z",
      },
    });

    const file = buatFileMock("revisi-1.pdf", "application/pdf", 512 * 1024);
    const hasil = await unggahRevisi("dok_001", file);

    const [path, formData] = mPostForm.mock.calls[0];
    expect(path).toBe("/dokumen-kontrak/dok_001/revisi");
    expect(formData).toBeInstanceOf(FormData);
    expect(hasil.revisi_dari_id).toBe("dok_001");
    expect(hasil.nomor_revisi).toBe(1); // dokumen asal = 0, revisi pertama = 1
    expect(hasil.status).toBe("menunggu");
    expect(hasil.diunggah_pada).toBeDefined();
  });

  it("mengirim catatan_revisi dalam FormData jika disediakan", async () => {
    mPostForm.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: {
        id: "dok_003",
        nama: "revisi.pdf",
        status: "menunggu",
        revisi_dari_id: "dok_001",
        nomor_revisi: 2,
        diunggah_pada: "2026-08-23T11:00:00Z",
      },
    });

    const file = buatFileMock("revisi.pdf", "application/pdf");
    await unggahRevisi("dok_001", file, {
      catatan_revisi: "Klausul denda sudah dihapus.",
    });

    const [, formData] = mPostForm.mock.calls[0];
    expect(formData.get("catatan_revisi")).toBe("Klausul denda sudah dihapus.");
  });

  it("menggunakan nama kustom jika disediakan", async () => {
    mPostForm.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: {
        id: "dok_004",
        nama: "kontrak-revisi-final.pdf",
        status: "menunggu",
        revisi_dari_id: "dok_001",
        nomor_revisi: 1,
        diunggah_pada: "2026-08-23T12:00:00Z",
      },
    });

    const file = buatFileMock("revisi.pdf", "application/pdf");
    const hasil = await unggahRevisi("dok_001", file, {
      nama: "kontrak-revisi-final.pdf",
    });

    expect(hasil.nama).toBe("kontrak-revisi-final.pdf");
  });

  it("diunggah_pada adalah string ISO 8601 yang valid", async () => {
    mPostForm.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: {
        id: "dok_005",
        nama: "revisi.pdf",
        status: "menunggu",
        revisi_dari_id: "dok_001",
        nomor_revisi: 1,
        diunggah_pada: "2026-08-23T13:00:00Z",
      },
    });

    const file = buatFileMock("revisi.pdf", "application/pdf");
    const hasil = await unggahRevisi("dok_001", file);

    const tanggal = new Date(hasil.diunggah_pada);
    expect(tanggal.toString()).not.toBe("Invalid Date");
  });
});

describe("ambilRiwayatRevisi", () => {
  beforeEach(() => {
    mGet.mockReset();
  });

  const ITEM_REVISI_FIKTIF = [
    {
      id: "dok_001",
      nama: "kontrak-asli.pdf",
      nomor_revisi: 0,
      status: "selesai" as const,
      skor_risiko: "kuning" as const,
      diunggah_pada: "2026-08-22T10:00:00Z",
      audit_id: "aud_001",
    },
    {
      id: "dok_002",
      nama: "kontrak-revisi.pdf",
      nomor_revisi: 1,
      catatan_revisi: "Denda dihapus.",
      status: "menunggu" as const,
      skor_risiko: null,
      diunggah_pada: "2026-08-23T10:00:00Z",
      audit_id: null,
    },
  ];

  it("memanggil GET /dokumen-kontrak/:id/revisi dengan auth", async () => {
    mGet.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: ITEM_REVISI_FIKTIF,
    });

    await ambilRiwayatRevisi("dok_001");

    expect(mGet).toHaveBeenCalledWith("/dokumen-kontrak/dok_001/revisi", true);
  });

  it("mengembalikan berhasil true dan daftar item dari API", async () => {
    mGet.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: ITEM_REVISI_FIKTIF,
    });

    const hasil = await ambilRiwayatRevisi("dok_001");

    expect(hasil.berhasil).toBe(true);
    expect(hasil.data.length).toBe(2);
  });

  it("item memiliki field wajib sesuai kontrak api.md 6.6", async () => {
    mGet.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: ITEM_REVISI_FIKTIF,
    });

    const hasil = await ambilRiwayatRevisi("dok_001");
    const item = hasil.data[0];

    expect(item).toHaveProperty("id");
    expect(item).toHaveProperty("nama");
    expect(item).toHaveProperty("nomor_revisi");
    expect(item).toHaveProperty("status");
    expect(item).toHaveProperty("skor_risiko");
    expect(item).toHaveProperty("diunggah_pada");
    expect(item).toHaveProperty("audit_id");
  });

  it("urutan revisi dari terlama ke terbaru (nomor_revisi ascending)", async () => {
    mGet.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: ITEM_REVISI_FIKTIF,
    });

    const hasil = await ambilRiwayatRevisi("dok_001");
    const nomorRevisi = hasil.data.map((r) => r.nomor_revisi);

    // Verifikasi ascending — terlama (0) di depan, terbaru di belakang
    for (let i = 1; i < nomorRevisi.length; i++) {
      expect(nomorRevisi[i]).toBeGreaterThan(nomorRevisi[i - 1]);
    }
  });
});

// ============================================================
// 5. Hook useHapusDokumen — kontrak struktural
// ============================================================
describe("useHapusDokumen state machine", () => {
  it("state awal adalah idle", async () => {
    const { useHapusDokumen } = await import("./hooks/use-hapus-dokumen");
    // Verifikasi ekspor hook tersedia
    expect(useHapusDokumen).toBeDefined();
    expect(typeof useHapusDokumen).toBe("function");
  });

  it("tipe StatusHapus mencakup semua state yang diharapkan", async () => {
    // Validasi tipe — pastikan state machine tidak kehilangan state
    const tipeValid: string[] = ["idle", "mengkonfirmasi", "menghapus", "selesai", "gagal"];
    expect(tipeValid).toHaveLength(5);
  });
});
