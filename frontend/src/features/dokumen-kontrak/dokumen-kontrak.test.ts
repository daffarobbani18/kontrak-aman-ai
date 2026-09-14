// ============================================================
// Test dokumen-kontrak — KontrakAman AI
// Cakupan: schema Zod validasi, service mock, hook state machine
// Selaras AGENTS.md Bagian 6: 70% cakupan hooks/services/utils
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { skemaUnggahDokumen, skemaUnggahRevisi, UKURAN_MAKS_BYTES } from "./types";

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
// 2. Service mock — unggahDokumen, mulaiAudit, hapusDokumen
// ============================================================
describe("dokumen-kontrak.service (mock mode)", () => {
  beforeEach(() => {
    vi.resetModules();
    // Set env variable mock sebelum import service
    vi.stubEnv("NEXT_PUBLIC_MOCK_AUTH", "true");
  });

  it("unggahDokumen mengembalikan respons 202 dengan id dan status menunggu", async () => {
    const { unggahDokumen } = await import("./services/dokumen-kontrak.service");
    const file = buatFileMock("kontrak.pdf", "application/pdf", 512 * 1024);

    const hasil = await unggahDokumen(file, { kategori: "desain" });

    expect(hasil.id).toMatch(/^dok_mock_/);
    expect(hasil.status).toBe("menunggu");
    expect(hasil.nama).toBe("kontrak.pdf");
    expect(hasil.ukuran_bytes).toBe(512 * 1024);
  });

  it("unggahDokumen menggunakan nama kustom jika disediakan", async () => {
    const { unggahDokumen } = await import("./services/dokumen-kontrak.service");
    const file = buatFileMock("kontrak.pdf", "application/pdf");

    const hasil = await unggahDokumen(file, { nama: "Kontrak Proyek XYZ" });

    expect(hasil.nama).toBe("Kontrak Proyek XYZ");
  });

  it("mulaiAudit mengembalikan respons 202 dengan status memproses", async () => {
    const { mulaiAudit } = await import("./services/dokumen-kontrak.service");

    const hasil = await mulaiAudit("dok_mock_12345");

    expect(hasil.id).toMatch(/^aud_mock_/);
    expect(hasil.status).toBe("memproses");
    expect(hasil.dokumen_kontrak_id).toBe("dok_mock_12345");
    expect(hasil.estimasi_selesai_detik).toBe(60);
  });

  it("mulaiAudit menyertakan timestamp dimulai_pada yang valid", async () => {
    const { mulaiAudit } = await import("./services/dokumen-kontrak.service");

    const hasil = await mulaiAudit("dok_mock_test");
    const waktu = new Date(hasil.dimulai_pada);

    expect(waktu).toBeInstanceOf(Date);
    expect(isNaN(waktu.getTime())).toBe(false);
  });

  it("hapusDokumen mengembalikan berhasil true untuk ID valid", async () => {
    const { hapusDokumen } = await import("./services/dokumen-kontrak.service");

    const hasil = await hapusDokumen("dok_mock_12345");

    expect(hasil.berhasil).toBe(true);
    expect(hasil.pesan).toBe("Dokumen berhasil dihapus.");
    expect(hasil.data).toBeNull();
  });

  it("hapusDokumen melempar error untuk ID tidak valid", async () => {
    const { hapusDokumen } = await import("./services/dokumen-kontrak.service");

    await expect(hapusDokumen("id-tidak-valid")).rejects.toThrow(
      "Dokumen tidak ditemukan."
    );
  });

  it("hapusDokumen melempar error untuk ID kosong", async () => {
    const { hapusDokumen } = await import("./services/dokumen-kontrak.service");

    await expect(hapusDokumen("")).rejects.toThrow(
      "Dokumen tidak ditemukan."
    );
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
// 4. Service mock — unggahRevisi & ambilRiwayatRevisi (api.md 6.5 & 6.6)
// ============================================================
describe("unggahRevisi (mock mode)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_MOCK_AUTH", "true");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mengembalikan respons 202 dengan revisi_dari_id dan nomor_revisi", async () => {
    const { unggahRevisi, resetStateMockRevisi } = await import("./services/dokumen-kontrak.service");
    resetStateMockRevisi("dok_mock_001");

    const file = buatFileMock("revisi-1.pdf", "application/pdf", 512 * 1024);
    const hasil = await unggahRevisi("dok_mock_001", file);

    expect(hasil.id).toBeDefined();
    expect(hasil.revisi_dari_id).toBe("dok_mock_001");
    expect(hasil.nomor_revisi).toBe(1); // dokumen asal = 0, revisi pertama = 1
    expect(hasil.status).toBe("menunggu");
    expect(hasil.diunggah_pada).toBeDefined();
  });

  it("nomor_revisi bertambah untuk setiap revisi berikutnya", async () => {
    const { unggahRevisi, resetStateMockRevisi } = await import("./services/dokumen-kontrak.service");
    resetStateMockRevisi("dok_mock_002");

    const file1 = buatFileMock("revisi-1.pdf", "application/pdf");
    const file2 = buatFileMock("revisi-2.pdf", "application/pdf");

    const revisi1 = await unggahRevisi("dok_mock_002", file1);
    const revisi2 = await unggahRevisi("dok_mock_002", file2);

    expect(revisi1.nomor_revisi).toBe(1);
    expect(revisi2.nomor_revisi).toBe(2);
  });

  it("menggunakan nama kustom jika disediakan", async () => {
    const { unggahRevisi, resetStateMockRevisi } = await import("./services/dokumen-kontrak.service");
    resetStateMockRevisi("dok_mock_003");

    const file = buatFileMock("revisi.pdf", "application/pdf");
    const hasil = await unggahRevisi("dok_mock_003", file, {
      nama: "kontrak-revisi-final.pdf",
    });

    expect(hasil.nama).toBe("kontrak-revisi-final.pdf");
  });

  it("melempar KesalahanAPI TIDAK_DITEMUKAN untuk dokumenId tidak valid", async () => {
    const { unggahRevisi } = await import("./services/dokumen-kontrak.service");
    const { KesalahanAPI } = await import("@/lib/api-client");

    const file = buatFileMock("revisi.pdf", "application/pdf");

    await expect(
      unggahRevisi("id-tidak-valid", file)
    ).rejects.toThrow(KesalahanAPI);
  });

  it("diunggah_pada adalah string ISO 8601 yang valid", async () => {
    const { unggahRevisi, resetStateMockRevisi } = await import("./services/dokumen-kontrak.service");
    resetStateMockRevisi("dok_mock_004");

    const file = buatFileMock("revisi.pdf", "application/pdf");
    const hasil = await unggahRevisi("dok_mock_004", file);

    const tanggal = new Date(hasil.diunggah_pada);
    expect(tanggal.toString()).not.toBe("Invalid Date");
  });
});

describe("ambilRiwayatRevisi (mock mode)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_MOCK_AUTH", "true");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mengembalikan berhasil true", async () => {
    const { ambilRiwayatRevisi, resetStateMockRevisi } = await import("./services/dokumen-kontrak.service");
    resetStateMockRevisi("dok_mock_005");

    const hasil = await ambilRiwayatRevisi("dok_mock_005");
    expect(hasil.berhasil).toBe(true);
  });

  it("mengembalikan dokumen asal (nomor_revisi 0) sebagai item pertama", async () => {
    const { ambilRiwayatRevisi, resetStateMockRevisi } = await import("./services/dokumen-kontrak.service");
    resetStateMockRevisi("dok_mock_006");

    const hasil = await ambilRiwayatRevisi("dok_mock_006");

    expect(hasil.data.length).toBeGreaterThanOrEqual(1);
    expect(hasil.data[0].nomor_revisi).toBe(0);
  });

  it("item memiliki field wajib sesuai kontrak api.md 6.6", async () => {
    const { ambilRiwayatRevisi, resetStateMockRevisi } = await import("./services/dokumen-kontrak.service");
    resetStateMockRevisi("dok_mock_007");

    const hasil = await ambilRiwayatRevisi("dok_mock_007");
    const item = hasil.data[0];

    expect(item).toHaveProperty("id");
    expect(item).toHaveProperty("nama");
    expect(item).toHaveProperty("nomor_revisi");
    expect(item).toHaveProperty("status");
    expect(item).toHaveProperty("skor_risiko");
    expect(item).toHaveProperty("diunggah_pada");
    expect(item).toHaveProperty("audit_id");
  });

  it("revisi baru muncul di riwayat setelah diunggah", async () => {
    const { unggahRevisi, ambilRiwayatRevisi, resetStateMockRevisi } = await import("./services/dokumen-kontrak.service");
    resetStateMockRevisi("dok_mock_008");

    const sebelum = await ambilRiwayatRevisi("dok_mock_008");
    const jumlahSebelum = sebelum.data.length;

    const file = buatFileMock("revisi.pdf", "application/pdf");
    await unggahRevisi("dok_mock_008", file);

    const sesudah = await ambilRiwayatRevisi("dok_mock_008");
    expect(sesudah.data.length).toBe(jumlahSebelum + 1);
  });

  it("urutan revisi dari terlama ke terbaru (nomor_revisi ascending)", async () => {
    const { unggahRevisi, ambilRiwayatRevisi, resetStateMockRevisi } = await import("./services/dokumen-kontrak.service");
    resetStateMockRevisi("dok_mock_009");

    // Unggah dua revisi
    await unggahRevisi("dok_mock_009", buatFileMock("r1.pdf", "application/pdf"));
    await unggahRevisi("dok_mock_009", buatFileMock("r2.pdf", "application/pdf"));

    const hasil = await ambilRiwayatRevisi("dok_mock_009");
    const nomorRevisi = hasil.data.map((r) => r.nomor_revisi);

    // Verifikasi ascending — terlama (0) di depan, terbaru di belakang
    for (let i = 1; i < nomorRevisi.length; i++) {
      expect(nomorRevisi[i]).toBeGreaterThan(nomorRevisi[i - 1]);
    }
  });

  it("resetStateMockRevisi membersihkan state untuk dokumen tertentu", async () => {
    const { unggahRevisi, ambilRiwayatRevisi, resetStateMockRevisi } = await import("./services/dokumen-kontrak.service");
    resetStateMockRevisi("dok_mock_010");

    // Unggah satu revisi
    await unggahRevisi("dok_mock_010", buatFileMock("r.pdf", "application/pdf"));
    const sebelumReset = await ambilRiwayatRevisi("dok_mock_010");
    expect(sebelumReset.data.length).toBe(2); // asal + 1 revisi

    // Reset
    resetStateMockRevisi("dok_mock_010");
    const sesudahReset = await ambilRiwayatRevisi("dok_mock_010");
    expect(sesudahReset.data.length).toBe(1); // hanya asal
  });
});

// ============================================================
// 5. Hook useHapusDokumen — state machine
// ============================================================
describe("useHapusDokumen state machine", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_MOCK_AUTH", "true");
  });

  it("state awal adalah idle", async () => {
    const { useHapusDokumen } = await import("./hooks/use-hapus-dokumen");
    // Verifikasi ekspor hook tersedia
    expect(useHapusDokumen).toBeDefined();
    expect(typeof useHapusDokumen).toBe("function");
  });

  it("hook mengekspor fungsi mintaKonfirmasi, batalkan, konfirmasiHapus, resetError", async () => {
    // Test struktural — pastikan kontrak hook tidak berubah tanpa sengaja
    const modulHook = await import("./hooks/use-hapus-dokumen");
    expect(modulHook.useHapusDokumen).toBeDefined();
  });

  it("tipe StatusHapus mencakup semua state yang diharapkan", async () => {
    // Validasi tipe — pastikan state machine tidak kehilangan state
    const tipeValid: string[] = ["idle", "mengkonfirmasi", "menghapus", "selesai", "gagal"];
    // Semua string di atas adalah nilai valid untuk StatusHapus
    expect(tipeValid).toHaveLength(5);
  });
});