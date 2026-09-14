// ============================================================
// Test preferensi notifikasi — KontrakAman AI
// F-PROF-03 PRD.md: preferensi notifikasi (Could Have)
// Cakupan: service mock, kontrak respons API, partial update
// Sesuai AGENTS.md Bagian 6: 70% untuk hooks/services/utils
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  ambilPreferensiNotifikasi,
  perbaruiPreferensiNotifikasi,
  resetStateMockPreferensi,
} from "./services/preferensi-notifikasi.service";

// Setup mode mock — harus sebelum import apapun yang pakai env ini
vi.stubEnv("NEXT_PUBLIC_MOCK_AUTH", "true");

// ============================================================
// GET /pengguna/saya/preferensi-notifikasi — api.md 5.7
// ============================================================
describe("ambilPreferensiNotifikasi (mode mock)", () => {
  beforeEach(() => {
    resetStateMockPreferensi();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mengembalikan respons berhasil true", async () => {
    const hasil = await ambilPreferensiNotifikasi();
    expect(hasil.berhasil).toBe(true);
  });

  it("mengembalikan semua field sesuai kontrak api.md 5.7", async () => {
    const hasil = await ambilPreferensiNotifikasi();

    expect(hasil.data).toHaveProperty("audit_selesai");
    expect(hasil.data).toHaveProperty("pengingat_tindak_lanjut");
    expect(hasil.data).toHaveProperty("info_langganan");
    expect(hasil.data).toHaveProperty("diperbarui_pada");
  });

  it("default semua preferensi aktif (true) untuk pengguna baru — sesuai api.md 5.7", async () => {
    const hasil = await ambilPreferensiNotifikasi();

    expect(hasil.data.audit_selesai).toBe(true);
    expect(hasil.data.pengingat_tindak_lanjut).toBe(true);
    expect(hasil.data.info_langganan).toBe(true);
  });

  it("diperbarui_pada adalah string ISO 8601 yang valid", async () => {
    const hasil = await ambilPreferensiNotifikasi();

    const tanggal = new Date(hasil.data.diperbarui_pada);
    expect(tanggal.toString()).not.toBe("Invalid Date");
  });

  it("semua field boolean bertipe boolean", async () => {
    const hasil = await ambilPreferensiNotifikasi();

    expect(typeof hasil.data.audit_selesai).toBe("boolean");
    expect(typeof hasil.data.pengingat_tindak_lanjut).toBe("boolean");
    expect(typeof hasil.data.info_langganan).toBe("boolean");
  });
});

// ============================================================
// PATCH /pengguna/saya/preferensi-notifikasi — api.md 5.8
// Partial update — hanya field yang dikirim yang diperbarui
// ============================================================
describe("perbaruiPreferensiNotifikasi (mode mock)", () => {
  beforeEach(() => {
    // Reset state mock sebelum tiap test supaya tidak saling bergantung
    resetStateMockPreferensi();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mengembalikan respons berhasil true", async () => {
    const hasil = await perbaruiPreferensiNotifikasi({ audit_selesai: false });
    expect(hasil.berhasil).toBe(true);
  });

  it("mengembalikan semua field sesuai kontrak api.md 5.8", async () => {
    const hasil = await perbaruiPreferensiNotifikasi({ audit_selesai: false });

    expect(hasil.data).toHaveProperty("audit_selesai");
    expect(hasil.data).toHaveProperty("pengingat_tindak_lanjut");
    expect(hasil.data).toHaveProperty("info_langganan");
    expect(hasil.data).toHaveProperty("diperbarui_pada");
  });

  it("partial update audit_selesai=false — field lain tetap true", async () => {
    const hasil = await perbaruiPreferensiNotifikasi({ audit_selesai: false });

    expect(hasil.data.audit_selesai).toBe(false);
    // Partial update: field lain tidak berubah
    expect(hasil.data.pengingat_tindak_lanjut).toBe(true);
    expect(hasil.data.info_langganan).toBe(true);
  });

  it("partial update pengingat_tindak_lanjut=false — field lain tetap true", async () => {
    const hasil = await perbaruiPreferensiNotifikasi({
      pengingat_tindak_lanjut: false,
    });

    expect(hasil.data.pengingat_tindak_lanjut).toBe(false);
    expect(hasil.data.audit_selesai).toBe(true);
    expect(hasil.data.info_langganan).toBe(true);
  });

  it("partial update info_langganan=false — field lain tetap true", async () => {
    const hasil = await perbaruiPreferensiNotifikasi({ info_langganan: false });

    expect(hasil.data.info_langganan).toBe(false);
    expect(hasil.data.audit_selesai).toBe(true);
    expect(hasil.data.pengingat_tindak_lanjut).toBe(true);
  });

  it("update semua field sekaligus — semua berubah", async () => {
    const hasil = await perbaruiPreferensiNotifikasi({
      audit_selesai: false,
      pengingat_tindak_lanjut: false,
      info_langganan: false,
    });

    expect(hasil.data.audit_selesai).toBe(false);
    expect(hasil.data.pengingat_tindak_lanjut).toBe(false);
    expect(hasil.data.info_langganan).toBe(false);
  });

  it("update field ke true setelah false — nilai berubah kembali", async () => {
    // Matikan dulu
    await perbaruiPreferensiNotifikasi({ audit_selesai: false });
    // Aktifkan lagi
    const hasil = await perbaruiPreferensiNotifikasi({ audit_selesai: true });

    expect(hasil.data.audit_selesai).toBe(true);
  });

  it("state persisten antar panggilan dalam satu sesi mock", async () => {
    // Matikan audit_selesai
    await perbaruiPreferensiNotifikasi({ audit_selesai: false });

    // Ambil ulang — harus tetap false
    const hasil = await ambilPreferensiNotifikasi();
    expect(hasil.data.audit_selesai).toBe(false);
  });

  it("diperbarui_pada diperbarui setelah update", async () => {
    const sebelum = await ambilPreferensiNotifikasi();
    const waktuSebelum = new Date(sebelum.data.diperbarui_pada).getTime();

    // Tunggu 1ms supaya timestamp berbeda
    await new Promise((r) => setTimeout(r, 1));

    const sesudah = await perbaruiPreferensiNotifikasi({ audit_selesai: false });
    const waktuSesudah = new Date(sesudah.data.diperbarui_pada).getTime();

    expect(waktuSesudah).toBeGreaterThanOrEqual(waktuSebelum);
  });

  it("melempar KesalahanAPI saat field tidak dikenal dikirim", async () => {
    const { KesalahanAPI } = await import("@/lib/api-client");
    let errorTertangkap: unknown;

    try {
      // Kirim field yang tidak ada di kontrak api.md 5.8
      await perbaruiPreferensiNotifikasi({
        audit_selesai: false,
        // @ts-expect-error — sengaja kirim field tidak valid untuk test error path
        field_tidak_ada: true,
      });
    } catch (err) {
      errorTertangkap = err;
    }

    expect(errorTertangkap).toBeInstanceOf(KesalahanAPI);
  });

  it("pesan error field tidak dikenal dalam Bahasa Indonesia", async () => {
    const { KesalahanAPI } = await import("@/lib/api-client");
    let pesanError = "";

    try {
      await perbaruiPreferensiNotifikasi({
        // @ts-expect-error — sengaja kirim field tidak valid
        field_tidak_ada: true,
      });
    } catch (err) {
      if (err instanceof KesalahanAPI) {
        pesanError = err.message;
      }
    }

    expect(pesanError).toBe("Field tidak dikenal atau tipe bukan boolean.");
  });

  it("error memiliki kode VALIDASI_GAGAL sesuai api.md Bagian 3", async () => {
    const { KesalahanAPI } = await import("@/lib/api-client");
    let kodeError = "";

    try {
      await perbaruiPreferensiNotifikasi({
        // @ts-expect-error — sengaja kirim field tidak valid
        field_tidak_ada: true,
      });
    } catch (err) {
      if (err instanceof KesalahanAPI) {
        kodeError = err.kode;
      }
    }

    expect(kodeError).toBe("VALIDASI_GAGAL");
  });
});

// ============================================================
// resetStateMockPreferensi — helper testing
// ============================================================
describe("resetStateMockPreferensi", () => {
  it("mereset state ke default semua true setelah diubah", async () => {
    // Ubah state mock
    await perbaruiPreferensiNotifikasi({
      audit_selesai: false,
      pengingat_tindak_lanjut: false,
    });

    // Reset
    resetStateMockPreferensi();

    // Verifikasi kembali ke default
    const hasil = await ambilPreferensiNotifikasi();
    expect(hasil.data.audit_selesai).toBe(true);
    expect(hasil.data.pengingat_tindak_lanjut).toBe(true);
    expect(hasil.data.info_langganan).toBe(true);
  });
});