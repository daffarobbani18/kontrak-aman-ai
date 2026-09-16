// ============================================================
// Test privasi — KontrakAman AI
// Cakupan: service via mock api boundary (hapus akun, ekspor data),
//          validasi schema Zod
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  hapusAkun,
  ajukanEksporData,
  ambilStatusEkspor,
} from "./services/privasi.service";
import { skemaHapusAkun } from "./types";
import { permintaanAPI, apiClient } from "@/lib/api-client";

// Mock boundary api — service tidak melakukan fetch sungguhan.
// hapusAkun & ajukanEksporData pakai permintaanAPI langsung (DELETE dengan body),
// ambilStatusEkspor pakai apiClient.get.
vi.mock("@/lib/api-client", async (importOriginal) => {
  const asli = await importOriginal<typeof import("@/lib/api-client")>();
  return {
    ...asli,
    permintaanAPI: vi.fn(),
    apiClient: (await import("@/test/api-client-mock")).buatApiClientMock(),
  };
});

const mPermintaan = vi.mocked(permintaanAPI);
const mGet = vi.mocked(apiClient.get);

// ============================================================
// DELETE /pengguna/saya — hapusAkun (api.md 5.4)
// ============================================================
describe("hapusAkun", () => {
  beforeEach(() => {
    mPermintaan.mockReset();
  });

  it("memanggil DELETE /pengguna/saya dengan body konfirmasi + kata_sandi", async () => {
    mPermintaan.mockResolvedValueOnce({
      berhasil: true,
      pesan: "Akun dijadwalkan untuk dihapus permanen dalam 30 hari.",
      data: { dihapus_pada: "2026-09-14T00:00:00Z" },
    });

    const hasil = await hapusAkun("HAPUS AKUN", "KataSandi123!");

    expect(mPermintaan).toHaveBeenCalledWith("/pengguna/saya", {
      method: "DELETE",
      body: { konfirmasi: "HAPUS AKUN", kata_sandi: "KataSandi123!" },
      butuhAuth: true,
    });
    expect(hasil.berhasil).toBe(true);
  });

  it("melempar KesalahanAPI saat kata sandi salah", async () => {
    const { KesalahanAPI } = await import("@/lib/api-client");
    mPermintaan.mockRejectedValueOnce(
      new KesalahanAPI("Kata sandi tidak cocok.", "VALIDASI_GAGAL", 400)
    );

    let errorTertangkap: unknown;
    try {
      await hapusAkun("HAPUS AKUN", "salah");
    } catch (err) {
      errorTertangkap = err;
    }

    expect(errorTertangkap).toBeInstanceOf(KesalahanAPI);
  });
});

// ============================================================
// POST /pengguna/saya/ekspor-data — ajukanEksporData (api.md 5.5)
// ============================================================
describe("ajukanEksporData", () => {
  beforeEach(() => {
    mPermintaan.mockReset();
  });

  it("memanggil POST /pengguna/saya/ekspor-data", async () => {
    mPermintaan.mockResolvedValueOnce({
      berhasil: true,
      pesan: "Permintaan ekspor data diterima.",
      data: { status: "memproses" },
    });

    const hasil = await ajukanEksporData();

    expect(mPermintaan).toHaveBeenCalledWith("/pengguna/saya/ekspor-data", {
      method: "POST",
      butuhAuth: true,
    });
    expect(hasil.berhasil).toBe(true);
  });
});

// ============================================================
// GET /pengguna/saya/ekspor-data/status — ambilStatusEkspor (api.md 5.6)
// ============================================================
describe("ambilStatusEkspor", () => {
  beforeEach(() => {
    mGet.mockReset();
  });

  it("memanggil GET /pengguna/saya/ekspor-data/status", async () => {
    mGet.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: { status: "tidak_ada" },
    });

    const hasil = await ambilStatusEkspor();

    expect(mGet).toHaveBeenCalledWith("/pengguna/saya/ekspor-data/status");
    expect(hasil.data.status).toBe("tidak_ada");
  });

  it("mengembalikan status memproses saat ekspor sedang berjalan", async () => {
    mGet.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: { status: "memproses" },
    });

    const hasil = await ambilStatusEkspor();

    expect(hasil.data.status).toBe("memproses");
  });

  it("mengembalikan status selesai beserta tautan unduhan", async () => {
    mGet.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: {
        status: "selesai",
        tautan_unduhan: "https://contoh.id/unduhan/data.zip",
        kedaluwarsa_tautan: "2026-09-15T00:00:00Z",
      },
    });

    const hasil = await ambilStatusEkspor();

    expect(hasil.data.status).toBe("selesai");
  });
});

// ============================================================
// Test validasi schema Zod
// ============================================================
describe("skemaHapusAkun", () => {
  it("valid dengan konfirmasi dan kata sandi terisi", () => {
    const hasil = skemaHapusAkun.safeParse({
      konfirmasi: "HAPUS AKUN",
      kata_sandi: "KataSandi123!",
    });
    expect(hasil.success).toBe(true);
  });

  it("gagal jika konfirmasi kosong", () => {
    const hasil = skemaHapusAkun.safeParse({
      konfirmasi: "",
      kata_sandi: "KataSandi123!",
    });
    expect(hasil.success).toBe(false);
  });

  it("gagal jika kata sandi kosong", () => {
    const hasil = skemaHapusAkun.safeParse({
      konfirmasi: "HAPUS AKUN",
      kata_sandi: "",
    });
    expect(hasil.success).toBe(false);
  });
});
