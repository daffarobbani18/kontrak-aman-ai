// ============================================================
// Test audit klausul — KontrakAman AI
// Cakupan: tipe validasi, service mock, state machine hook
// Sesuai AGENTS.md Bagian 6: 70% untuk hooks/services/utils
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ambilHasilAudit } from "./services/audit-klausul.service";
import type {
  HasilAuditSelesai,
  HasilAuditMemproses,
  DataKlausul,
  StatistikAudit,
} from "./types";

// ============================================================
// Setup mock environment (mode mock aktif)
// ============================================================
vi.stubEnv("NEXT_PUBLIC_MOCK_AUTH", "true");

describe("audit-klausul service (mode mock)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ----------------------------------------------------------
  // Panggilan pertama: harus memproses (progres 0)
  // ----------------------------------------------------------
  it("panggilan pertama mengembalikan status memproses dengan progres 0", async () => {
    const auditId = `aud_test_${Date.now()}`;
    const promise = ambilHasilAudit(auditId);
    await vi.runAllTimersAsync();
    const hasil = await promise;

    expect(hasil.status).toBe("memproses");
    expect(hasil.id).toBe(auditId);
    if (hasil.status === "memproses") {
      expect(hasil.progres_persen).toBe(0);
    }
  });

  // ----------------------------------------------------------
  // Panggilan kedua: harus memproses (progres 55)
  // ----------------------------------------------------------
  it("panggilan kedua mengembalikan status memproses dengan progres 55", async () => {
    const auditId = `aud_test_${Date.now()}_b`;

    // Panggilan 1
    const p1 = ambilHasilAudit(auditId);
    await vi.runAllTimersAsync();
    await p1;

    // Panggilan 2
    const p2 = ambilHasilAudit(auditId);
    await vi.runAllTimersAsync();
    const hasil = await p2;

    expect(hasil.status).toBe("memproses");
    if (hasil.status === "memproses") {
      expect(hasil.progres_persen).toBe(55);
    }
  });

  // ----------------------------------------------------------
  // Panggilan ketiga: harus selesai dengan data lengkap
  // ----------------------------------------------------------
  it("panggilan ketiga mengembalikan status selesai dengan data audit", async () => {
    const auditId = `aud_test_${Date.now()}_c`;

    for (let i = 0; i < 2; i++) {
      const p = ambilHasilAudit(auditId);
      await vi.runAllTimersAsync();
      await p;
    }

    const p3 = ambilHasilAudit(auditId);
    await vi.runAllTimersAsync();
    const hasil = await p3;

    expect(hasil.status).toBe("selesai");
  });

  // ----------------------------------------------------------
  // Validasi struktur data hasil audit selesai
  // ----------------------------------------------------------
  it("hasil audit selesai memiliki semua field yang diperlukan dari api.md 7.2", async () => {
    const auditId = `aud_test_${Date.now()}_d`;

    for (let i = 0; i < 2; i++) {
      const p = ambilHasilAudit(auditId);
      await vi.runAllTimersAsync();
      await p;
    }

    const p3 = ambilHasilAudit(auditId);
    await vi.runAllTimersAsync();
    const hasil = await p3;

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
  });

  // ----------------------------------------------------------
  // Validasi skor risiko hanya berisi nilai yang valid
  // ----------------------------------------------------------
  it("skor_risiko hanya berisi hijau, kuning, atau merah", async () => {
    const auditId = `aud_test_${Date.now()}_e`;

    for (let i = 0; i < 2; i++) {
      const p = ambilHasilAudit(auditId);
      await vi.runAllTimersAsync();
      await p;
    }

    const p3 = ambilHasilAudit(auditId);
    await vi.runAllTimersAsync();
    const hasil = await p3;

    const hasilSelesai = hasil as HasilAuditSelesai;
    expect(["hijau", "kuning", "merah"]).toContain(hasilSelesai.skor_risiko);
  });

  // ----------------------------------------------------------
  // Validasi klausul — setiap klausul punya field wajib
  // ----------------------------------------------------------
  it("setiap klausul memiliki field wajib dari api.md 7.2", async () => {
    const auditId = `aud_test_${Date.now()}_f`;

    for (let i = 0; i < 2; i++) {
      const p = ambilHasilAudit(auditId);
      await vi.runAllTimersAsync();
      await p;
    }

    const p3 = ambilHasilAudit(auditId);
    await vi.runAllTimersAsync();
    const hasil = await p3;

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

  // ----------------------------------------------------------
  // Validasi statistik — jumlah harus konsisten
  // ----------------------------------------------------------
  it("statistik.total_klausul sesuai jumlah array klausul", async () => {
    const auditId = `aud_test_${Date.now()}_g`;

    for (let i = 0; i < 2; i++) {
      const p = ambilHasilAudit(auditId);
      await vi.runAllTimersAsync();
      await p;
    }

    const p3 = ambilHasilAudit(auditId);
    await vi.runAllTimersAsync();
    const hasil = await p3;

    const hasilSelesai = hasil as HasilAuditSelesai;
    const stat: StatistikAudit = hasilSelesai.statistik;

    expect(stat.total_klausul).toBe(hasilSelesai.klausul.length);
    expect(
      stat.klausul_merah + stat.klausul_kuning + stat.klausul_hijau
    ).toBe(stat.total_klausul);
  });

  // ----------------------------------------------------------
  // Validasi progres persen — harus dalam range 0-100
  // ----------------------------------------------------------
  it("progres_persen pada status memproses berada dalam range 0-100", async () => {
    const auditId = `aud_test_${Date.now()}_h`;
    const promise = ambilHasilAudit(auditId);
    await vi.runAllTimersAsync();
    const hasil = await promise;

    if (hasil.status === "memproses") {
      expect(hasil.progres_persen).toBeGreaterThanOrEqual(0);
      expect(hasil.progres_persen).toBeLessThanOrEqual(100);
    }
  });

  // ----------------------------------------------------------
  // ID audit dipertahankan di setiap respons
  // ----------------------------------------------------------
  it("id audit konsisten di setiap panggilan polling", async () => {
    const auditId = `aud_test_${Date.now()}_i`;
    const promise = ambilHasilAudit(auditId);
    await vi.runAllTimersAsync();
    const hasil = await promise;

    expect(hasil.id).toBe(auditId);
  });
});

// ============================================================
// Test dokumen-pratinjau service (api.md 6.3)
// ============================================================
describe("dokumen-pratinjau service (mode mock)", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_MOCK_AUTH", "true");
  });

  it("mengembalikan detail dokumen dengan url_pratinjau untuk ID yang dikenal", async () => {
    const { ambilDetailDokumen } = await import(
      "./services/dokumen-pratinjau.service"
    );
    const hasil = await ambilDetailDokumen("dok_rani_001");

    expect(hasil.id).toBe("dok_rani_001");
    expect(hasil.url_pratinjau).not.toBeNull();
    expect(typeof hasil.url_pratinjau).toBe("string");
  });

  it("mengembalikan semua field wajib dari api.md 6.3", async () => {
    const { ambilDetailDokumen } = await import(
      "./services/dokumen-pratinjau.service"
    );
    const hasil = await ambilDetailDokumen("dok_bima_001");

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

  it("mengembalikan fallback untuk ID dokumen yang tidak dikenal", async () => {
    const { ambilDetailDokumen } = await import(
      "./services/dokumen-pratinjau.service"
    );
    // ID dinamis dari alur unggah — harus dapat fallback
    const hasil = await ambilDetailDokumen("dok_mock_tidak_dikenal");

    expect(hasil.id).toBe("dok_mock_tidak_dikenal");
    // Fallback tetap mengembalikan url_pratinjau
    expect(hasil.url_pratinjau).not.toBeNull();
  });

  it("status dokumen hanya berisi nilai yang valid", async () => {
    const { ambilDetailDokumen } = await import(
      "./services/dokumen-pratinjau.service"
    );
    const hasil = await ambilDetailDokumen("dok_rani_002");

    expect(["menunggu", "memproses", "selesai", "gagal"]).toContain(
      hasil.status
    );
  });

  it("url_pratinjau adalah string URL yang valid jika tidak null", async () => {
    const { ambilDetailDokumen } = await import(
      "./services/dokumen-pratinjau.service"
    );
    const hasil = await ambilDetailDokumen("dok_bima_002");

    if (hasil.url_pratinjau !== null) {
      expect(() => new URL(hasil.url_pratinjau!)).not.toThrow();
    }
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