// ============================================================
// Service negosiasi — KontrakAman AI
// POST /negosiasi (api.md 8.1) dan GET /negosiasi/:id (api.md 8.2)
// Mock-aware: env dibaca dinamis supaya vi.stubEnv() di test bekerja
// ============================================================

import { apiClient } from "@/lib/api-client";
import type {
  ResponsPermintaanNegosiasi,
  HasilNegosiasi,
  HasilNegosiasiSelesai,
  HasilNegosiasiMemproses,
} from "../types";

// ============================================================
// POST /negosiasi — api.md 8.1
// Meminta AI membuat draf negosiasi untuk satu klausul
// ============================================================
export async function mintaDrafNegosiasi(
  klausulId: string,
  konteksTambahan?: string
): Promise<ResponsPermintaanNegosiasi> {
  if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
    return mockMintaDrafNegosiasi(klausulId);
  }

  const body: Record<string, string> = { klausul_id: klausulId };
  if (konteksTambahan) body.konteks_tambahan = konteksTambahan;

  const respons = await apiClient.post<ResponsPermintaanNegosiasi>(
    "/negosiasi",
    body,
    true
  );
  return respons.data as ResponsPermintaanNegosiasi;
}

// ============================================================
// GET /negosiasi/:id — api.md 8.2
// Ambil hasil draf negosiasi (polling sampai status selesai)
// ============================================================
export async function ambilHasilNegosiasi(
  negosiasiId: string
): Promise<HasilNegosiasi> {
  if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
    return mockAmbilHasilNegosiasi(negosiasiId);
  }

  const respons = await apiClient.get<HasilNegosiasi>(
    `/negosiasi/${negosiasiId}`,
    true
  );
  return respons.data as HasilNegosiasi;
}

// ============================================================
// Mock untuk development
// Siklus: 1x memproses → selesai dengan 3 versi draf
// ID dari riwayat mock langsung selesai
// ============================================================
const registriMockNegosiasi = new Map<string, number>();

// Pasangan klausul_id → negosiasi_id untuk mock KONFLIK (draf sudah ada)
const registriKlausulNeg = new Map<string, string>();

// Fungsi reset untuk kebutuhan test — bersihkan state mock antar test
export function resetRegistriMockNegosiasi(): void {
  registriMockNegosiasi.clear();
  registriKlausulNeg.clear();
}

function tundaMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mockMintaDrafNegosiasi(
  klausulId: string
): Promise<ResponsPermintaanNegosiasi> {
  await tundaMs(400);

  // Cek apakah draf untuk klausul ini sudah pernah dibuat (simulasi 409 KONFLIK)
  // Untuk mock, kita biarkan lanjut dan kembalikan ID yang sama
  const negosiasiIdLama = registriKlausulNeg.get(klausulId);
  if (negosiasiIdLama) {
    return {
      id: negosiasiIdLama,
      klausul_id: klausulId,
      status: "memproses",
      dimulai_pada: new Date().toISOString(),
    };
  }

  const negosiasiId = `neg_mock_${Date.now()}`;
  registriKlausulNeg.set(klausulId, negosiasiId);

  return {
    id: negosiasiId,
    klausul_id: klausulId,
    status: "memproses",
    dimulai_pada: new Date().toISOString(),
  };
}

function buatHasilNegosiasiSelesai(
  negosiasiId: string,
  klausulId: string
): HasilNegosiasiSelesai {
  // Teks asli berbeda per klausul mock
  const teksAsliPerKlausul: Record<string, string> = {
    kls_mock_001:
      "Freelancer wajib membayar denda sebesar 5% per hari keterlambatan dari total nilai proyek tanpa batas maksimum.",
    default:
      "Klausul yang memerlukan negosiasi berdasarkan analisis kontrak.",
  };

  const teksAsli =
    teksAsliPerKlausul[klausulId] ?? teksAsliPerKlausul["default"];

  return {
    id: negosiasiId,
    klausul_id: klausulId,
    status: "selesai",
    teks_asli_klausul: teksAsli,
    draft_negosiasi: {
      versi: [
        {
          label: "Negosiasi Lunak — Cocok jika hubungan baik dengan klien",
          teks: "Mengenai klausul denda, saya ingin mengusulkan perubahan kecil: denda keterlambatan ditetapkan 1% per hari dengan batas maksimum 10% dari total nilai kontrak. Ini masih memberikan perlindungan yang wajar bagi klien sambil memastikan proyek tetap layak secara ekonomis bagi saya.",
        },
        {
          label: "Negosiasi Standar — Pendekatan profesional",
          teks: "Saya mengusulkan revisi klausul denda menjadi: denda keterlambatan sebesar 0,5% dari nilai milestone yang terlambat per hari kerja, dengan batas maksimum 15% dari total nilai proyek, dan tidak berlaku untuk keterlambatan yang disebabkan oleh keterlambatan persetujuan revisi dari pihak klien lebih dari 3 hari kerja.",
        },
        {
          label: "Negosiasi Tegas — Jika posisi tawar kuat",
          teks: "Klausul denda dalam bentuk saat ini tidak dapat saya setujui karena tidak memiliki batas maksimum. Saya meminta klausul ini direvisi mengikuti praktik industri standar: denda maksimum 10% dari nilai kontrak, berlaku hanya untuk keterlambatan yang murni disebabkan kelalaian freelancer, dengan mekanisme force majeure yang jelas.",
        },
      ],
    },
    selesai_pada: new Date().toISOString(),
  };
}

async function mockAmbilHasilNegosiasi(
  negosiasiId: string
): Promise<HasilNegosiasi> {
  await tundaMs(600);

  // Cari klausul_id dari registri
  let klausulId = "kls_mock_001";
  for (const [kId, nId] of registriKlausulNeg.entries()) {
    if (nId === negosiasiId) {
      klausulId = kId;
      break;
    }
  }

  const hitungan = (registriMockNegosiasi.get(negosiasiId) ?? 0) + 1;
  registriMockNegosiasi.set(negosiasiId, hitungan);

  // Panggilan pertama: masih memproses
  if (hitungan === 1) {
    const hasilMemproses: HasilNegosiasiMemproses = {
      id: negosiasiId,
      klausul_id: klausulId,
      status: "memproses",
    };
    return hasilMemproses;
  }

  // Panggilan kedua+: selesai
  registriMockNegosiasi.delete(negosiasiId);
  return buatHasilNegosiasiSelesai(negosiasiId, klausulId);
}