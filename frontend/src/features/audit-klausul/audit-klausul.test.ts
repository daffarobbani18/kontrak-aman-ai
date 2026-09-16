// ============================================================
// Test audit klausul — KontrakAman AI
// Cakupan: service via mock apiClient (api.md 7.2, 6.3),
//          validasi kontrak tipe TypeScript
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ambilHasilAudit } from "./services/audit-klausul.service";
import { ambilDetailDokumen } from "./services/dokumen-pratinjau.service";
import type {
  HasilAuditSelesai,
  HasilAuditMemproses,
  DataKlausul,
  StatistikAudit,
  DetailDokumenKontrak,
} from "./types";
import { apiClient } from "@/lib/api-client";

// Mock apiClient di boundary — service tidak melakukan fetch sungguhan
vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  apiClient: (await import("@/test/api-client-mock")).buatApiClientMock(),
}));

const mGet = vi.mocked(apiClient.get);

// ============================================================
// GET /audit/:id — ambilHasilAudit (api.md 7.2)
// ============================================================
describe("ambilHasilAudit", () => {
  beforeEach(() => {
    mGet.mockReset();
  });

  it("memanggil GET /audit/:id dengan auth", async () => {
    mGet.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: {
        id: "aud_001",
        dokumen_kontrak_id: "dok_001",
        status: "memproses",
        progres_persen: 45,
      },
    });

    await ambilHasilAudit("aud_001");

    expect(mGet).toHaveBeenCalledWith("/audit/aud_001", true);
  });

  it("mengembalikan status memproses dengan progres dari API", async () => {
    mGet.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: {
        id: "aud_001",
        dokumen_kontrak_id: "dok_001",
        status: "memproses",
        progres_persen: 55,
      } satisfies HasilAuditMemproses,
    });

    const hasil = await ambilHasilAudit("aud_001");

    expect(hasil.status).toBe("memproses");
    expect(hasil.id).toBe("aud_001");
    if (hasil.status === "memproses") {
      expect(hasil.progres_persen).toBe(55);
    }
  });

  it("mengembalikan status selesai dengan data lengkap dari API", async () => {
    mGet.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: {
        id: "aud_002",
        dokumen_kontrak_id: "dok_002",
        status: "selesai",
        skor_risiko: "kuning",
        ringkasan: "Kontrak ini memiliki 2 klausul berisiko.",
        dimulai_pada: "2026-08-23T09:00:00Z",
        selesai_pada: "2026-08-23T09:01:00Z",
        klausul: [
          {
            id: "kls_001",
            nomor_urut: 1,
            judul: "Klausul 1 — Denda",
            teks_asli: "Denda 5% per hari.",
            tingkat_risiko: "merah",
            penjelasan: "Denda tidak wajar.",
            rekomendasi: "Negosiasikan batas denda.",
            ada_draft_negosiasi: true,
          },
        ],
        statistik: {
          total_klausul: 1,
          klausul_merah: 1,
          klausul_kuning: 0,
          klausul_hijau: 0,
        },
      } satisfies HasilAuditSelesai,
    });

    const hasil = await ambilHasilAudit("aud_002");

    expect(hasil.status).toBe("selesai");
    const hasilSelesai = hasil as HasilAuditSelesai;

    // Field wajib dari api.md 7.2
    expect(hasilSelesai).toHaveProperty("id");
    expect(hasilSelesai).toHaveProperty("dokumen_kontrak_id");
    expect(hasilSelesai).toHaveProperty("skor_risiko");
    expect(hasilSelesai).toHaveProperty("ringkasan");
    expect(hasilSelesai).toHaveProperty("dimulai_pada");
    expect(hasilSelesai).toHaveProperty("selesai_pada");
    expect(hasilSelesai).toHaveProperty("klausul");
    expect(hasilSelesai).toHaveProperty("statistik");

    // Skor risiko hanya berisi nilai yang valid
    expect(["hijau", "kuning", "merah"]).toContain(hasilSelesai.skor_risiko);

    // Statistik konsisten dengan array klausul
    const stat: StatistikAudit = hasilSelesai.statistik;
    expect(stat.total_klausul).toBe(hasilSelesai.klausul.length);
    expect(
      stat.klausul_merah + stat.klausul_kuning + stat.klausul_hijau
    ).toBe(stat.total_klausul);
  });

  it("setiap klausul memiliki field wajib dari api.md 7.2", async () => {
    mGet.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: {
        id: "aud_003",
        dokumen_kontrak_id: "dok_003",
        status: "selesai",
        skor_risiko: "hijau",
        ringkasan: "Tidak ada risiko tinggi.",
        dimulai_pada: "2026-08-23T09:00:00Z",
        selesai_pada: "2026-08-23T09:01:00Z",
        klausul: [
          {
            id: "kls_002",
            nomor_urut: 1,
            judul: "Klausul Pembayaran",
            teks_asli: "Pembayaran 30 hari.",
            tingkat_risiko: "hijau",
            penjelasan: "Wajar.",
            rekomendasi: "Tidak perlu perubahan.",
            ada_draft_negosiasi: false,
          },
        ],
        statistik: {
          total_klausul: 1,
          klausul_merah: 0,
          klausul_kuning: 0,
          klausul_hijau: 1,
        },
      } satisfies HasilAuditSelesai,
    });

    const hasil = await ambilHasilAudit("aud_003");
    const hasilSelesai = hasil as HasilAuditSelesai;

    expect(hasilSelesai.klausul.length).toBeGreaterThan(0);
    hasilSelesai.klausul.forEach((klausul: DataKlausul) => {
      expect(klausul).toHaveProperty("id");
      expect(klausul).toHaveProperty("nomor_urut");
      expect(klausul).toHaveProperty("judul");
      expect(klausul).toHaveProperty("teks_asli");
      expect(klausul).toHaveProperty("tingkat_risiko");
      expect(klausul).toHaveProperty("penjelasan");
      expect(klausul).toHaveProperty("rekomendasi");
      expect(klausul).toHaveProperty("ada_draft_negosiasi");
      expect(["hijau", "kuning", "merah"]).toContain(klausul.tingkat_risiko);
    });
  });
});

// ============================================================
// GET /dokumen-kontrak/:id — ambilDetailDokumen (api.md 6.3)
// ============================================================
describe("ambilDetailDokumen", () => {
  beforeEach(() => {
    mGet.mockReset();
  });

  // Fixture detail dokumen sesuai api.md 6.3
  const DOKUMEN_FIKTIF: DetailDokumenKontrak = {
    id: "dok_rani_001",
    nama: "kontrak-desain-logo.pdf",
    kategori: "desain",
    status: "selesai",
    skor_risiko: "kuning",
    ukuran_bytes: 204800,
    tipe_file: "application/pdf",
    url_pratinjau: "https://contoh.id/pratinjau/dok_rani_001.pdf",
    diunggah_pada: "2026-08-22T10:30:00Z",
    dihapus_pada: null,
    audit_id: "aud_rani_001",
    revisi_dari_id: null,
    nomor_revisi: 0,
  };

  it("memanggil GET /dokumen-kontrak/:id dengan auth", async () => {
    mGet.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: DOKUMEN_FIKTIF,
    });

    await ambilDetailDokumen("dok_rani_001");

    expect(mGet).toHaveBeenCalledWith("/dokumen-kontrak/dok_rani_001", true);
  });

  it("mengembalikan detail dokumen dengan url_pratinjau", async () => {
    mGet.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: DOKUMEN_FIKTIF,
    });

    const hasil = await ambilDetailDokumen("dok_rani_001");

    expect(hasil.id).toBe("dok_rani_001");
    expect(hasil.url_pratinjau).not.toBeNull();
    expect(typeof hasil.url_pratinjau).toBe("string");
  });

  it("mengembalikan semua field wajib dari api.md 6.3", async () => {
    mGet.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: DOKUMEN_FIKTIF,
    });

    const hasil = await ambilDetailDokumen("dok_rani_001");

    expect(hasil).toHaveProperty("id");
    expect(hasil).toHaveProperty("nama");
    expect(hasil).toHaveProperty("kategori");
    expect(hasil).toHaveProperty("status");
    expect(hasil).toHaveProperty("skor_risiko");
    expect(hasil).toHaveProperty("ukuran_bytes");
    expect(hasil).toHaveProperty("tipe_file");
    expect(hasil).toHaveProperty("url_pratinjau");
    expect(hasil).toHaveProperty("diunggah_pada");
    expect(hasil).toHaveProperty("dihapus_pada");
    expect(hasil).toHaveProperty("audit_id");
  });

  it("status dokumen hanya berisi nilai yang valid", async () => {
    mGet.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: DOKUMEN_FIKTIF,
    });

    const hasil = await ambilDetailDokumen("dok_rani_001");

    expect(["menunggu", "memproses", "selesai", "gagal"]).toContain(
      hasil.status
    );
  });
});

// ============================================================
// Test tipe — validasi kontrak tipe TypeScript
// ============================================================
describe("validasi tipe audit klausul", () => {
  it("HasilAuditSelesai memiliki struktur tipe yang benar", () => {
    const contoh: HasilAuditSelesai = {
      id: "aud_001",
      dokumen_kontrak_id: "dok_001",
      status: "selesai",
      skor_risiko: "kuning",
      ringkasan: "Kontrak ini memiliki 2 klausul berisiko.",
      dimulai_pada: "2026-08-23T09:00:00Z",
      selesai_pada: "2026-08-23T09:01:00Z",
      klausul: [
        {
          id: "kls_001",
          nomor_urut: 1,
          judul: "Klausul 1 — Denda",
          teks_asli: "Denda 5% per hari.",
          tingkat_risiko: "merah",
          penjelasan: "Denda tidak wajar.",
          rekomendasi: "Negosiasikan batas denda.",
          ada_draft_negosiasi: true,
        },
      ],
      statistik: {
        total_klausul: 1,
        klausul_merah: 1,
        klausul_kuning: 0,
        klausul_hijau: 0,
      },
    };

    expect(contoh.status).toBe("selesai");
    expect(contoh.klausul).toHaveLength(1);
    expect(contoh.statistik.total_klausul).toBe(1);
  });

  it("HasilAuditMemproses memiliki struktur tipe yang benar", () => {
    const contoh: HasilAuditMemproses = {
      id: "aud_001",
      dokumen_kontrak_id: "dok_001",
      status: "memproses",
      progres_persen: 45,
    };

    expect(contoh.status).toBe("memproses");
    expect(contoh.progres_persen).toBe(45);
  });
});
