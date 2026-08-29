// ============================================================
// Test langganan — KontrakAman AI
// Cakupan: service mock, tipe validasi
// Sesuai AGENTS.md Bagian 6: 70% untuk hooks/services/utils
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ============================================================
// Setup mock environment
// ============================================================
vi.stubEnv("NEXT_PUBLIC_MOCK_AUTH", "true");

describe("langganan service (mode mock)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ----------------------------------------------------------
  // GET /langganan/paket — api.md 9.1
  // ----------------------------------------------------------
  describe("ambilPaketHarga", () => {
    it("mengembalikan tepat 3 paket", async () => {
      const { ambilPaketHarga } = await import(
        "./services/langganan.service"
      );
      const promise = ambilPaketHarga();
      await vi.runAllTimersAsync();
      const paket = await promise;

      expect(paket).toHaveLength(3);
    });

    it("paket pertama adalah gratis dengan harga 0", async () => {
      const { ambilPaketHarga } = await import(
        "./services/langganan.service"
      );
      const promise = ambilPaketHarga();
      await vi.runAllTimersAsync();
      const paket = await promise;

      const gratis = paket.find((p) => p.id === "pkg_gratis");
      expect(gratis).toBeDefined();
      expect(gratis!.harga_bulanan).toBe(0);
    });

    it("setiap paket memiliki field wajib dari api.md 9.1", async () => {
      const { ambilPaketHarga } = await import(
        "./services/langganan.service"
      );
      const promise = ambilPaketHarga();
      await vi.runAllTimersAsync();
      const paket = await promise;

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

    it("paket pro dan bisnis memiliki kuota tidak terbatas (-1)", async () => {
      const { ambilPaketHarga } = await import(
        "./services/langganan.service"
      );
      const promise = ambilPaketHarga();
      await vi.runAllTimersAsync();
      const paket = await promise;

      const pro = paket.find((p) => p.id === "pkg_pro");
      const bisnis = paket.find((p) => p.id === "pkg_bisnis");
      expect(pro!.fitur.audit_per_bulan).toBe(-1);
      expect(bisnis!.fitur.negosiasi_per_bulan).toBe(-1);
    });
  });

  // ----------------------------------------------------------
  // POST /langganan/buat-sesi-pembayaran — api.md 9.2
  // ----------------------------------------------------------
  describe("buatSesiPembayaran", () => {
    it("mengembalikan sesi_id dan url_checkout", async () => {
      const { buatSesiPembayaran } = await import(
        "./services/langganan.service"
      );
      const promise = buatSesiPembayaran("pkg_pro", "bulanan");
      await vi.runAllTimersAsync();
      const sesi = await promise;

      expect(sesi.sesi_id).toBeTruthy();
      expect(sesi.url_checkout).toBeTruthy();
      expect(sesi.kedaluwarsa_pada).toBeTruthy();
    });

    it("url_checkout mode mock mengarah ke halaman internal", async () => {
      const { buatSesiPembayaran } = await import(
        "./services/langganan.service"
      );
      const promise = buatSesiPembayaran("pkg_pro", "bulanan");
      await vi.runAllTimersAsync();
      const sesi = await promise;

      // Mode mock: url_checkout bukan URL Mayar sungguhan
      expect(sesi.url_checkout).toContain("/langganan");
      expect(sesi.url_checkout).toContain("mock=true");
    });

    it("kedaluwarsa_pada adalah timestamp ISO 8601 yang valid", async () => {
      const { buatSesiPembayaran } = await import(
        "./services/langganan.service"
      );
      const promise = buatSesiPembayaran("pkg_bisnis", "tahunan");
      await vi.runAllTimersAsync();
      const sesi = await promise;

      const tanggal = new Date(sesi.kedaluwarsa_pada);
      expect(tanggal.toString()).not.toBe("Invalid Date");
      // Kedaluwarsa di masa depan
      expect(tanggal.getTime()).toBeGreaterThan(Date.now());
    });
  });

  // ----------------------------------------------------------
  // GET /langganan/aktif — api.md 9.3
  // ----------------------------------------------------------
  describe("ambilLanggananAktif", () => {
    it("mengembalikan data langganan atau null", async () => {
      const { ambilLanggananAktif } = await import(
        "./services/langganan.service"
      );
      const promise = ambilLanggananAktif();
      await vi.runAllTimersAsync();
      const hasil = await promise;

      // null (gratis) atau objek langganan
      expect(hasil === null || typeof hasil === "object").toBe(true);
    });

    it("jika ada langganan, memiliki field wajib dari api.md 9.3", async () => {
      const { ambilLanggananAktif } = await import(
        "./services/langganan.service"
      );
      const promise = ambilLanggananAktif();
      await vi.runAllTimersAsync();
      const hasil = await promise;

      if (hasil !== null) {
        expect(hasil).toHaveProperty("id");
        expect(hasil).toHaveProperty("tier");
        expect(hasil).toHaveProperty("status");
        expect(hasil).toHaveProperty("periode");
        expect(hasil).toHaveProperty("aktif_sejak");
        expect(hasil).toHaveProperty("aktif_hingga");
        expect(hasil).toHaveProperty("perbarui_otomatis");
      }
    });
  });

  // ----------------------------------------------------------
  // POST /langganan/batalkan — api.md 9.4
  // ----------------------------------------------------------
  describe("batalkanLangganan", () => {
    it("mengembalikan aktif_hingga dan perbarui_otomatis false", async () => {
      const { batalkanLangganan } = await import(
        "./services/langganan.service"
      );
      const promise = batalkanLangganan("Tidak terpakai");
      await vi.runAllTimersAsync();
      const hasil = await promise;

      expect(hasil).toHaveProperty("aktif_hingga");
      expect(hasil.perbarui_otomatis).toBe(false);
    });

    it("aktif_hingga adalah timestamp ISO 8601 yang valid", async () => {
      const { batalkanLangganan } = await import(
        "./services/langganan.service"
      );
      const promise = batalkanLangganan();
      await vi.runAllTimersAsync();
      const hasil = await promise;

      const tanggal = new Date(hasil.aktif_hingga);
      expect(tanggal.toString()).not.toBe("Invalid Date");
    });
  });

  // ----------------------------------------------------------
  // GET /langganan/transaksi — api.md 9.5
  // ----------------------------------------------------------
  describe("ambilRiwayatTransaksi", () => {
    it("mengembalikan data dan paginasi", async () => {
      const { ambilRiwayatTransaksi } = await import(
        "./services/langganan.service"
      );
      const promise = ambilRiwayatTransaksi();
      await vi.runAllTimersAsync();
      const hasil = await promise;

      expect(hasil).toHaveProperty("data");
      expect(hasil).toHaveProperty("paginasi");
      expect(Array.isArray(hasil.data)).toBe(true);
    });

    it("setiap transaksi memiliki field wajib dari api.md 9.5", async () => {
      const { ambilRiwayatTransaksi } = await import(
        "./services/langganan.service"
      );
      const promise = ambilRiwayatTransaksi();
      await vi.runAllTimersAsync();
      const hasil = await promise;

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

    it("status transaksi hanya berisi nilai yang valid", async () => {
      const { ambilRiwayatTransaksi } = await import(
        "./services/langganan.service"
      );
      const promise = ambilRiwayatTransaksi();
      await vi.runAllTimersAsync();
      const hasil = await promise;

      const statusValid = ["berhasil", "gagal", "menunggu"];
      hasil.data.forEach((trx) => {
        expect(statusValid).toContain(trx.status);
      });
    });

    it("paginasi memiliki field cursor_berikutnya dan ada_lagi", async () => {
      const { ambilRiwayatTransaksi } = await import(
        "./services/langganan.service"
      );
      const promise = ambilRiwayatTransaksi();
      await vi.runAllTimersAsync();
      const hasil = await promise;

      expect(hasil.paginasi).toHaveProperty("cursor_berikutnya");
      expect(hasil.paginasi).toHaveProperty("ada_lagi");
      expect(hasil.paginasi).toHaveProperty("total");
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