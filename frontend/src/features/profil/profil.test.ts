// ============================================================
// Test profil — KontrakAman AI
// Cakupan: service (via mock apiClient), validasi schema Zod
// Sesuai AGENTS.md Bagian 6: 70% untuk hooks/services/utils
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  perbaruhiProfil,
  ubahKataSandi,
  simpanOnboarding,
} from "./services/profil.service";
import { skemaEditProfil, skemaUbahKataSandi } from "./types";
import { apiClient } from "@/lib/api-client";

// Mock apiClient di boundary — service tidak melakukan fetch sungguhan
vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  apiClient: (await import("@/test/api-client-mock")).buatApiClientMock(),
}));

const mPatch = vi.mocked(apiClient.patch);
const mPost = vi.mocked(apiClient.post);

// Fixture respons API profil sesuai api.md 5.2
const PROFIL_FIKTIF = {
  id: "usr_001",
  nama_lengkap: "Rani Desainer",
  email: "rani@contoh.id",
  avatar_url: null,
  profesi: null,
  onboarding_selesai: false,
  dibuat_pada: "2026-08-01T09:00:00Z",
};

// ============================================================
// PATCH /pengguna/saya — perbaruhiProfil
// ============================================================
describe("perbaruhiProfil", () => {
  beforeEach(() => {
    mPatch.mockReset();
  });

  it("memanggil PATCH /pengguna/saya dengan nama_lengkap", async () => {
    mPatch.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: { ...PROFIL_FIKTIF, nama_lengkap: "Rani Desainer Baru" },
    });

    const hasil = await perbaruhiProfil("Rani Desainer Baru");

    expect(mPatch).toHaveBeenCalledWith(
      "/pengguna/saya",
      { nama_lengkap: "Rani Desainer Baru" },
      true
    );
    expect(hasil.berhasil).toBe(true);
    expect(hasil.data.nama_lengkap).toBe("Rani Desainer Baru");
  });

  it("mengembalikan field wajib dari api.md 5.2", async () => {
    mPatch.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: { ...PROFIL_FIKTIF, nama_lengkap: "Bima Programmer" },
    });

    const hasil = await perbaruhiProfil("Bima Programmer");

    expect(hasil.data).toHaveProperty("id");
    expect(hasil.data).toHaveProperty("nama_lengkap");
    expect(hasil.data).toHaveProperty("email");
    expect(hasil.data).toHaveProperty("avatar_url");
  });

  it("menyimpan nama baru yang diberikan", async () => {
    const namaBaru = "Sari Penulis Content";
    mPatch.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: { ...PROFIL_FIKTIF, nama_lengkap: namaBaru },
    });

    const hasil = await perbaruhiProfil(namaBaru);

    expect(hasil.data.nama_lengkap).toBe(namaBaru);
  });
});

// ============================================================
// PATCH /pengguna/saya — simpanOnboarding (api.md 5.2)
// Field profesi + onboarding_selesai — F-PROF-01 PRD.md
// ============================================================
describe("simpanOnboarding", () => {
  beforeEach(() => {
    mPatch.mockReset();
  });

  it("mengirim profesi + onboarding_selesai saat profesi dipilih", async () => {
    mPatch.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: { ...PROFIL_FIKTIF, profesi: "desainer", onboarding_selesai: true },
    });

    await simpanOnboarding("desainer");

    expect(mPatch).toHaveBeenCalledWith(
      "/pengguna/saya",
      { onboarding_selesai: true, profesi: "desainer" },
      true
    );
  });

  it("hanya mengirim onboarding_selesai saat lewati (profesi null)", async () => {
    mPatch.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: { ...PROFIL_FIKTIF, profesi: null, onboarding_selesai: true },
    });

    const hasil = await simpanOnboarding(null);

    expect(mPatch).toHaveBeenCalledWith(
      "/pengguna/saya",
      { onboarding_selesai: true },
      true
    );
    expect(hasil.data.onboarding_selesai).toBe(true);
  });

  it("mengembalikan field wajib sesuai kontrak api.md 5.2", async () => {
    mPatch.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: { ...PROFIL_FIKTIF, profesi: "programmer", onboarding_selesai: true },
    });

    const hasil = await simpanOnboarding("programmer");

    expect(hasil.data).toHaveProperty("id");
    expect(hasil.data).toHaveProperty("nama_lengkap");
    expect(hasil.data).toHaveProperty("email");
    expect(hasil.data).toHaveProperty("avatar_url");
    expect(hasil.data).toHaveProperty("profesi");
    expect(hasil.data).toHaveProperty("onboarding_selesai");
  });

  it("menyimpan profesi yang dikirim ke respons", async () => {
    mPatch.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: { ...PROFIL_FIKTIF, profesi: "penulis", onboarding_selesai: true },
    });

    const hasil = await simpanOnboarding("penulis");

    expect(hasil.data.profesi).toBe("penulis");
  });

  it("semua nilai profesi yang valid diterima", async () => {
    const nilaiValid = ["desainer", "penulis", "programmer", "lainnya"] as const;

    for (const nilai of nilaiValid) {
      mPatch.mockReset();
      mPatch.mockResolvedValueOnce({
        berhasil: true,
        pesan: "OK",
        data: { ...PROFIL_FIKTIF, profesi: nilai, onboarding_selesai: true },
      });

      await simpanOnboarding(nilai);
      expect(mPatch).toHaveBeenCalledWith(
        "/pengguna/saya",
        { onboarding_selesai: true, profesi: nilai },
        true
      );
    }
  });
});

// ============================================================
// POST /pengguna/saya/ubah-kata-sandi — ubahKataSandi
// ============================================================
describe("ubahKataSandi", () => {
  beforeEach(() => {
    mPost.mockReset();
  });

  it("memanggil POST /pengguna/saya/ubah-kata-sandi dengan payload lengkap", async () => {
    mPost.mockResolvedValueOnce({ berhasil: true, pesan: "OK", data: null });

    const hasil = await ubahKataSandi(
      "KataSandiBenar123!",
      "KataSandiBaru456@",
      "KataSandiBaru456@"
    );

    expect(mPost).toHaveBeenCalledWith(
      "/pengguna/saya/ubah-kata-sandi",
      {
        kata_sandi_lama: "KataSandiBenar123!",
        kata_sandi_baru: "KataSandiBaru456@",
        konfirmasi_kata_sandi_baru: "KataSandiBaru456@",
      },
      true
    );
    expect(hasil.berhasil).toBe(true);
    expect(hasil.data).toBeNull();
  });

  it("melempar KesalahanAPI saat backend menolak (kata sandi lama salah)", async () => {
    const { KesalahanAPI } = await import("@/lib/api-client");
    mPost.mockRejectedValueOnce(
      new KesalahanAPI("Kata sandi lama tidak cocok.", "VALIDASI_GAGAL", 400)
    );

    let errorTertangkap: unknown;
    try {
      await ubahKataSandi("salah123", "KataSandiBaru456@", "KataSandiBaru456@");
    } catch (err) {
      errorTertangkap = err;
    }

    expect(errorTertangkap).toBeInstanceOf(KesalahanAPI);
  });

  it("error memiliki pesan yang jelas dalam Bahasa Indonesia", async () => {
    const { KesalahanAPI } = await import("@/lib/api-client");
    mPost.mockRejectedValueOnce(
      new KesalahanAPI("Kata sandi lama tidak cocok.", "VALIDASI_GAGAL", 400)
    );

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
