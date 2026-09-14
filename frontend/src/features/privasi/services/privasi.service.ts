// ============================================================
// Service privasi — KontrakAman AI
// F-PRIV-03: POST /pengguna/saya/ekspor-data (api.md 5.5)
//            GET  /pengguna/saya/ekspor-data/status (api.md 5.6)
// F-PRIV-04: DELETE /pengguna/saya (api.md 5.4) — hapus akun
// ============================================================

import { permintaanAPI, KesalahanAPI, apiClient } from "@/lib/api-client";
import type {
  ResponsHapusAkun,
  ResponsAjukanEkspor,
  ResponsStatusEkspor,
} from "../types";
import type { ResponsAPI } from "@/features/autentikasi/types";

// ------------------------------------------------------------
// DELETE /pengguna/saya — api.md 5.4
// Soft delete: akun + data dihapus permanen 30 hari kemudian
// ------------------------------------------------------------
export async function hapusAkun(
  konfirmasi: string,
  kataSandi: string
): Promise<ResponsAPI<ResponsHapusAkun>> {
  if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
    return mockHapusAkun(konfirmasi, kataSandi);
  }

  // DELETE /pengguna/saya membutuhkan body — gunakan permintaanAPI langsung
  // karena apiClient.delete tidak mendukung body (api.md 5.4)
  return permintaanAPI<ResponsHapusAkun>("/pengguna/saya", {
    method: "DELETE",
    body: { konfirmasi, kata_sandi: kataSandi },
    butuhAuth: true,
  });
}

// ============================================================
// ajukanEksporData — POST /pengguna/saya/ekspor-data (api.md 5.5)
// Mengajukan permintaan ekspor seluruh data pribadi pengguna.
// Backend menyiapkan berkas dan mengirim tautan unduhan ke email.
// Mendukung hak subjek data sesuai UU Pelindungan Data Pribadi.
// ============================================================
export async function ajukanEksporData(): Promise<
  ResponsAPI<ResponsAjukanEkspor>
> {
  if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
    return mockAjukanEksporData();
  }

  return permintaanAPI<ResponsAjukanEkspor>("/pengguna/saya/ekspor-data", {
    method: "POST",
    butuhAuth: true,
  });
}

// ============================================================
// ambilStatusEkspor — GET /pengguna/saya/ekspor-data/status (api.md 5.6)
// Mengecek status permintaan ekspor data yang sedang diproses.
// status: "memproses" | "selesai" | "tidak_ada"
// ============================================================
export async function ambilStatusEkspor(): Promise<
  ResponsAPI<ResponsStatusEkspor>
> {
  if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
    return mockAmbilStatusEkspor();
  }

  // apiClient.get<T> sudah mengembalikan ResponsAPI<T> — tidak perlu cast tambahan
  return apiClient.get<ResponsStatusEkspor>("/pengguna/saya/ekspor-data/status");
}

// ============================================================
// Mock untuk development
// ============================================================
function tundaMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Mock state ekspor data ──
// Persisten selama sesi: setelah ajukan, status berubah ke memproses
// kemudian ke selesai di panggilan ambilStatus berikutnya.
let stateMockEkspor: "tidak_ada" | "memproses" | "selesai" = "tidak_ada";
let wakteMockEksporDiminta: string | null = null;
let hitungPollMock = 0;

/** Reset state mock ekspor — untuk keperluan test */
export function resetStateMockEkspor(): void {
  stateMockEkspor = "tidak_ada";
  wakteMockEksporDiminta = null;
  hitungPollMock = 0;
}

async function mockAjukanEksporData(): Promise<
  ResponsAPI<ResponsAjukanEkspor>
> {
  await tundaMs(600);

  // Simulasi 429 jika sudah ada yang diproses
  if (stateMockEkspor === "memproses") {
    throw new KesalahanAPI(
      "Permintaan ekspor data sedang diproses. Tunggu hingga selesai sebelum mengajukan permintaan baru.",
      "TERLALU_BANYAK_PERMINTAAN",
      429
    );
  }

  stateMockEkspor = "memproses";
  wakteMockEksporDiminta = new Date().toISOString();
  hitungPollMock = 0;

  return {
    berhasil: true,
    pesan:
      "Permintaan ekspor data diterima. Tautan unduhan akan dikirim ke email kamu dalam beberapa menit.",
    data: {
      diminta_pada: wakteMockEksporDiminta,
      // Estimasi 1 menit di mode mock agar polling cepat saat testing
      estimasi_selesai_menit: 1,
    },
  };
}

async function mockAmbilStatusEkspor(): Promise<
  ResponsAPI<ResponsStatusEkspor>
> {
  await tundaMs(300);

  // Belum pernah mengajukan
  if (stateMockEkspor === "tidak_ada") {
    return {
      berhasil: true,
      pesan: "Status ekspor data.",
      data: {
        status: "tidak_ada",
        diminta_pada: null,
        selesai_pada: null,
      },
    };
  }

  // Setelah 2 kali polling, anggap selesai — mensimulasikan backend yang
  // memproses cepat di mode development
  hitungPollMock += 1;
  if (hitungPollMock >= 2 && stateMockEkspor === "memproses") {
    stateMockEkspor = "selesai";
  }

  return {
    berhasil: true,
    pesan: "Status ekspor data.",
    data: {
      status: stateMockEkspor,
      diminta_pada: wakteMockEksporDiminta,
      selesai_pada:
        stateMockEkspor === "selesai" ? new Date().toISOString() : null,
    },
  };
}

async function mockHapusAkun(
  konfirmasi: string,
  kataSandi: string
): Promise<ResponsAPI<ResponsHapusAkun>> {
  await tundaMs(800);

  // Simulasi kata sandi salah — untuk testing jalur error
  if (kataSandi === "salah123") {
    throw new KesalahanAPI(
      "Kata sandi tidak cocok.",
      "VALIDASI_GAGAL",
      400
    );
  }

  // Simulasi konfirmasi salah
  if (konfirmasi !== "HAPUS AKUN SAYA") {
    throw new KesalahanAPI(
      "Teks konfirmasi tidak cocok.",
      "VALIDASI_GAGAL",
      400
    );
  }

  // Hitung 30 hari dari sekarang
  const tanggalHapus = new Date();
  tanggalHapus.setDate(tanggalHapus.getDate() + 30);

  return {
    berhasil: true,
    pesan:
      "Permintaan penghapusan akun diterima. Akun dan seluruh data akan dihapus permanen dalam 30 hari. Masuk kembali sebelum batas waktu untuk membatalkan.",
    data: {
      dihapus_pada: tanggalHapus.toISOString(),
    },
  };
}