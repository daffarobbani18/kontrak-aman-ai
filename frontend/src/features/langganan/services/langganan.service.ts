// ============================================================
// Service langganan — KontrakAman AI
// Menangani:
//   GET  /langganan/paket               (api.md 9.1)
//   POST /langganan/buat-sesi-pembayaran (api.md 9.2)
//   GET  /langganan/aktif               (api.md 9.3)
//   POST /langganan/batalkan            (api.md 9.4)
//   GET  /langganan/transaksi           (api.md 9.5)
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

// ============================================================
// GET /langganan/paket — api.md 9.1
// Publik — tidak butuh auth
// ============================================================
export async function ambilPaketHarga(): Promise<PaketHarga[]> {
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

