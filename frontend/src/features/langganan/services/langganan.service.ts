// ============================================================
// Service langganan — KontrakAman AI
// Menangani:
//   GET  /langganan/paket               (api.md 9.1)
//   POST /langganan/buat-sesi-pembayaran (api.md 9.2)
//   GET  /langganan/aktif               (api.md 9.3)
//   POST /langganan/batalkan            (api.md 9.4)
//   GET  /langganan/transaksi           (api.md 9.5)
// Mock-aware: env dibaca dinamis supaya vi.stubEnv() di test bekerja
// ============================================================

import { apiClient } from "@/lib/api-client";
import type {
  PaketHarga,
  ResponsBuatSesiPembayaran,
  LanggananAktif,
  HasilBatalkanLangganan,
  ItemTransaksi,
} from "../types";
import type { DataPaginasi } from "@/features/dashboard/types";
import type { ResponsAPI } from "@/features/autentikasi/types";

function pakaiMock(): boolean {
  return process.env.NEXT_PUBLIC_MOCK_AUTH === "true";
}

function tundaMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================
// GET /langganan/paket — api.md 9.1
// Publik — tidak butuh auth
// ============================================================
export async function ambilPaketHarga(): Promise<PaketHarga[]> {
  if (pakaiMock()) return mockAmbilPaketHarga();

  const respons = await apiClient.get<PaketHarga[]>("/langganan/paket", false);
  return respons.data as PaketHarga[];
}

// ============================================================
// POST /langganan/buat-sesi-pembayaran — api.md 9.2
// Mengembalikan url_checkout Mayar — frontend redirect ke sana
// ============================================================
export async function buatSesiPembayaran(
  paketId: string,
  periode: "bulanan" | "tahunan"
): Promise<ResponsBuatSesiPembayaran> {
  if (pakaiMock()) return mockBuatSesiPembayaran(paketId, periode);

  const respons = await apiClient.post<ResponsBuatSesiPembayaran>(
    "/langganan/buat-sesi-pembayaran",
    { paket_id: paketId, periode },
    true
  );
  return respons.data as ResponsBuatSesiPembayaran;
}

// ============================================================
// GET /langganan/aktif — api.md 9.3
// Mengembalikan null jika tidak ada langganan aktif (tier gratis)
// ============================================================
export async function ambilLanggananAktif(): Promise<LanggananAktif | null> {
  if (pakaiMock()) return mockAmbilLanggananAktif();

  const respons = await apiClient.get<LanggananAktif | null>(
    "/langganan/aktif",
    true
  );
  return respons.data ?? null;
}

// ============================================================
// POST /langganan/batalkan — api.md 9.4
// Langganan tetap aktif hingga akhir periode yang sudah dibayar
// ============================================================
export async function batalkanLangganan(
  alasan?: string
): Promise<HasilBatalkanLangganan> {
  if (pakaiMock()) return mockBatalkanLangganan();

  const respons = await apiClient.post<HasilBatalkanLangganan>(
    "/langganan/batalkan",
    { alasan: alasan ?? "" },
    true
  );
  return respons.data as HasilBatalkanLangganan;
}

// ============================================================
// GET /langganan/transaksi — api.md 9.5
// Paginasi cursor-based sesuai api.md Bagian 1
// ============================================================
export async function ambilRiwayatTransaksi(opsi?: {
  limit?: number;
  cursor?: string;
}): Promise<{ data: ItemTransaksi[]; paginasi: DataPaginasi }> {
  if (pakaiMock()) return mockAmbilRiwayatTransaksi();

  const params = new URLSearchParams();
  if (opsi?.limit) params.set("limit", String(opsi.limit));
  if (opsi?.cursor) params.set("cursor", opsi.cursor);

  const url = `/langganan/transaksi${params.toString() ? `?${params}` : ""}`;
  const respons = await apiClient.get<ItemTransaksi[]>(url, true) as
    ResponsAPI<ItemTransaksi[]> & { paginasi: DataPaginasi };

  return {
    data: respons.data as ItemTransaksi[],
    paginasi: respons.paginasi ?? {
      cursor_berikutnya: null,
      ada_lagi: false,
      total: 0,
    },
  };
}

// ============================================================
// Mock data — development (NEXT_PUBLIC_MOCK_AUTH=true)
// Ganti saat backend tersedia
// ============================================================

async function mockAmbilPaketHarga(): Promise<PaketHarga[]> {
  await tundaMs(300);
  return [
    {
      id: "pkg_gratis",
      nama: "Gratis",
      harga_bulanan: 0,
      mata_uang: "IDR",
      fitur: {
        audit_per_bulan: 3,
        negosiasi_per_bulan: 1,
        keterangan_kuota: "3 audit dan 1 draf negosiasi per bulan",
      },
    },
    {
      id: "pkg_pro",
      nama: "Pro",
      harga_bulanan: 99000,
      mata_uang: "IDR",
      fitur: {
        audit_per_bulan: -1,
        negosiasi_per_bulan: -1,
        keterangan_kuota: "Audit dan draf negosiasi tidak terbatas",
      },
    },
    {
      id: "pkg_bisnis",
      nama: "Bisnis",
      harga_bulanan: 299000,
      mata_uang: "IDR",
      fitur: {
        audit_per_bulan: -1,
        negosiasi_per_bulan: -1,
        keterangan_kuota: "Tidak terbatas, prioritas dukungan",
      },
    },
  ];
}

async function mockBuatSesiPembayaran(
  paketId: string,
  _periode: string
): Promise<ResponsBuatSesiPembayaran> {
  await tundaMs(800);
  // Mode mock: tidak redirect ke Mayar sungguhan
  // Kembalikan URL mock yang akan dideteksi komponen sebagai mode development
  return {
    sesi_id: `sesi_mock_${Date.now()}`,
    url_checkout: `/langganan?status=berhasil&mock=true&paket=${paketId}`,
    kedaluwarsa_pada: new Date(Date.now() + 3600000).toISOString(),
  };
}

// Data mock langganan per email — selaras dengan mock-dashboard.ts
const LANGGANAN_MOCK: Record<string, LanggananAktif | null> = {
  // Rani — tier gratis, tidak ada langganan berbayar
  "rani@example.com": null,
  // Bima — tier pro aktif
  "bima@example.com": {
    id: "sub_mock_bima",
    tier: "pro",
    status: "aktif",
    periode: "bulanan",
    harga: 99000,
    mata_uang: "IDR",
    aktif_sejak: "2026-08-15T00:00:00Z",
    aktif_hingga: "2026-09-15T00:00:00Z",
    perbarui_otomatis: true,
    mayar_subscription_id: "mayar_sub_mock_bima",
  },
  // Sari — tier gratis, tidak ada langganan berbayar
  "sari@example.com": null,
};

// Override per session — dipakai setelah batalkan langganan
const _overrideLangganan: Record<string, LanggananAktif | null | undefined> = {};

function emailMockAktif(): string {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("mock_email") ?? "rani@example.com";
  }
  return "rani@example.com";
}

async function mockAmbilLanggananAktif(): Promise<LanggananAktif | null> {
  await tundaMs(300);
  const email = emailMockAktif();
  if (email in _overrideLangganan) {
    return _overrideLangganan[email] ?? null;
  }
  return LANGGANAN_MOCK[email] ?? null;
}

async function mockBatalkanLangganan(): Promise<HasilBatalkanLangganan> {
  await tundaMs(800);
  const email = emailMockAktif();
  const langgananSaatIni =
    email in _overrideLangganan
      ? _overrideLangganan[email]
      : LANGGANAN_MOCK[email];
  // Simpan state dibatalkan ke override
  if (langgananSaatIni) {
    _overrideLangganan[email] = {
      ...langgananSaatIni,
      perbarui_otomatis: false,
      status: "dibatalkan",
    };
  }
  const aktifHingga =
    langgananSaatIni?.aktif_hingga ?? "2026-09-15T00:00:00Z";
  return {
    aktif_hingga: aktifHingga,
    perbarui_otomatis: false,
  };
}

async function mockAmbilRiwayatTransaksi(): Promise<{
  data: ItemTransaksi[];
  paginasi: DataPaginasi;
}> {
  await tundaMs(400);
  const email = emailMockAktif();
  const langganan =
    email in _overrideLangganan
      ? _overrideLangganan[email]
      : LANGGANAN_MOCK[email];
  // Tier gratis atau tanpa langganan tidak punya riwayat transaksi
  if (!langganan || langganan.tier === "gratis") {
    return {
      data: [],
      paginasi: { cursor_berikutnya: null, ada_lagi: false, total: 0 },
    };
  }
  return {
    data: [
      {
        id: "trx_mock_001",
        jenis: "langganan_baru",
        jumlah: 99000,
        mata_uang: "IDR",
        status: "berhasil",
        paket: "Pro",
        periode: "bulanan",
        dibayar_pada: "2026-08-01T09:00:00Z",
        mayar_payment_id: "mayar_pay_mock_001",
      },
      {
        id: "trx_mock_002",
        jenis: "perpanjangan",
        jumlah: 99000,
        mata_uang: "IDR",
        status: "berhasil",
        paket: "Pro",
        periode: "bulanan",
        dibayar_pada: "2026-07-01T09:00:00Z",
        mayar_payment_id: "mayar_pay_mock_002",
      },
    ],
    paginasi: {
      cursor_berikutnya: null,
      ada_lagi: false,
      total: 2,
    },
  };
}