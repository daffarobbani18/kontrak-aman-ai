// ============================================================
// Test negosiasi — KontrakAman AI
// Cakupan: service (via mock apiClient), template pengantar, tipe
// Sesuai AGENTS.md Bagian 6: 70% untuk hooks/services/utils
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  mintaDrafNegosiasi,
  ambilHasilNegosiasi,
} from "./services/negosiasi.service";
import type {
  HasilNegosiasiSelesai,
  HasilNegosiasiMemproses,
  ResponsPermintaanNegosiasi,
} from "./types";
import { apiClient } from "@/lib/api-client";

// Mock apiClient di boundary — service tidak melakukan fetch sungguhan
vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  apiClient: (await import("@/test/api-client-mock")).buatApiClientMock(),
}));

const mPost = vi.mocked(apiClient.post);
const mGet = vi.mocked(apiClient.get);

// ============================================================
// Test service — POST /negosiasi (api.md 8.1)
// ============================================================
describe("mintaDrafNegosiasi", () => {
  beforeEach(() => {
    mPost.mockReset();
    mGet.mockReset();
  });

  it("memanggil POST /negosiasi dengan body klausul_id", async () => {
    const fixture: ResponsPermintaanNegosiasi = {
      id: "neg_001",
      klausul_id: "kls_001",
      status: "memproses",
      dimulai_pada: "2026-08-23T09:00:00Z",
    };
    mPost.mockResolvedValueOnce({
      berhasil: true,
      pesan: "Permintaan draf negosiasi diterima.",
      data: fixture,
    });

    const hasil = await mintaDrafNegosiasi("kls_001");

    expect(mPost).toHaveBeenCalledWith(
      "/negosiasi",
      { klausul_id: "kls_001" },
      true
    );
    expect(hasil).toEqual(fixture);
  });

  it("menyertakan konteks_tambahan di body jika diberikan", async () => {
    mPost.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: {
        id: "neg_002",
        klausul_id: "kls_002",
        status: "memproses",
        dimulai_pada: "2026-08-23T09:00:00Z",
      },
    });

    await mintaDrafNegosiasi("kls_002", "Klien terbuka pada revisi denda");

    expect(mPost).toHaveBeenCalledWith(
      "/negosiasi",
      {
        klausul_id: "kls_002",
        konteks_tambahan: "Klien terbuka pada revisi denda",
      },
      true
    );
  });
});

// ============================================================
// Test service — GET /negosiasi/:id (api.md 8.2)
// ============================================================
describe("ambilHasilNegosiasi", () => {
  beforeEach(() => {
    mPost.mockReset();
    mGet.mockReset();
  });

  it("memanggil GET /negosiasi/:id dan mengembalikan data", async () => {
    const fixture: HasilNegosiasiSelesai = {
      id: "neg_001",
      klausul_id: "kls_001",
      status: "selesai",
      teks_asli_klausul: "Klausul denda 5% per hari.",
      draft_negosiasi: {
        versi: [
          { label: "Negosiasi Lunak", teks: "Saya usulkan batas denda 10%." },
          { label: "Negosiasi Standar", teks: "Denda maksimum 15%." },
          { label: "Negosiasi Tegas", teks: "Klausul ini harus direvisi." },
        ],
      },
      selesai_pada: "2026-08-23T09:01:00Z",
    };
    mGet.mockResolvedValueOnce({
      berhasil: true,
      pesan: "Hasil negosiasi berhasil diambil.",
      data: fixture,
    });

    const hasil = await ambilHasilNegosiasi("neg_001");

    expect(mGet).toHaveBeenCalledWith("/negosiasi/neg_001", true);
    expect(hasil.status).toBe("selesai");
    expect(hasil).toEqual(fixture);
  });

  it("status memproses dikembalikan apa adanya untuk polling", async () => {
    const fixture: HasilNegosiasiMemproses = {
      id: "neg_003",
      klausul_id: "kls_003",
      status: "memproses",
    };
    mGet.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: fixture,
    });

    const hasil = await ambilHasilNegosiasi("neg_003");
    expect(hasil.status).toBe("memproses");
  });
});

// ============================================================
// Test template pengantar (F-NEGO-04) — konten statis
// ============================================================
describe("template pengantar (F-NEGO-04)", () => {
  it("terdapat tepat 3 template dengan ID unik", async () => {
    const { TEMPLATE_PENGANTAR } = await import("./data/template-pengantar");
    expect(TEMPLATE_PENGANTAR).toHaveLength(3);
    const ids = TEMPLATE_PENGANTAR.map((t) => t.id);
    expect(new Set(ids).size).toBe(3);
  });

  it("setiap template memiliki id, label, deskripsi, dan teks yang tidak kosong", async () => {
    const { TEMPLATE_PENGANTAR } = await import("./data/template-pengantar");
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
    const { TEMPLATE_PENGANTAR } = await import("./data/template-pengantar");
    const ids = TEMPLATE_PENGANTAR.map((t) => t.id);
    expect(ids).toContain("santai");
    expect(ids).toContain("standar");
    expect(ids).toContain("tegas");
  });

  it("teks template tidak mengandung bahasa yang menuduh klien", async () => {
    const { TEMPLATE_PENGANTAR } = await import("./data/template-pengantar");
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
