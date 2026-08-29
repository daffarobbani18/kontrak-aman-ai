// ============================================================
// Test profil — KontrakAman AI
// Cakupan: service mock, validasi schema Zod
// Sesuai AGENTS.md Bagian 6: 70% untuk hooks/services/utils
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  perbaruhiProfil,
  ubahKataSandi,
  simpanOnboarding,
  resetStateMockProfil,
} from "./services/profil.service";
import { skemaEditProfil, skemaUbahKataSandi } from "./types";

// ============================================================
// Setup mock environment
// ============================================================
vi.stubEnv("NEXT_PUBLIC_MOCK_AUTH", "true");

describe("profil service (mode mock)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ----------------------------------------------------------
  // PATCH /pengguna/saya — perbaruhiProfil
  // ----------------------------------------------------------
  it("perbaruhiProfil mengembalikan profil yang diperbarui", async () => {
    const hasil = await perbaruhiProfil("Rani Desainer Baru");

    expect(hasil.berhasil).toBe(true);
    expect(hasil.data.nama_lengkap).toBe("Rani Desainer Baru");
  });

  it("perbaruhiProfil mengembalikan field wajib dari api.md 5.2", async () => {
    const hasil = await perbaruhiProfil("Bima Programmer");

    expect(hasil.data).toHaveProperty("id");
    expect(hasil.data).toHaveProperty("nama_lengkap");
    expect(hasil.data).toHaveProperty("email");
    expect(hasil.data).toHaveProperty("avatar_url");
  });

  it("perbaruhiProfil menyimpan nama baru yang diberikan", async () => {
    const namaBaru = "Sari Penulis Content";
    const hasil = await perbaruhiProfil(namaBaru);

    expect(hasil.data.nama_lengkap).toBe(namaBaru);
  });

  // ----------------------------------------------------------
  // POST /pengguna/saya/ubah-kata-sandi — ubahKataSandi
  // ----------------------------------------------------------
  it("ubahKataSandi berhasil dengan kata sandi lama yang benar", async () => {
    const hasil = await ubahKataSandi("KataSandiBenar123!", "KataSandiBaru456@", "KataSandiBaru456@");

    expect(hasil.berhasil).toBe(true);
    expect(hasil.data).toBeNull();
  });

  it("ubahKataSandi melempar error saat kata sandi lama salah", async () => {
    const { KesalahanAPI } = await import("@/lib/api-client");
    let errorTertangkap: unknown;

    try {
      await ubahKataSandi("salah123", "KataSandiBaru456@", "KataSandiBaru456@");
    } catch (err) {
      errorTertangkap = err;
    }

    expect(errorTertangkap).toBeInstanceOf(KesalahanAPI);
  });

  it("ubahKataSandi error memiliki pesan yang jelas dalam Bahasa Indonesia", async () => {
    const { KesalahanAPI } = await import("@/lib/api-client");
    let pesanError = "";

    try {
      await ubahKataSandi("salah123", "KataSandiBaru456@", "KataSandiBaru456@");
    } catch (err) {
      if (err instanceof KesalahanAPI) {
        pesanError = err.message;
      }
    }

    expect(pesanError).toBe("Kata sandi lama tidak cocok.");
  });
});

// ============================================================
// PATCH /pengguna/saya — simpanOnboarding (api.md 5.2)
// Field profesi + onboarding_selesai — F-PROF-01 PRD.md
// ============================================================
describe("simpanOnboarding (mode mock)", () => {
  beforeEach(() => {
    resetStateMockProfil();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("berhasil simpan dengan profesi yang dipilih", async () => {
    const hasil = await simpanOnboarding("desainer");
    expect(hasil.berhasil).toBe(true);
  });

  it("mengembalikan field wajib sesuai kontrak api.md 5.2", async () => {
    const hasil = await simpanOnboarding("programmer");

    expect(hasil.data).toHaveProperty("id");
    expect(hasil.data).toHaveProperty("nama_lengkap");
    expect(hasil.data).toHaveProperty("email");
    expect(hasil.data).toHaveProperty("avatar_url");
    expect(hasil.data).toHaveProperty("profesi");
    expect(hasil.data).toHaveProperty("onboarding_selesai");
  });

  it("menyimpan profesi yang dikirim ke respons", async () => {
    const hasil = await simpanOnboarding("penulis");
    expect(hasil.data.profesi).toBe("penulis");
  });

  it("onboarding_selesai selalu true setelah simpan", async () => {
    const hasil = await simpanOnboarding("desainer");
    expect(hasil.data.onboarding_selesai).toBe(true);
  });

  it("berhasil lewati tanpa profesi — profesi null", async () => {
    const hasil = await simpanOnboarding(null);
    expect(hasil.berhasil).toBe(true);
    expect(hasil.data.onboarding_selesai).toBe(true);
  });

  it("lewati tanpa profesi — profesi tetap null di respons", async () => {
    const hasil = await simpanOnboarding(null);
    expect(hasil.data.profesi).toBeNull();
  });

  it("semua nilai profesi yang valid diterima", async () => {
    const nilaiValid = ["desainer", "penulis", "programmer", "lainnya"] as const;

    for (const nilai of nilaiValid) {
      resetStateMockProfil();
      const hasil = await simpanOnboarding(nilai);
      expect(hasil.data.profesi).toBe(nilai);
    }
  });

  it("state mock persisten — profesi tersimpan untuk panggilan berikutnya", async () => {
    await simpanOnboarding("programmer");
    // Panggil perbaruhiProfil setelah simpanOnboarding
    // profesi harus tetap sesuai yang disimpan saat onboarding
    const hasil = await perbaruhiProfil("Nama Baru");
    expect(hasil.data.profesi).toBe("programmer");
  });

  it("resetStateMockProfil mengembalikan profesi ke null", async () => {
    await simpanOnboarding("desainer");
    resetStateMockProfil();
    // Setelah reset, profil.service mock kembali ke state awal
    const hasil = await perbaruhiProfil("Test");
    expect(hasil.data.profesi).toBeNull();
  });
});

// ============================================================
// Test validasi schema Zod
// ============================================================
describe("skemaEditProfil", () => {
  it("valid dengan nama minimal 2 karakter", () => {
    const hasil = skemaEditProfil.safeParse({ nama_lengkap: "Bu" });
    expect(hasil.success).toBe(true);
  });

  it("valid dengan nama lengkap biasa", () => {
    const hasil = skemaEditProfil.safeParse({ nama_lengkap: "Rani Desainer" });
    expect(hasil.success).toBe(true);
  });

  it("gagal dengan nama kurang dari 2 karakter", () => {
    const hasil = skemaEditProfil.safeParse({ nama_lengkap: "R" });
    expect(hasil.success).toBe(false);
    if (!hasil.success) {
      expect(hasil.error.issues[0].message).toBe("Nama lengkap minimal 2 karakter");
    }
  });

  it("gagal dengan nama kosong", () => {
    const hasil = skemaEditProfil.safeParse({ nama_lengkap: "" });
    expect(hasil.success).toBe(false);
  });

  it("gagal dengan nama lebih dari 100 karakter", () => {
    const hasil = skemaEditProfil.safeParse({ nama_lengkap: "A".repeat(101) });
    expect(hasil.success).toBe(false);
    if (!hasil.success) {
      expect(hasil.error.issues[0].message).toBe("Nama lengkap maksimal 100 karakter");
    }
  });
});

describe("skemaUbahKataSandi", () => {
  const dataValid = {
    kata_sandi_lama: "LamaBanget123!",
    kata_sandi_baru: "BaruBanget456@",
    konfirmasi_kata_sandi_baru: "BaruBanget456@",
  };

  it("valid dengan data yang benar", () => {
    const hasil = skemaUbahKataSandi.safeParse(dataValid);
    expect(hasil.success).toBe(true);
  });

  it("gagal jika kata sandi baru kurang dari 8 karakter", () => {
    const hasil = skemaUbahKataSandi.safeParse({
      ...dataValid,
      kata_sandi_baru: "Ab1!",
      konfirmasi_kata_sandi_baru: "Ab1!",
    });
    expect(hasil.success).toBe(false);
    if (!hasil.success) {
      expect(hasil.error.issues[0].message).toBe("Kata sandi minimal 8 karakter");
    }
  });

  it("gagal jika tidak ada huruf besar", () => {
    const hasil = skemaUbahKataSandi.safeParse({
      ...dataValid,
      kata_sandi_baru: "tanpahurufbesar123!",
      konfirmasi_kata_sandi_baru: "tanpahurufbesar123!",
    });
    expect(hasil.success).toBe(false);
  });

  it("gagal jika tidak ada angka", () => {
    const hasil = skemaUbahKataSandi.safeParse({
      ...dataValid,
      kata_sandi_baru: "TanpaAngkaBanget!",
      konfirmasi_kata_sandi_baru: "TanpaAngkaBanget!",
    });
    expect(hasil.success).toBe(false);
  });

  it("gagal jika tidak ada simbol", () => {
    const hasil = skemaUbahKataSandi.safeParse({
      ...dataValid,
      kata_sandi_baru: "TanpaSimbol123",
      konfirmasi_kata_sandi_baru: "TanpaSimbol123",
    });
    expect(hasil.success).toBe(false);
  });

  it("gagal jika konfirmasi tidak cocok", () => {
    const hasil = skemaUbahKataSandi.safeParse({
      ...dataValid,
      konfirmasi_kata_sandi_baru: "BerbedaBanget456@",
    });
    expect(hasil.success).toBe(false);
    if (!hasil.success) {
      expect(hasil.error.issues[0].message).toBe("Konfirmasi kata sandi tidak cocok");
    }
  });

  it("gagal jika kata sandi lama kosong", () => {
    const hasil = skemaUbahKataSandi.safeParse({
      ...dataValid,
      kata_sandi_lama: "",
    });
    expect(hasil.success).toBe(false);
    if (!hasil.success) {
      expect(hasil.error.issues[0].message).toBe("Kata sandi lama tidak boleh kosong");
    }
  });
});