// ============================================================
// Test privasi — KontrakAman AI
// Cakupan: service mock, validasi schema Zod
// F-PRIV-03: ekspor data — POST /pengguna/saya/ekspor-data (api.md 5.5)
//                          GET  /pengguna/saya/ekspor-data/status (api.md 5.6)
// F-PRIV-04: hapus akun — DELETE /pengguna/saya (api.md 5.4)
// Sesuai AGENTS.md Bagian 6: 70% untuk hooks/services/utils
// ============================================================

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  hapusAkun,
  ajukanEksporData,
  ambilStatusEkspor,
  resetStateMockEkspor,
} from "./services/privasi.service";
import { skemaHapusAkun, TEKS_KONFIRMASI_HAPUS } from "./types";

vi.stubEnv("NEXT_PUBLIC_MOCK_AUTH", "true");

// ============================================================
// Test service hapus akun (mock)
// ============================================================
describe("hapusAkun service (mode mock)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("berhasil dengan konfirmasi dan kata sandi yang benar", async () => {
    const hasil = await hapusAkun(TEKS_KONFIRMASI_HAPUS, "KataSandiBenar123!");

    expect(hasil.berhasil).toBe(true);
    expect(hasil.data).toHaveProperty("dihapus_pada");
  });

  it("mengembalikan tanggal penghapusan permanen 30 hari dari sekarang", async () => {
    const sebelum = Date.now();
    const hasil = await hapusAkun(TEKS_KONFIRMASI_HAPUS, "KataSandiBenar123!");
    const sesudah = Date.now();

    const tanggalHapus = new Date(hasil.data.dihapus_pada).getTime();
    const tigaPuluhHariMs = 30 * 24 * 60 * 60 * 1000;

    expect(tanggalHapus).toBeGreaterThanOrEqual(sebelum + tigaPuluhHariMs - 1000);
    expect(tanggalHapus).toBeLessThanOrEqual(sesudah + tigaPuluhHariMs + 1000);
  });

  it("melempar KesalahanAPI saat kata sandi salah", async () => {
    const { KesalahanAPI } = await import("@/lib/api-client");
    let errorTertangkap: unknown;

    try {
      await hapusAkun(TEKS_KONFIRMASI_HAPUS, "salah123");
    } catch (err) {
      errorTertangkap = err;
    }

    expect(errorTertangkap).toBeInstanceOf(KesalahanAPI);
  });

  it("pesan error kata sandi salah dalam Bahasa Indonesia", async () => {
    const { KesalahanAPI } = await import("@/lib/api-client");
    let pesanError = "";

    try {
      await hapusAkun(TEKS_KONFIRMASI_HAPUS, "salah123");
    } catch (err) {
      if (err instanceof KesalahanAPI) pesanError = err.message;
    }

    expect(pesanError).toBe("Kata sandi tidak cocok.");
  });

  it("melempar KesalahanAPI saat teks konfirmasi salah", async () => {
    const { KesalahanAPI } = await import("@/lib/api-client");
    let errorTertangkap: unknown;

    try {
      await hapusAkun("TEKS SALAH", "KataSandiBenar123!");
    } catch (err) {
      errorTertangkap = err;
    }

    expect(errorTertangkap).toBeInstanceOf(KesalahanAPI);
  });
});

// ============================================================
// Test service ekspor data (mock)
// F-PRIV-03: POST /pengguna/saya/ekspor-data (api.md 5.5)
//            GET  /pengguna/saya/ekspor-data/status (api.md 5.6)
// ============================================================
describe("ajukanEksporData service (mode mock)", () => {
  beforeEach(() => {
    resetStateMockEkspor();
  });

  it("mengembalikan berhasil true", async () => {
    const hasil = await ajukanEksporData();
    expect(hasil.berhasil).toBe(true);
  });

  it("mengembalikan field wajib sesuai kontrak api.md 5.5", async () => {
    const hasil = await ajukanEksporData();
    expect(hasil.data).toHaveProperty("diminta_pada");
    expect(hasil.data).toHaveProperty("estimasi_selesai_menit");
  });

  it("diminta_pada adalah string ISO 8601 yang valid", async () => {
    const hasil = await ajukanEksporData();
    const tanggal = new Date(hasil.data.diminta_pada);
    expect(tanggal.getTime()).not.toBeNaN();
  });

  it("estimasi_selesai_menit adalah angka positif", async () => {
    const hasil = await ajukanEksporData();
    expect(typeof hasil.data.estimasi_selesai_menit).toBe("number");
    expect(hasil.data.estimasi_selesai_menit).toBeGreaterThan(0);
  });

  it("melempar KesalahanAPI 429 jika permintaan sedang diproses", async () => {
    const { KesalahanAPI } = await import("@/lib/api-client");
    // Ajukan pertama kali
    await ajukanEksporData();

    // Ajukan kedua kali saat masih memproses — harus 429
    let errorTertangkap: unknown;
    try {
      await ajukanEksporData();
    } catch (err) {
      errorTertangkap = err;
    }

    expect(errorTertangkap).toBeInstanceOf(KesalahanAPI);
    if (errorTertangkap instanceof KesalahanAPI) {
      expect(errorTertangkap.statusHttp).toBe(429);
    }
  });

  it("pesan error 429 dalam Bahasa Indonesia", async () => {
    const { KesalahanAPI } = await import("@/lib/api-client");
    await ajukanEksporData();

    let pesanError = "";
    try {
      await ajukanEksporData();
    } catch (err) {
      if (err instanceof KesalahanAPI) pesanError = err.message;
    }

    expect(pesanError).toContain("sedang diproses");
  });
});

describe("ambilStatusEkspor service (mode mock)", () => {
  beforeEach(() => {
    resetStateMockEkspor();
  });

  it("mengembalikan status tidak_ada sebelum permintaan diajukan", async () => {
    const hasil = await ambilStatusEkspor();
    expect(hasil.data.status).toBe("tidak_ada");
    expect(hasil.data.diminta_pada).toBeNull();
    expect(hasil.data.selesai_pada).toBeNull();
  });

  it("mengembalikan field wajib sesuai kontrak api.md 5.6", async () => {
    const hasil = await ambilStatusEkspor();
    expect(hasil.data).toHaveProperty("status");
    expect(hasil.data).toHaveProperty("diminta_pada");
    expect(hasil.data).toHaveProperty("selesai_pada");
  });

  it("status hanya berisi nilai yang valid", async () => {
    const nilaiValid = ["memproses", "selesai", "tidak_ada"];
    const hasil = await ambilStatusEkspor();
    expect(nilaiValid).toContain(hasil.data.status);
  });

  it("mengembalikan status memproses setelah permintaan diajukan", async () => {
    await ajukanEksporData();
    const hasil = await ambilStatusEkspor();
    // Panggilan pertama setelah ajukan masih memproses
    expect(hasil.data.status).toBe("memproses");
    expect(hasil.data.diminta_pada).not.toBeNull();
  });

  it("mengembalikan status selesai setelah polling cukup", async () => {
    await ajukanEksporData();
    // Poll dua kali — mock berubah ke selesai di panggilan ke-2
    await ambilStatusEkspor(); // panggilan 1 — masih memproses
    const hasil = await ambilStatusEkspor(); // panggilan 2 — selesai
    expect(hasil.data.status).toBe("selesai");
    expect(hasil.data.selesai_pada).not.toBeNull();
  });

  it("selesai_pada adalah string ISO 8601 yang valid saat status selesai", async () => {
    await ajukanEksporData();
    await ambilStatusEkspor();
    const hasil = await ambilStatusEkspor();
    if (hasil.data.selesai_pada) {
      const tanggal = new Date(hasil.data.selesai_pada);
      expect(tanggal.getTime()).not.toBeNaN();
    }
  });

  it("resetStateMockEkspor mengembalikan status ke tidak_ada", async () => {
    await ajukanEksporData();
    resetStateMockEkspor();
    const hasil = await ambilStatusEkspor();
    expect(hasil.data.status).toBe("tidak_ada");
  });
});

// ============================================================
// Test validasi schema Zod
// ============================================================
describe("skemaHapusAkun", () => {
  const dataValid = {
    konfirmasi: TEKS_KONFIRMASI_HAPUS,
    kata_sandi: "KataSandiBenar123!",
  };

  it("valid dengan konfirmasi dan kata sandi yang benar", () => {
    const hasil = skemaHapusAkun.safeParse(dataValid);
    expect(hasil.success).toBe(true);
  });

  it("gagal jika konfirmasi tidak sama persis", () => {
    const hasil = skemaHapusAkun.safeParse({
      ...dataValid,
      konfirmasi: "hapus akun saya", // huruf kecil
    });
    expect(hasil.success).toBe(false);
    if (!hasil.success) {
      expect(hasil.error.issues[0].message).toContain(TEKS_KONFIRMASI_HAPUS);
    }
  });

  it("gagal jika konfirmasi kosong", () => {
    const hasil = skemaHapusAkun.safeParse({
      ...dataValid,
      konfirmasi: "",
    });
    expect(hasil.success).toBe(false);
  });

  it("gagal jika kata sandi kosong", () => {
    const hasil = skemaHapusAkun.safeParse({
      ...dataValid,
      kata_sandi: "",
    });
    expect(hasil.success).toBe(false);
    if (!hasil.success) {
      expect(hasil.error.issues[0].message).toBe("Kata sandi tidak boleh kosong");
    }
  });

  it("TEKS_KONFIRMASI_HAPUS adalah string yang tepat", () => {
    expect(TEKS_KONFIRMASI_HAPUS).toBe("HAPUS AKUN SAYA");
  });
});