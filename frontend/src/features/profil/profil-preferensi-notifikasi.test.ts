// ============================================================
// Test preferensi notifikasi — KontrakAman AI
// F-PROF-03 PRD.md: preferensi notifikasi (Could Have)
// Cakupan: service via mock apiClient (GET/PATCH api.md 5.7–5.8)
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ambilPreferensiNotifikasi,
  perbaruiPreferensiNotifikasi,
} from "./services/preferensi-notifikasi.service";
import { apiClient } from "@/lib/api-client";

// Mock apiClient di boundary — service tidak melakukan fetch sungguhan
vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  apiClient: (await import("@/test/api-client-mock")).buatApiClientMock(),
}));

const mGet = vi.mocked(apiClient.get);
const mPatch = vi.mocked(apiClient.patch);

// Fixture respons API sesuai api.md 5.7
const PREFERENSI_FIKTIF = {
  audit_selesai: true,
  pengingat_tindak_lanjut: true,
  info_langganan: true,
  diperbarui_pada: "2026-08-01T09:00:00Z",
};

// ============================================================
// GET /pengguna/saya/preferensi-notifikasi — api.md 5.7
// ============================================================
describe("ambilPreferensiNotifikasi", () => {
  beforeEach(() => {
    mGet.mockReset();
  });

  it("memanggil GET /pengguna/saya/preferensi-notifikasi", async () => {
    mGet.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: PREFERENSI_FIKTIF,
    });

    await ambilPreferensiNotifikasi();

    expect(mGet).toHaveBeenCalledWith(
      "/pengguna/saya/preferensi-notifikasi",
      true
    );
  });

  it("mengembalikan semua field sesuai kontrak api.md 5.7", async () => {
    mGet.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: PREFERENSI_FIKTIF,
    });

    const hasil = await ambilPreferensiNotifikasi();

    expect(hasil.berhasil).toBe(true);
    expect(hasil.data).toHaveProperty("audit_selesai");
    expect(hasil.data).toHaveProperty("pengingat_tindak_lanjut");
    expect(hasil.data).toHaveProperty("info_langganan");
    expect(hasil.data).toHaveProperty("diperbarui_pada");
  });

  it("diperbarui_pada adalah string ISO 8601 yang valid", async () => {
    mGet.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: PREFERENSI_FIKTIF,
    });

    const hasil = await ambilPreferensiNotifikasi();

    const tanggal = new Date(hasil.data.diperbarui_pada);
    expect(tanggal.toString()).not.toBe("Invalid Date");
  });
});

// ============================================================
// PATCH /pengguna/saya/preferensi-notifikasi — api.md 5.8
// Partial update — hanya field yang dikirim yang diperbarui
// ============================================================
describe("perbaruiPreferensiNotifikasi", () => {
  beforeEach(() => {
    mPatch.mockReset();
  });

  it("memanggil PATCH /pengguna/saya/preferensi-notifikasi dengan payload", async () => {
    mPatch.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: { ...PREFERENSI_FIKTIF, audit_selesai: false },
    });

    await perbaruiPreferensiNotifikasi({ audit_selesai: false });

    expect(mPatch).toHaveBeenCalledWith(
      "/pengguna/saya/preferensi-notifikasi",
      { audit_selesai: false },
      true
    );
  });

  it("partial update satu field — respons berisi field yang diubah", async () => {
    mPatch.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: { ...PREFERENSI_FIKTIF, audit_selesai: false },
    });

    const hasil = await perbaruiPreferensiNotifikasi({ audit_selesai: false });

    expect(hasil.berhasil).toBe(true);
    expect(hasil.data.audit_selesai).toBe(false);
  });

  it("update semua field sekaligus — semua berubah", async () => {
    mPatch.mockResolvedValueOnce({
      berhasil: true,
      pesan: "OK",
      data: {
        audit_selesai: false,
        pengingat_tindak_lanjut: false,
        info_langganan: false,
        diperbarui_pada: "2026-08-01T10:00:00Z",
      },
    });

    const hasil = await perbaruiPreferensiNotifikasi({
      audit_selesai: false,
      pengingat_tindak_lanjut: false,
      info_langganan: false,
    });

    expect(hasil.data.audit_selesai).toBe(false);
    expect(hasil.data.pengingat_tindak_lanjut).toBe(false);
    expect(hasil.data.info_langganan).toBe(false);
  });

  it("melempar KesalahanAPI dengan kode VALIDASI_GAGAL saat backend menolak field tidak dikenal", async () => {
    const { KesalahanAPI } = await import("@/lib/api-client");
    mPatch.mockRejectedValueOnce(
      new KesalahanAPI(
        "Field tidak dikenal atau tipe bukan boolean.",
        "VALIDASI_GAGAL",
        400
      )
    );

    let kodeError = "";
    let pesanError = "";
    try {
      await perbaruiPreferensiNotifikasi({
        // @ts-expect-error — sengaja kirim field tidak valid untuk test error path
        field_tidak_ada: true,
      });
    } catch (err) {
      if (err instanceof KesalahanAPI) {
        kodeError = err.kode;
        pesanError = err.message;
      }
    }

    expect(kodeError).toBe("VALIDASI_GAGAL");
    expect(pesanError).toBe("Field tidak dikenal atau tipe bukan boolean.");
  });
});
