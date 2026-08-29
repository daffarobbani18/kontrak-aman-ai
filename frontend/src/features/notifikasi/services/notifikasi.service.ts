// ============================================================
// notifikasi.service.ts — service notifikasi in-app
// F-NOTIF-01 PRD.md: GET /notifikasi (api.md 11.1)
// F-NOTIF-02 PRD.md: pengingat tindak lanjut (api.md 11.1)
//
// Mode mock (NEXT_PUBLIC_MOCK_AUTH=true):
//   Generate notifikasi dari data dokumen mock yang sudah ada
//   di lib/mock-dashboard.ts — tidak perlu backend berjalan.
//
// Mode produksi:
//   Panggil endpoint yang terdokumentasi di api.md 11.1, 11.2, 11.3.
//   Tidak ada endpoint baru — hanya yang sudah ada di api.md.
//
// Untuk disambungkan ke backend:
//   1. Pastikan NEXT_PUBLIC_MOCK_AUTH tidak di-set atau di-set false
//   2. Backend mengembalikan format sesuai api.md 11.1
//   3. Tidak ada perubahan di sisi frontend — service sudah siap
// ============================================================

import { apiClient } from "@/lib/api-client";
import { apiKeInternal, type ItemNotifikasiAPI } from "../types";
import type { ItemNotifikasi } from "../types";
import type { DataPaginasi } from "@/features/dashboard/types";
import {
  buatNotifikasiDariDokumen,
  buatNotifikasiPengingat,
} from "../notifikasi.utils";
import {
  mockAmbilDaftarDokumen,
} from "@/lib/mock-dashboard";

// PAKAI_MOCK dievaluasi lazily di dalam setiap fungsi (bukan top-level const)
// agar vi.stubEnv() di test bisa mengubah nilainya sebelum fungsi dipanggil.
// Pola yang sama dengan service lain di proyek ini.
function pakaiMock(): boolean {
  return process.env.NEXT_PUBLIC_MOCK_AUTH === "true";
}

// ============================================================
// Tipe parameter dan respons
// ============================================================

export interface OpsiAmbilNotifikasi {
  sudah_dibaca?: boolean; // filter: true = sudah dibaca, false = belum dibaca
  limit?: number;         // default 20, maks 100 (api.md 11.1)
  cursor?: string;        // cursor paginasi
}

export interface ResponsNotifikasi {
  data: ItemNotifikasi[];
  paginasi: DataPaginasi;
}

// ============================================================
// State mock — persisten selama sesi browser
// Dipakai untuk mock tandai dibaca agar state tidak reset saat
// fungsi dipanggil ulang
// ============================================================
const stateMockTandaiDibaca = new Set<string>();
let stateMockTandaiSemuaDibaca = false;

/** Reset state mock — untuk keperluan test */
export function resetStateMockNotifikasi(): void {
  stateMockTandaiDibaca.clear();
  stateMockTandaiSemuaDibaca = false;
}

// ============================================================
// Mock: generate notifikasi dari data dokumen yang sudah ada
// Meniru response GET /notifikasi (api.md 11.1)
// Menggunakan profil Rani sebagai default mock user
// ============================================================
async function mockAmbilNotifikasi(
  opsi: OpsiAmbilNotifikasi = {}
): Promise<ResponsNotifikasi> {
  // Ambil dokumen dari mock — pakai usr_dummy_rani sebagai default
  // Saat backend tersedia, ini diganti dengan fetch ke GET /notifikasi
  const emailMock =
    typeof window !== "undefined"
      ? (sessionStorage.getItem("mock_email") ?? "rani@example.com")
      : "rani@example.com";

  // Tentukan userId dari email mock
  const peta: Record<string, string> = {
    "rani@example.com": "usr_dummy_rani",
    "bima@example.com": "usr_dummy_bima",
    "sari@example.com": "usr_dummy_sari",
  };
  const penggunaId = peta[emailMock] ?? "usr_dummy_rani";

  const responsDokumen = await mockAmbilDaftarDokumen(penggunaId);

  // Generate notifikasi dari dokumen — F-NOTIF-01 dan F-NOTIF-02
  const notifikasi: ItemNotifikasi[] = [];

  for (const dok of responsDokumen.data) {
    const notifAudit = buatNotifikasiDariDokumen(dok);
    if (notifAudit) {
      // Terapkan state tandai dibaca dari mock state
      notifikasi.push({
        ...notifAudit,
        sudahDibaca: stateMockTandaiSemuaDibaca
          ? true
          : stateMockTandaiDibaca.has(notifAudit.id)
          ? true
          : notifAudit.sudahDibaca,
      });
    }

    const notifPengingat = buatNotifikasiPengingat(dok);
    if (notifPengingat) {
      notifikasi.push({
        ...notifPengingat,
        sudahDibaca: stateMockTandaiSemuaDibaca
          ? true
          : stateMockTandaiDibaca.has(notifPengingat.id)
          ? true
          : notifPengingat.sudahDibaca,
      });
    }
  }

  // Terapkan filter sudah_dibaca jika ada
  const terfilter =
    opsi.sudah_dibaca !== undefined
      ? notifikasi.filter((n) => n.sudahDibaca === opsi.sudah_dibaca)
      : notifikasi;

  // Terapkan limit
  const limit = opsi.limit ?? 20;
  const halaman = terfilter.slice(0, limit);

  return {
    data: halaman,
    paginasi: {
      cursor_berikutnya: null,
      ada_lagi: terfilter.length > limit,
      total: terfilter.length,
    },
  };
}

// ============================================================
// ambilNotifikasi — GET /notifikasi (api.md 11.1)
// Mengembalikan daftar notifikasi in-app milik pengguna
// ============================================================
export async function ambilNotifikasi(
  opsi: OpsiAmbilNotifikasi = {}
): Promise<ResponsNotifikasi> {
  if (pakaiMock()) {
    return mockAmbilNotifikasi(opsi);
  }

  // Mode produksi — panggil GET /notifikasi (api.md 11.1)
  // Query params: sudah_dibaca, limit, cursor
  const params = new URLSearchParams();
  if (opsi.sudah_dibaca !== undefined) {
    params.set("sudah_dibaca", String(opsi.sudah_dibaca));
  }
  if (opsi.limit !== undefined) {
    params.set("limit", String(opsi.limit));
  }
  if (opsi.cursor) {
    params.set("cursor", opsi.cursor);
  }

  const queryString = params.toString();
  const path = queryString ? `/notifikasi?${queryString}` : "/notifikasi";

  // api.md 11.1: response wrapper { berhasil, data: { data: [...], paginasi: {...} } }
  // apiClient.get<T> mengembalikan ResponsAPI<T>, sehingga respons.data sudah bertipe T
  // T di sini adalah { data: ItemNotifikasiAPI[]; paginasi: DataPaginasi }
  type ResponsGetNotifikasi = { data: ItemNotifikasiAPI[]; paginasi: DataPaginasi };
  const respons = await apiClient.get<ResponsGetNotifikasi>(path);
  const payload = respons.data as ResponsGetNotifikasi;

  return {
    // Konversi snake_case API → camelCase internal via apiKeInternal (types/index.ts)
    data: payload.data.map(apiKeInternal),
    paginasi: payload.paginasi,
  };
}

// ============================================================
// tandaiDibaca — PATCH /notifikasi/:id/baca (api.md 11.2)
// Menandai satu notifikasi sebagai sudah dibaca
// ============================================================
export async function tandaiDibaca(id: string): Promise<void> {
  if (pakaiMock()) {
    // Simpan ke mock state agar persist selama sesi
    stateMockTandaiDibaca.add(id);
    return;
  }

  // Mode produksi — panggil PATCH /notifikasi/:id/baca (api.md 11.2)
  await apiClient.patch(`/notifikasi/${id}/baca`);
}

// ============================================================
// tandaiSemuaDibaca — PATCH /notifikasi/baca-semua (api.md 11.3)
// Menandai semua notifikasi milik pengguna sebagai sudah dibaca
// ============================================================
export async function tandaiSemuaDibaca(): Promise<void> {
  if (pakaiMock()) {
    stateMockTandaiSemuaDibaca = true;
    return;
  }

  // Mode produksi — panggil PATCH /notifikasi/baca-semua (api.md 11.3)
  await apiClient.patch("/notifikasi/baca-semua");
}