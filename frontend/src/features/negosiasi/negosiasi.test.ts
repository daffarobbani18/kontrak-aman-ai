// ============================================================
// Test negosiasi — KontrakAman AI
// Cakupan: service mock, tipe validasi, siklus polling
// Sesuai AGENTS.md Bagian 6: 70% untuk hooks/services/utils
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  mintaDrafNegosiasi,
  ambilHasilNegosiasi,
  resetRegistriMockNegosiasi,
} from "./services/negosiasi.service";

// Counter unik per test — hindari tabrakan Date.now() saat test berjalan cepat
let urutan = 0;
function idUnik(prefix: string): string {
  return `${prefix}_${Date.now()}_${++urutan}`;
}
import type {
  HasilNegosiasiSelesai,
  HasilNegosiasiMemproses,
  ResponsPermintaanNegosiasi,
} from "./types";

// ============================================================
// Setup mock environment
// ============================================================
vi.stubEnv("NEXT_PUBLIC_MOCK_AUTH", "true");

describe("negosiasi service (mode mock)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset registri mock antar test supaya state tidak bocor
    resetRegistriMockNegosiasi();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ----------------------------------------------------------
  // POST /negosiasi — mintaDrafNegosiasi
  // ----------------------------------------------------------
  it("mintaDrafNegosiasi mengembalikan respons 202 dengan status memproses", async () => {
    const klausulId = idUnik("kls_test");
    const promise = mintaDrafNegosiasi(klausulId);
    await vi.runAllTimersAsync();
    const hasil = await promise;

    expect(hasil.status).toBe("memproses");
    expect(hasil.klausul_id).toBe(klausulId);
    expect(hasil.id).toBeTruthy();
    expect(hasil.dimulai_pada).toBeTruthy();
  });

  it("mintaDrafNegosiasi menyertakan timestamp dimulai_pada yang valid", async () => {
    const klausulId = idUnik("kls_test");
    const promise = mintaDrafNegosiasi(klausulId);
    await vi.runAllTimersAsync();
    const hasil = await promise;

    const tanggal = new Date(hasil.dimulai_pada);
    expect(tanggal.toString()).not.toBe("Invalid Date");
  });

  it("mintaDrafNegosiasi klausul yang sama mengembalikan ID yang sama (simulasi KONFLIK)", async () => {
    const klausulId = idUnik("kls_test");

    const p1 = mintaDrafNegosiasi(klausulId);
    await vi.runAllTimersAsync();
    const hasil1 = await p1;

    const p2 = mintaDrafNegosiasi(klausulId);
    await vi.runAllTimersAsync();
    const hasil2 = await p2;

    expect(hasil1.id).toBe(hasil2.id);
  });

  // ----------------------------------------------------------
  // GET /negosiasi/:id — ambilHasilNegosiasi (polling)
  // ----------------------------------------------------------
  it("panggilan pertama ambilHasilNegosiasi mengembalikan status memproses", async () => {
    const klausulId = idUnik("kls_test");
    const pMinta = mintaDrafNegosiasi(klausulId);
    await vi.runAllTimersAsync();
    const responsPermintaan = await pMinta;

    const pHasil = ambilHasilNegosiasi(responsPermintaan.id);
    await vi.runAllTimersAsync();
    const hasil = await pHasil;

    expect(hasil.status).toBe("memproses");
  });

  it("panggilan kedua ambilHasilNegosiasi mengembalikan status selesai", async () => {
    const klausulId = idUnik("kls_test");
    const pMinta = mintaDrafNegosiasi(klausulId);
    await vi.runAllTimersAsync();
    const responsPermintaan = await pMinta;

    // Polling pertama
    const p1 = ambilHasilNegosiasi(responsPermintaan.id);
    await vi.runAllTimersAsync();
    await p1;

    // Polling kedua — seharusnya selesai
    const p2 = ambilHasilNegosiasi(responsPermintaan.id);
    await vi.runAllTimersAsync();
    const hasil = await p2;

    expect(hasil.status).toBe("selesai");
  });

  it("hasil negosiasi selesai memiliki semua field wajib dari api.md 8.2", async () => {
    const klausulId = idUnik("kls_test");
    const pMinta = mintaDrafNegosiasi(klausulId);
    await vi.runAllTimersAsync();
    const responsPermintaan = await pMinta;

    const p1 = ambilHasilNegosiasi(responsPermintaan.id);
    await vi.runAllTimersAsync();
    await p1;

    const p2 = ambilHasilNegosiasi(responsPermintaan.id);
    await vi.runAllTimersAsync();
    const hasil = await p2;

    expect(hasil.status).toBe("selesai");
    const hasilSelesai = hasil as HasilNegosiasiSelesai;
    expect(hasilSelesai).toHaveProperty("id");
    expect(hasilSelesai).toHaveProperty("klausul_id");
    expect(hasilSelesai).toHaveProperty("teks_asli_klausul");
    expect(hasilSelesai).toHaveProperty("draft_negosiasi");
    expect(hasilSelesai).toHaveProperty("selesai_pada");
    expect(hasilSelesai.draft_negosiasi).toHaveProperty("versi");
  });

  it("draft_negosiasi memiliki tepat 3 versi (lunak, standar, tegas)", async () => {
    const klausulId = idUnik("kls_test");
    const pMinta = mintaDrafNegosiasi(klausulId);
    await vi.runAllTimersAsync();
    const responsPermintaan = await pMinta;

    const p1 = ambilHasilNegosiasi(responsPermintaan.id);
    await vi.runAllTimersAsync();
    await p1;

    const p2 = ambilHasilNegosiasi(responsPermintaan.id);
    await vi.runAllTimersAsync();
    const hasil = await p2;

    const hasilSelesai = hasil as HasilNegosiasiSelesai;
    expect(hasilSelesai.draft_negosiasi.versi).toHaveLength(3);
  });

  it("setiap versi draf memiliki label dan teks yang tidak kosong", async () => {
    const klausulId = idUnik("kls_test");
    const pMinta = mintaDrafNegosiasi(klausulId);
    await vi.runAllTimersAsync();
    const responsPermintaan = await pMinta;

    const p1 = ambilHasilNegosiasi(responsPermintaan.id);
    await vi.runAllTimersAsync();
    await p1;

    const p2 = ambilHasilNegosiasi(responsPermintaan.id);
    await vi.runAllTimersAsync();
    const hasil = await p2;

    const hasilSelesai = hasil as HasilNegosiasiSelesai;
    hasilSelesai.draft_negosiasi.versi.forEach((versi) => {
      expect(versi.label).toBeTruthy();
      expect(versi.teks).toBeTruthy();
      expect(versi.teks.length).toBeGreaterThan(20);
    });
  });

  it("selesai_pada adalah format ISO 8601 yang valid", async () => {
    const klausulId = idUnik("kls_test");
    const pMinta = mintaDrafNegosiasi(klausulId);
    await vi.runAllTimersAsync();
    const responsPermintaan = await pMinta;

    const p1 = ambilHasilNegosiasi(responsPermintaan.id);
    await vi.runAllTimersAsync();
    await p1;

    const p2 = ambilHasilNegosiasi(responsPermintaan.id);
    await vi.runAllTimersAsync();
    const hasil = await p2;

    const hasilSelesai = hasil as HasilNegosiasiSelesai;
    const tanggal = new Date(hasilSelesai.selesai_pada);
    expect(tanggal.toString()).not.toBe("Invalid Date");
  });
});

// ============================================================
// Test F-NEGO-04 — data template pengantar (konten statis)
// ============================================================
describe("template pengantar (F-NEGO-04)", () => {
  it("terdapat tepat 3 template dengan ID unik", async () => {
    const { TEMPLATE_PENGANTAR } = await import(
      "./data/template-pengantar"
    );
    expect(TEMPLATE_PENGANTAR).toHaveLength(3);
    const ids = TEMPLATE_PENGANTAR.map((t) => t.id);
    const idUnik = new Set(ids);
    expect(idUnik.size).toBe(3);
  });

  it("setiap template memiliki id, label, deskripsi, dan teks yang tidak kosong", async () => {
    const { TEMPLATE_PENGANTAR } = await import(
      "./data/template-pengantar"
    );
    TEMPLATE_PENGANTAR.forEach((template) => {
      expect(template.id.length).toBeGreaterThan(0);
      expect(template.label.length).toBeGreaterThan(0);
      expect(template.deskripsi.length).toBeGreaterThan(0);
      expect(template.teks.length).toBeGreaterThan(20);
    });
  });

  it("setiap template mengandung placeholder NAMA_KLIEN dan NAMA_KAMU", async () => {
    const { TEMPLATE_PENGANTAR, PLACEHOLDER_NAMA_KLIEN, PLACEHOLDER_NAMA_KAMU } =
      await import("./data/template-pengantar");
    TEMPLATE_PENGANTAR.forEach((template) => {
      expect(template.teks).toContain(PLACEHOLDER_NAMA_KLIEN);
      expect(template.teks).toContain(PLACEHOLDER_NAMA_KAMU);
    });
  });

  it("isiPlaceholder mengganti placeholder dengan nilai yang diberikan", async () => {
    const { isiPlaceholder } = await import("./data/template-pengantar");
    const teks = "Halo {{NAMA_KLIEN}}, salam dari {{NAMA_KAMU}}.";
    const hasil = isiPlaceholder(teks, "Pak Andi", "Rani");
    expect(hasil).toBe("Halo Pak Andi, salam dari Rani.");
    expect(hasil).not.toContain("{{NAMA_KLIEN}}");
    expect(hasil).not.toContain("{{NAMA_KAMU}}");
  });

  it("isiPlaceholder menggunakan fallback saat nama kosong", async () => {
    const { isiPlaceholder } = await import("./data/template-pengantar");
    const teks = "Halo {{NAMA_KLIEN}}, dari {{NAMA_KAMU}}.";
    const hasil = isiPlaceholder(teks, "", "");
    expect(hasil).toContain("Bapak/Ibu");
    expect(hasil).toContain("saya");
  });

  it("template mencakup tiga nada: santai, standar, dan tegas", async () => {
    const { TEMPLATE_PENGANTAR } = await import(
      "./data/template-pengantar"
    );
    const ids = TEMPLATE_PENGANTAR.map((t) => t.id);
    expect(ids).toContain("santai");
    expect(ids).toContain("standar");
    expect(ids).toContain("tegas");
  });

  it("teks template tidak mengandung bahasa yang menuduh klien", async () => {
    const { TEMPLATE_PENGANTAR } = await import(
      "./data/template-pengantar"
    );
    const kataYangDilarang = ["tidak adil", "curang", "manipulasi", "jebakan", "merugikan"];
    TEMPLATE_PENGANTAR.forEach((template) => {
      kataYangDilarang.forEach((kata) => {
        expect(template.teks.toLowerCase()).not.toContain(kata);
      });
    });
  });
});

// ============================================================
// Test validasi tipe
// ============================================================
describe("validasi tipe negosiasi", () => {
  it("ResponsPermintaanNegosiasi memiliki struktur tipe yang benar", () => {
    const contoh: ResponsPermintaanNegosiasi = {
      id: "neg_001",
      klausul_id: "kls_001",
      status: "memproses",
      dimulai_pada: "2026-08-23T09:00:00Z",
    };
    expect(contoh.status).toBe("memproses");
    expect(contoh.id).toBeTruthy();
  });

  it("HasilNegosiasiSelesai memiliki struktur tipe yang benar", () => {
    const contoh: HasilNegosiasiSelesai = {
      id: "neg_001",
      klausul_id: "kls_001",
      status: "selesai",
      teks_asli_klausul: "Klausul denda 5% per hari.",
      draft_negosiasi: {
        versi: [
          { label: "Negosiasi Lunak", teks: "Saya usulkan batas denda 10%." },
          { label: "Negosiasi Standar", teks: "Denda maksimum 15% dari nilai kontrak." },
          { label: "Negosiasi Tegas", teks: "Klausul ini harus direvisi total." },
        ],
      },
      selesai_pada: "2026-08-23T09:01:00Z",
    };
    expect(contoh.status).toBe("selesai");
    expect(contoh.draft_negosiasi.versi).toHaveLength(3);
  });

  it("HasilNegosiasiMemproses memiliki struktur tipe yang benar", () => {
    const contoh: HasilNegosiasiMemproses = {
      id: "neg_001",
      klausul_id: "kls_001",
      status: "memproses",
    };
    expect(contoh.status).toBe("memproses");
  });
});