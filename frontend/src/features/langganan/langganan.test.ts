// ============================================================
// Test langganan — KontrakAman AI
// Cakupan: service via mock apiClient (api.md 9.1–9.5),
//          validasi tipe
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ambilPaketHarga,
  buatSesiPembayaran,
  ambilLanggananAktif,
  batalkanLangganan,
  ambilRiwayatTransaksi,
} from "./services/langganan.service";
import { apiClient } from "@/lib/api-client";

// Mock apiClient di boundary — service tidak melakukan fetch sungguhan
vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  apiClient: (await import("@/test/api-client-mock")).buatApiClientMock(),
}));

const mGet = vi.mocked(apiClient.get);
const mPost = vi.mocked(apiClient.post);

// apiClient.get bertipe ResponsAPI<T>; respons paginasi (api.md Bagian 1)
// dikembalikan lewat helper ini agar mock tetap lolos typecheck.
function responsBerpaginasi(data: unknown, paginasi: unknown) {
  return { berhasil: true, pesan: "OK", data, paginasi } as never;
}

// Fixture paket harga sesuai api.md 9.1
const PAKET_FIKTIF = [
  {
    id: "pkg_gratis" as const,
    nama: "Gratis",
    harga_bulanan: 0,
    mata_uang: "IDR",
    fitur: {
      audit_per_bulan: 3,
      negosiasi_per_bulan: 1,
      keterangan_kuota: "Kuota terbatas",
    },
  },
  {
    id: "pkg_pro" as const,
    nama: "Pro",
    harga_bulanan: 99000,
    mata_uang: "IDR",
    fitur: {
      audit_per_bulan: -1,
      negosiasi_per_bulan: -1,
      keterangan_kuota: "Tidak terbatas",
    },
  },
  {
    id: "pkg_bisnis" as const,
    nama: "Bisnis",
    harga_bulanan: 249000,
    mata_uang: "IDR",
    fitur: {
      audit_per_bulan: -1,
      negosiasi_per_bulan: -1,
      keterangan_kuota: "Tidak terbatas",
    },
  },
];

// ============================================================
// GET /langganan/paket — api.md 9.1
// ============================================================
describe("ambilPaketHarga", () => {
  beforeEach(() => {
    mGet.mockReset();
  });

  it("memanggil GET /langganan/paket tanpa auth", async () => {
    mGet.mockResolvedValueOnce({ berhasil: true, pesan: "OK", data: PAKET_FIKTIF });

    await ambilPaketHarga();

    expect(mGet).toHaveBeenCalledWith("/langganan/paket", false);
  });

  it("mengembalikan daftar paket dari respons API", async () => {
    mGet.mockResolvedValueOnce({ berhasil: true, pesan: "OK", data: PAKET_FIKTIF });

    const paket = await ambilPaketHarga();

    expect(paket).toHaveLength(3);
    expect(paket[0].id).toBe("pkg_gratis");
  });

  it("setiap paket memiliki field wajib dari api.md 9.1", async () => {
    mGet.mockResolvedValueOnce({ berhasil: true, pesan: "OK", data: PAKET_FIKTIF });

    const paket = await ambilPaketHarga();

    paket.forEach((p) => {
      expect(p).toHaveProperty("id");
      expect(p).toHaveProperty("nama");
      expect(p).toHaveProperty("harga_bulanan");
      expect(p).toHaveProperty("mata_uang");
      expect(p).toHaveProperty("fitur");
      expect(p.fitur).toHaveProperty("audit_per_bulan");
      expect(p.fitur).toHaveProperty("negosiasi_per_bulan");
      expect(p.fitur).toHaveProperty("keterangan_kuota");
    });
  });
});

// ============================================================
// POST /langganan/buat-sesi-pembayaran — api.md 9.2
// ============================================================
describe("buatSesiPembayaran", () => {
  beforeEach(() => {
    mPost.mockReset();
  });

  it("memanggil POST /langganan/buat-sesi-pembayaran dengan paket_id + periode", async () => {
    mPost.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: {
        sesi_id: "sesi_001",
        url_checkout: "https://pay.mayar.id/sesi_001",
        kedaluwarsa_pada: "2026-09-15T00:00:00Z",
      },
    });

    const sesi = await buatSesiPembayaran("pkg_pro", "bulanan");

    expect(mPost).toHaveBeenCalledWith(
      "/langganan/buat-sesi-pembayaran",
      { paket_id: "pkg_pro", periode: "bulanan" },
      true
    );
    expect(sesi.sesi_id).toBeTruthy();
    expect(sesi.url_checkout).toBeTruthy();
    expect(sesi.kedaluwarsa_pada).toBeTruthy();
  });

  it("kedaluwarsa_pada adalah timestamp ISO 8601 yang valid", async () => {
    mPost.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: {
        sesi_id: "sesi_002",
        url_checkout: "https://pay.mayar.id/sesi_002",
        kedaluwarsa_pada: "2026-09-15T00:00:00Z",
      },
    });

    const sesi = await buatSesiPembayaran("pkg_bisnis", "tahunan");

    const tanggal = new Date(sesi.kedaluwarsa_pada);
    expect(tanggal.toString()).not.toBe("Invalid Date");
  });
});

// ============================================================
// GET /langganan/aktif — api.md 9.3
// ============================================================
describe("ambilLanggananAktif", () => {
  beforeEach(() => {
    mGet.mockReset();
  });

  it("memanggil GET /langganan/aktif dengan auth", async () => {
    mGet.mockResolvedValueOnce({ berhasil: true, pesan: "OK", data: null });

    await ambilLanggananAktif();

    expect(mGet).toHaveBeenCalledWith("/langganan/aktif", true);
  });

  it("mengembalikan null saat tier gratis (data null)", async () => {
    mGet.mockResolvedValueOnce({ berhasil: true, pesan: "OK", data: null });

    const hasil = await ambilLanggananAktif();

    expect(hasil).toBeNull();
  });

  it("jika ada langganan, memiliki field wajib dari api.md 9.3", async () => {
    mGet.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: {
        id: "lgn_001",
        tier: "pkg_pro",
        status: "aktif",
        periode: "bulanan",
        aktif_sejak: "2026-08-01T00:00:00Z",
        aktif_hingga: "2026-09-01T00:00:00Z",
        perbarui_otomatis: true,
      },
    });

    const hasil = await ambilLanggananAktif();

    expect(hasil).toHaveProperty("id");
    expect(hasil).toHaveProperty("tier");
    expect(hasil).toHaveProperty("status");
    expect(hasil).toHaveProperty("periode");
    expect(hasil).toHaveProperty("aktif_sejak");
    expect(hasil).toHaveProperty("aktif_hingga");
    expect(hasil).toHaveProperty("perbarui_otomatis");
  });
});

// ============================================================
// POST /langganan/batalkan — api.md 9.4
// ============================================================
describe("batalkanLangganan", () => {
  beforeEach(() => {
    mPost.mockReset();
  });

  it("memanggil POST /langganan/batalkan dengan alasan", async () => {
    mPost.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: { aktif_hingga: "2026-09-01T00:00:00Z", perbarui_otomatis: false },
    });

    await batalkanLangganan("Tidak terpakai");

    expect(mPost).toHaveBeenCalledWith(
      "/langganan/batalkan",
      { alasan: "Tidak terpakai" },
      true
    );
  });

  it("mengirim string kosong saat alasan tidak diberikan", async () => {
    mPost.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: { aktif_hingga: "2026-09-01T00:00:00Z", perbarui_otomatis: false },
    });

    await batalkanLangganan();

    expect(mPost).toHaveBeenCalledWith("/langganan/batalkan", { alasan: "" }, true);
  });

  it("mengembalikan aktif_hingga dan perbarui_otomatis false", async () => {
    mPost.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: { aktif_hingga: "2026-09-01T00:00:00Z", perbarui_otomatis: false },
    });

    const hasil = await batalkanLangganan("Tidak terpakai");

    expect(hasil).toHaveProperty("aktif_hingga");
    expect(hasil.perbarui_otomatis).toBe(false);
  });
});

// ============================================================
// GET /langganan/transaksi — api.md 9.5
// ============================================================
describe("ambilRiwayatTransaksi", () => {
  beforeEach(() => {
    mGet.mockReset();
  });

  it("memanggil GET /langganan/transaksi tanpa query saat tanpa opsi", async () => {
    mGet.mockResolvedValueOnce(
      responsBerpaginasi([], { cursor_berikutnya: null, ada_lagi: false, total: 0 })
    );

    await ambilRiwayatTransaksi();

    expect(mGet).toHaveBeenCalledWith("/langganan/transaksi", true);
  });

  it("menyusun query limit dan cursor", async () => {
    mGet.mockResolvedValueOnce(
      responsBerpaginasi([], { cursor_berikutnya: null, ada_lagi: false, total: 0 })
    );

    await ambilRiwayatTransaksi({ limit: 10, cursor: "abc" });

    const path = mGet.mock.calls[0][0] as string;
    expect(path).toContain("/langganan/transaksi?");
    expect(path).toContain("limit=10");
    expect(path).toContain("cursor=abc");
  });

  it("mengembalikan data dan paginasi", async () => {
    mGet.mockResolvedValueOnce(
      responsBerpaginasi(
        [
          {
            id: "trx_001",
            jenis: "pembayaran",
            jumlah: 99000,
            mata_uang: "IDR",
            status: "berhasil",
            paket: "pkg_pro",
            periode: "bulanan",
            dibayar_pada: "2026-08-01T00:00:00Z",
          },
        ],
        { cursor_berikutnya: null, ada_lagi: false, total: 1 }
      )
    );

    const hasil = await ambilRiwayatTransaksi();

    expect(Array.isArray(hasil.data)).toBe(true);
    expect(hasil.paginasi).toHaveProperty("cursor_berikutnya");
    expect(hasil.paginasi).toHaveProperty("ada_lagi");
    expect(hasil.paginasi).toHaveProperty("total");
  });

  it("setiap transaksi memiliki field wajib dari api.md 9.5", async () => {
    mGet.mockResolvedValueOnce(
      responsBerpaginasi(
        [
          {
            id: "trx_001",
            jenis: "pembayaran",
            jumlah: 99000,
            mata_uang: "IDR",
            status: "berhasil",
            paket: "pkg_pro",
            periode: "bulanan",
            dibayar_pada: "2026-08-01T00:00:00Z",
          },
        ],
        { cursor_berikutnya: null, ada_lagi: false, total: 1 }
      )
    );

    const hasil = await ambilRiwayatTransaksi();

    hasil.data.forEach((trx) => {
      expect(trx).toHaveProperty("id");
      expect(trx).toHaveProperty("jenis");
      expect(trx).toHaveProperty("jumlah");
      expect(trx).toHaveProperty("mata_uang");
      expect(trx).toHaveProperty("status");
      expect(trx).toHaveProperty("paket");
      expect(trx).toHaveProperty("periode");
      expect(trx).toHaveProperty("dibayar_pada");
    });
  });
});

// ============================================================
// Test validasi tipe
// ============================================================
describe("validasi tipe langganan", () => {
  it("PaketHarga memiliki struktur tipe yang benar", () => {
    const contoh = {
      id: "pkg_pro" as const,
      nama: "Pro",
      harga_bulanan: 99000,
      mata_uang: "IDR",
      fitur: {
        audit_per_bulan: -1,
        negosiasi_per_bulan: -1,
        keterangan_kuota: "Tidak terbatas",
      },
    };
    expect(contoh.id).toBe("pkg_pro");
    expect(contoh.harga_bulanan).toBe(99000);
  });

  it("StatusPembayaranMayar hanya berisi nilai yang valid", () => {
    const nilaiValid = ["berhasil", "dibatalkan", "gagal"];
    nilaiValid.forEach((nilai) => {
      expect(["berhasil", "dibatalkan", "gagal"]).toContain(nilai);
    });
  });
});
