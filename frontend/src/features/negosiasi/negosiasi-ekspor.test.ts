// ============================================================
// Test ekspor draf negosiasi — F-NEGO-03 PRD.md
// Cakupan: eksporSebagaiPdf, eksporSebagaiWord, buatNamaFile, unduhBlob
// Sesuai AGENTS.md Bagian 6: 70% untuk hooks/services/utils
//
// Catatan: eksporSebagaiPdf dan eksporSebagaiWord ditest dengan
// mock @react-pdf/renderer dan docx agar tidak perlu browser
// environment penuh. unduhBlob ditest dengan mock DOM minimal.
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  buatNamaFile,
  unduhBlob,
  TEKS_DISCLAIMER_EKSPOR,
  type DataEksporNegosiasi,
} from "./ekspor-negosiasi.utils";

// ============================================================
// Mock @react-pdf/renderer — tidak butuh canvas/browser
// ============================================================
vi.mock("@react-pdf/renderer", () => ({
  Document: ({ children }: { children: unknown }) => children,
  Page: ({ children }: { children: unknown }) => children,
  Text: ({ children }: { children: unknown }) => children,
  View: ({ children }: { children: unknown }) => children,
  StyleSheet: {
    create: (styles: Record<string, unknown>) => styles,
  },
  Font: {
    registerHyphenationCallback: vi.fn(),
  },
  pdf: vi.fn(() => ({
    toBlob: vi.fn().mockResolvedValue(
      new Blob(["PDF_CONTENT_MOCK"], { type: "application/pdf" })
    ),
  })),
}));

// ============================================================
// Mock docx — tidak butuh Node.js Buffer environment
// Document, Paragraph, TextRun dipanggil dengan `new` sehingga
// mock harus berupa class (konstruktor), bukan arrow function biasa.
// ============================================================
vi.mock("docx", () => {
  class MockDocument {}
  class MockParagraph {}
  class MockTextRun {}

  return {
    Document: MockDocument,
    Paragraph: MockParagraph,
    TextRun: MockTextRun,
    HeadingLevel: { HEADING_1: "Heading1" },
    BorderStyle: { SINGLE: "single", THICK: "thick" },
    AlignmentType: { JUSTIFIED: "both" },
    Packer: {
      toBlob: vi.fn().mockResolvedValue(
        new Blob(["DOCX_CONTENT_MOCK"], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        })
      ),
    },
  };
});

// ============================================================
// Data fixture
// ============================================================
const DATA_EKSPOR_CONTOH: DataEksporNegosiasi = {
  judulKlausul: "Klausul 5 — Denda Keterlambatan",
  labelVersi: "Negosiasi Standar — Pendekatan profesional",
  teksAsliKlausul:
    "Freelancer wajib membayar denda sebesar 5% per hari keterlambatan dari total nilai proyek tanpa batas maksimum.",
  teksDraf:
    "Denda keterlambatan ditetapkan 1% per hari dengan batas maksimum 10% dari total nilai kontrak.",
  tanggalEkspor: "2026-08-23T09:00:00Z",
};

// ============================================================
// Test buatNamaFile
// ============================================================
describe("buatNamaFile", () => {
  it("menghasilkan nama file PDF dengan ekstensi benar", () => {
    const nama = buatNamaFile("Klausul 5 — Denda Keterlambatan", "pdf");
    expect(nama).toMatch(/\.pdf$/);
  });

  it("menghasilkan nama file Word dengan ekstensi benar", () => {
    const nama = buatNamaFile("Klausul 5 — Denda Keterlambatan", "docx");
    expect(nama).toMatch(/\.docx$/);
  });

  it("dimulai dengan prefix draf-negosiasi-", () => {
    const nama = buatNamaFile("Klausul 5 — Denda Keterlambatan", "pdf");
    expect(nama).toMatch(/^draf-negosiasi-/);
  });

  it("mengambil bagian sebelum tanda — sebagai nama file", () => {
    const nama = buatNamaFile("Klausul 5 — Denda Keterlambatan", "pdf");
    // "klausul 5" → "klausul-5"
    expect(nama).toContain("klausul");
  });

  it("menghasilkan nama file yang aman dari karakter khusus", () => {
    const nama = buatNamaFile("Klausul: Hak Cipta & Royalti!", "pdf");
    // Tidak boleh ada karakter yang tidak aman untuk nama file
    expect(nama).not.toMatch(/[:<>&!]/);
  });

  it("tidak menghasilkan nama kosong untuk judul apapun", () => {
    const nama = buatNamaFile("", "pdf");
    expect(nama).toBe("draf-negosiasi-klausul.pdf");
  });

  it("membatasi panjang nama file maksimum", () => {
    const judulPanjang = "Klausul".repeat(20);
    const nama = buatNamaFile(judulPanjang, "pdf");
    // Panjang total termasuk prefix dan ekstensi tidak boleh terlalu panjang
    expect(nama.length).toBeLessThanOrEqual(80);
  });
});

// ============================================================
// Test TEKS_DISCLAIMER_EKSPOR
// ============================================================
describe("TEKS_DISCLAIMER_EKSPOR", () => {
  it("tidak kosong", () => {
    expect(TEKS_DISCLAIMER_EKSPOR.length).toBeGreaterThan(0);
  });

  it("menyebut bukan nasihat hukum", () => {
    expect(TEKS_DISCLAIMER_EKSPOR.toLowerCase()).toMatch(/bukan nasihat hukum/);
  });

  it("menyebut rekomendasi konsultasi profesional", () => {
    expect(TEKS_DISCLAIMER_EKSPOR.toLowerCase()).toMatch(/pengacara/);
  });
});

// ============================================================
// Test eksporSebagaiPdf (dengan mock @react-pdf/renderer)
// ============================================================
describe("eksporSebagaiPdf", () => {
  it("mengembalikan Blob dengan MIME type application/pdf", async () => {
    const { eksporSebagaiPdf } = await import("./ekspor-negosiasi.utils");
    const blob = await eksporSebagaiPdf(DATA_EKSPOR_CONTOH);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("application/pdf");
  });

  it("menghasilkan Blob yang tidak kosong", async () => {
    const { eksporSebagaiPdf } = await import("./ekspor-negosiasi.utils");
    const blob = await eksporSebagaiPdf(DATA_EKSPOR_CONTOH);
    expect(blob.size).toBeGreaterThan(0);
  });

  it("berhasil dipanggil dengan tanggalEkspor undefined", async () => {
    const { eksporSebagaiPdf } = await import("./ekspor-negosiasi.utils");
    const dataLengkap = { ...DATA_EKSPOR_CONTOH };
    delete dataLengkap.tanggalEkspor;
    await expect(eksporSebagaiPdf(dataLengkap)).resolves.toBeInstanceOf(Blob);
  });
});

// ============================================================
// Test eksporSebagaiWord (dengan mock docx)
// ============================================================
describe("eksporSebagaiWord", () => {
  it("mengembalikan Blob dengan MIME type Word", async () => {
    const { eksporSebagaiWord } = await import("./ekspor-negosiasi.utils");
    const blob = await eksporSebagaiWord(DATA_EKSPOR_CONTOH);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  });

  it("menghasilkan Blob yang tidak kosong", async () => {
    const { eksporSebagaiWord } = await import("./ekspor-negosiasi.utils");
    const blob = await eksporSebagaiWord(DATA_EKSPOR_CONTOH);
    expect(blob.size).toBeGreaterThan(0);
  });

  it("berhasil dipanggil dengan tanggalEkspor undefined", async () => {
    const { eksporSebagaiWord } = await import("./ekspor-negosiasi.utils");
    const dataLengkap = { ...DATA_EKSPOR_CONTOH };
    delete dataLengkap.tanggalEkspor;
    await expect(eksporSebagaiWord(dataLengkap)).resolves.toBeInstanceOf(Blob);
  });
});

// ============================================================
// Test unduhBlob (dengan mock DOM)
// ============================================================
describe("unduhBlob", () => {
  let tautan: HTMLAnchorElement;
  let clickSpy: ReturnType<typeof vi.fn>;
  let appendChildSpy: ReturnType<typeof vi.spyOn>;
  let removeChildSpy: ReturnType<typeof vi.spyOn>;
  let createElementSpy: ReturnType<typeof vi.spyOn>;
  let createObjectURLSpy: ReturnType<typeof vi.fn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock elemen <a> yang dibuat oleh unduhBlob
    clickSpy = vi.fn();
    tautan = { href: "", download: "", click: clickSpy } as unknown as HTMLAnchorElement;

    createElementSpy = vi
      .spyOn(document, "createElement")
      .mockReturnValue(tautan);
    appendChildSpy = vi
      .spyOn(document.body, "appendChild")
      .mockReturnValue(tautan);
    removeChildSpy = vi
      .spyOn(document.body, "removeChild")
      .mockReturnValue(tautan);

    // Mock URL API — cast ke unknown dulu lalu ke tipe yang diharapkan
    // karena signature vi.fn() tidak cocok langsung dengan tipe URL methods
    createObjectURLSpy = vi.fn().mockReturnValue("blob:mock-url");
    revokeObjectURLSpy = vi.fn();
    global.URL.createObjectURL = createObjectURLSpy as unknown as (obj: Blob | MediaSource) => string;
    global.URL.revokeObjectURL = revokeObjectURLSpy as unknown as (url: string) => void;

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("memanggil click pada elemen tautan", () => {
    const blob = new Blob(["test"], { type: "application/pdf" });
    unduhBlob(blob, "test.pdf");
    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it("mengatur atribut download dengan nama file yang diberikan", () => {
    const blob = new Blob(["test"], { type: "application/pdf" });
    unduhBlob(blob, "draf-negosiasi-test.pdf");
    expect(tautan.download).toBe("draf-negosiasi-test.pdf");
  });

  it("menambahkan dan menghapus elemen dari DOM", () => {
    const blob = new Blob(["test"], { type: "application/pdf" });
    unduhBlob(blob, "test.pdf");
    expect(appendChildSpy).toHaveBeenCalledOnce();
    expect(removeChildSpy).toHaveBeenCalledOnce();
  });

  it("memanggil URL.createObjectURL dengan blob yang diberikan", () => {
    const blob = new Blob(["test"], { type: "application/pdf" });
    unduhBlob(blob, "test.pdf");
    expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
  });

  it("memanggil URL.revokeObjectURL setelah timeout", () => {
    const blob = new Blob(["test"], { type: "application/pdf" });
    unduhBlob(blob, "test.pdf");
    expect(revokeObjectURLSpy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");
  });
});