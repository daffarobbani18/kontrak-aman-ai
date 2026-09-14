import { describe, it, expect } from "vitest";
import {
  skemaMasuk,
  skemaDaftar,
  skemaLupaKataSandi,
  skemaResetKataSandi,
} from "@/features/autentikasi/types";

// ============================================================
// Unit test untuk Zod schema autentikasi
// Sesuai AGENTS.md Bagian 6 — cakupan minimum 70% hooks/services/utils
// ============================================================

describe("skemaMasuk", () => {
  it("lolos validasi dengan data yang valid", () => {
    const hasil = skemaMasuk.safeParse({
      email: "budi@example.com",
      kata_sandi: "P@ssw0rd!Aman",
    });
    expect(hasil.success).toBe(true);
  });

  it("gagal validasi jika email tidak valid", () => {
    const hasil = skemaMasuk.safeParse({
      email: "bukan-email",
      kata_sandi: "P@ssw0rd!Aman",
    });
    expect(hasil.success).toBe(false);
    if (!hasil.success) {
      expect(hasil.error.issues[0].message).toBe("Format email tidak valid");
    }
  });

  it("gagal validasi jika email kosong", () => {
    const hasil = skemaMasuk.safeParse({ email: "", kata_sandi: "P@ssw0rd!" });
    expect(hasil.success).toBe(false);
  });

  it("gagal validasi jika kata sandi kosong", () => {
    const hasil = skemaMasuk.safeParse({
      email: "budi@example.com",
      kata_sandi: "",
    });
    expect(hasil.success).toBe(false);
  });
});

describe("skemaDaftar", () => {
  const dataValid = {
    nama_lengkap: "Budi Santoso",
    email: "budi@example.com",
    kata_sandi: "P@ssw0rd!Aman",
    konfirmasi_kata_sandi: "P@ssw0rd!Aman",
    setuju_kebijakan_privasi: true,
  };

  it("lolos validasi dengan data yang valid", () => {
    const hasil = skemaDaftar.safeParse(dataValid);
    expect(hasil.success).toBe(true);
  });

  it("gagal validasi jika nama terlalu pendek", () => {
    const hasil = skemaDaftar.safeParse({ ...dataValid, nama_lengkap: "A" });
    expect(hasil.success).toBe(false);
    if (!hasil.success) {
      expect(hasil.error.issues[0].message).toBe("Nama lengkap minimal 2 karakter");
    }
  });

  it("gagal validasi jika kata sandi tidak mengandung huruf besar", () => {
    const hasil = skemaDaftar.safeParse({
      ...dataValid,
      kata_sandi: "p@ssw0rd!aman",
      konfirmasi_kata_sandi: "p@ssw0rd!aman",
    });
    expect(hasil.success).toBe(false);
    if (!hasil.success) {
      expect(hasil.error.issues[0].message).toBe(
        "Kata sandi harus mengandung minimal 1 huruf besar"
      );
    }
  });

  it("gagal validasi jika konfirmasi kata sandi tidak cocok", () => {
    const hasil = skemaDaftar.safeParse({
      ...dataValid,
      konfirmasi_kata_sandi: "BerbedaSama!",
    });
    expect(hasil.success).toBe(false);
    if (!hasil.success) {
      expect(hasil.error.issues[0].message).toBe("Konfirmasi kata sandi tidak cocok");
    }
  });

  it("gagal validasi jika kebijakan privasi tidak disetujui", () => {
    const hasil = skemaDaftar.safeParse({
      ...dataValid,
      setuju_kebijakan_privasi: false,
    });
    expect(hasil.success).toBe(false);
    if (!hasil.success) {
      expect(hasil.error.issues[0].message).toBe(
        "Kamu harus menyetujui kebijakan privasi untuk melanjutkan"
      );
    }
  });
});

describe("skemaLupaKataSandi", () => {
  it("lolos validasi dengan email yang valid", () => {
    const hasil = skemaLupaKataSandi.safeParse({ email: "budi@example.com" });
    expect(hasil.success).toBe(true);
  });

  it("gagal validasi jika email tidak valid", () => {
    const hasil = skemaLupaKataSandi.safeParse({ email: "bukan-email" });
    expect(hasil.success).toBe(false);
  });
});

describe("skemaResetKataSandi", () => {
  const dataValid = {
    token: "abc123resettoken",
    kata_sandi_baru: "P@ssw0rdBaru!123",
    konfirmasi_kata_sandi_baru: "P@ssw0rdBaru!123",
  };

  it("lolos validasi dengan data yang valid", () => {
    const hasil = skemaResetKataSandi.safeParse(dataValid);
    expect(hasil.success).toBe(true);
  });

  it("gagal validasi jika token kosong", () => {
    const hasil = skemaResetKataSandi.safeParse({ ...dataValid, token: "" });
    expect(hasil.success).toBe(false);
  });

  it("gagal validasi jika konfirmasi tidak cocok", () => {
    const hasil = skemaResetKataSandi.safeParse({
      ...dataValid,
      konfirmasi_kata_sandi_baru: "BerbedaSekali!",
    });
    expect(hasil.success).toBe(false);
    if (!hasil.success) {
      expect(hasil.error.issues[0].message).toBe("Konfirmasi kata sandi tidak cocok");
    }
  });
});
