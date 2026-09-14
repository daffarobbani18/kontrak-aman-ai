// ============================================================
// Service audit klausul — KontrakAman AI
// Memanggil GET /audit/:id (api.md 7.2)
// Mock-aware: cek NEXT_PUBLIC_MOCK_AUTH untuk development
// ============================================================

import { apiClient } from "@/lib/api-client";
import type { HasilAudit, HasilAuditSelesai, HasilAuditMemproses } from "../types";
import type { ResponsAPI } from "@/features/autentikasi/types";

// ============================================================
// GET /audit/:id — api.md 7.2
// Mengembalikan hasil audit (selesai) atau status progres (memproses)
// Env dibaca secara dinamis (tidak di-cache saat modul diimport)
// supaya vi.stubEnv() di test bisa bekerja dengan benar
// ============================================================
export async function ambilHasilAudit(auditId: string): Promise<HasilAudit> {
  if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
    return mockAmbilHasilAudit(auditId);
  }

  const respons = await apiClient.get<HasilAudit>(`/audit/${auditId}`, true);
  return respons.data as HasilAudit;
}

// ============================================================
// Mock untuk development
// ID dari data riwayat (aud_*_001, aud_*_002, dst) langsung selesai
// ID baru dari alur /unggah (aud_mock_*) simulasi polling 3 siklus
// ============================================================
const registriMockStatus = new Map<string, number>();

// ID audit yang berasal dari mock riwayat — langsung kembalikan selesai
// Selaras dengan DOKUMEN_MOCK di lib/mock-dashboard.ts
const AUDIT_ID_RIWAYAT = new Set([
  "aud_rani_001",
  "aud_rani_002",
  "aud_bima_001",
  "aud_bima_002",
]);

function tundaMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Tentukan skor dan data sesuai audit_id dari riwayat
function buatHasilSelesai(auditId: string): HasilAuditSelesai {
  const dataPerAudit: Record<string, {
    skor: "hijau" | "kuning" | "merah";
    ringkasan: string;
    dokumen_kontrak_id: string;
  }> = {
    aud_rani_001: {
      skor: "merah",
      ringkasan: "Kontrak ini mengandung 2 klausul berisiko tinggi. Jangan ditandatangani sebelum dinegosiasikan.",
      dokumen_kontrak_id: "dok_rani_001",
    },
    aud_rani_002: {
      skor: "kuning",
      ringkasan: "Kontrak ini mengandung 1 klausul berisiko sedang yang perlu diperhatikan sebelum ditandatangani.",
      dokumen_kontrak_id: "dok_rani_002",
    },
    aud_bima_001: {
      skor: "kuning",
      ringkasan: "Kontrak ini mengandung 2 klausul berisiko sedang terkait hak cipta dan non-compete.",
      dokumen_kontrak_id: "dok_bima_001",
    },
    aud_bima_002: {
      skor: "hijau",
      ringkasan: "Kontrak ini terlihat seimbang dan tidak mengandung klausul yang sangat memberatkan.",
      dokumen_kontrak_id: "dok_bima_002",
    },
  };

  const info = dataPerAudit[auditId] ?? {
    skor: "kuning" as const,
    ringkasan: "Kontrak ini mengandung 1 klausul berisiko sedang yang perlu dinegosiasikan.",
    dokumen_kontrak_id: "dok_mock_001",
  };

  return {
    id: auditId,
    dokumen_kontrak_id: info.dokumen_kontrak_id,
    status: "selesai",
    skor_risiko: info.skor,
    ringkasan: info.ringkasan,
    dimulai_pada: new Date(Date.now() - 65000).toISOString(),
    selesai_pada: new Date().toISOString(),
    klausul: [
      {
        id: "kls_mock_001",
        nomor_urut: 1,
        judul: "Klausul 5 — Denda Keterlambatan",
        teks_asli:
          "Freelancer wajib membayar denda sebesar 5% per hari keterlambatan dari total nilai proyek tanpa batas maksimum.",
        tingkat_risiko: "merah",
        penjelasan:
          "Denda 5% per hari tanpa batas adalah klausul sangat memberatkan. Dalam proyek senilai Rp10 juta, keterlambatan 7 hari saja sudah melampaui nilai proyek.",
        rekomendasi:
          "Negosiasikan batas maksimum denda (lazimnya 10–20% dari nilai kontrak) dan definisikan 'keterlambatan' secara jelas.",
        ada_draft_negosiasi: true,
      },
      {
        id: "kls_mock_002",
        nomor_urut: 2,
        judul: "Klausul 8 — Pengalihan Hak Cipta",
        teks_asli: "Seluruh hasil karya menjadi milik klien sejak pekerjaan dimulai.",
        tingkat_risiko: "kuning",
        penjelasan:
          "Pengalihan hak cipta sebelum pelunasan adalah risiko sedang. Jika klien tidak membayar, kamu kehilangan karya sekaligus kehilangan hak untuk menggunakannya kembali.",
        rekomendasi:
          "Tambahkan klausul bahwa pengalihan hak cipta efektif hanya setelah pembayaran penuh diterima.",
        ada_draft_negosiasi: false,
      },
      {
        id: "kls_mock_003",
        nomor_urut: 3,
        judul: "Klausul 12 — Termin Pembayaran",
        teks_asli: "Pembayaran dilakukan 90 hari setelah proyek dinyatakan selesai oleh klien.",
        tingkat_risiko: "kuning",
        penjelasan:
          "Termin 90 hari sangat panjang untuk freelancer individu dan bisa memengaruhi arus kas secara signifikan.",
        rekomendasi:
          "Usulkan termin 14–30 hari, atau pembayaran bertahap: DP di awal, pelunasan saat serah terima.",
        ada_draft_negosiasi: false,
      },
      {
        id: "kls_mock_004",
        nomor_urut: 4,
        judul: "Klausul 3 — Ruang Lingkup Pekerjaan",
        teks_asli:
          "Freelancer akan menyelesaikan desain antarmuka aplikasi mobile sesuai brief yang diberikan klien.",
        tingkat_risiko: "hijau",
        penjelasan:
          "Ruang lingkup pekerjaan terdefinisi dengan cukup jelas. Referensi ke brief yang spesifik mengurangi risiko scope creep.",
        rekomendasi:
          "Pastikan brief dilampirkan sebagai dokumen terpisah dan dirujuk secara eksplisit di kontrak.",
        ada_draft_negosiasi: false,
      },
    ],
    statistik: {
      total_klausul: 4,
      klausul_merah: info.skor === "merah" ? 2 : 1,
      klausul_kuning: info.skor === "hijau" ? 0 : 2,
      klausul_hijau: info.skor === "hijau" ? 3 : 1,
    },
  };
}

async function mockAmbilHasilAudit(auditId: string): Promise<HasilAudit> {
  await tundaMs(600);

  // ID dari riwayat → langsung selesai tanpa simulasi polling
  if (AUDIT_ID_RIWAYAT.has(auditId)) {
    return buatHasilSelesai(auditId);
  }

  // ID baru dari alur /unggah atau revisi → simulasi polling 3 siklus
  // Untuk audit revisi (aud_mock_rev_<ts>), dokumen_kontrak_id adalah
  // ID dokumen revisi itu sendiri (dok_mock_rev_<ts>), bukan dok_mock_001
  const dokumenKontrakId = auditId.startsWith("aud_mock_rev_")
    ? auditId.replace("aud_mock_rev_", "dok_mock_rev_")
    : "dok_mock_001";

  const hitungan = (registriMockStatus.get(auditId) ?? 0) + 1;
  registriMockStatus.set(auditId, hitungan);

  // Panggilan 1: progres 0%
  if (hitungan === 1) {
    return {
      id: auditId,
      dokumen_kontrak_id: dokumenKontrakId,
      status: "memproses",
      progres_persen: 0,
    } satisfies HasilAuditMemproses;
  }

  // Panggilan 2: progres 55%
  if (hitungan === 2) {
    return {
      id: auditId,
      dokumen_kontrak_id: dokumenKontrakId,
      status: "memproses",
      progres_persen: 55,
    } satisfies HasilAuditMemproses;
  }

  // Panggilan 3+: selesai
  registriMockStatus.delete(auditId);

  const hasilSelesai: HasilAuditSelesai = {
    id: auditId,
    dokumen_kontrak_id: dokumenKontrakId,
    status: "selesai",
    skor_risiko: "kuning",
    ringkasan:
      "Kontrak ini mengandung 1 klausul berisiko tinggi dan 2 klausul berisiko sedang yang perlu dinegosiasikan sebelum ditandatangani. Secara keseluruhan kontrak masih bisa diperbaiki.",
    dimulai_pada: new Date(Date.now() - 65000).toISOString(),
    selesai_pada: new Date().toISOString(),
    klausul: [
      {
        id: "kls_mock_001",
        nomor_urut: 1,
        judul: "Klausul 5 — Denda Keterlambatan",
        teks_asli:
          "Freelancer wajib membayar denda sebesar 5% per hari keterlambatan dari total nilai proyek tanpa batas maksimum.",
        tingkat_risiko: "merah",
        penjelasan:
          "Denda 5% per hari tanpa batas adalah klausul sangat memberatkan. Dalam proyek senilai Rp10 juta, keterlambatan 7 hari saja sudah melampaui nilai proyek. Tidak ada kontrak kerja profesional yang menerapkan denda tanpa batas maksimum.",
        rekomendasi:
          "Negosiasikan batas maksimum denda (lazimnya 10–20% dari nilai kontrak) dan definisikan 'keterlambatan' secara jelas — termasuk keterlambatan akibat revisi yang diminta klien.",
        ada_draft_negosiasi: true,
      },
      {
        id: "kls_mock_002",
        nomor_urut: 2,
        judul: "Klausul 8 — Pengalihan Hak Cipta",
        teks_asli:
          "Seluruh hasil karya menjadi milik klien sejak pekerjaan dimulai.",
        tingkat_risiko: "kuning",
        penjelasan:
          "Pengalihan hak cipta sebelum pelunasan adalah risiko sedang. Jika klien tidak membayar, kamu kehilangan karya sekaligus kehilangan hak untuk menggunakannya kembali.",
        rekomendasi:
          "Tambahkan klausul bahwa pengalihan hak cipta efektif hanya setelah pembayaran penuh diterima.",
        ada_draft_negosiasi: false,
      },
      {
        id: "kls_mock_003",
        nomor_urut: 3,
        judul: "Klausul 12 — Termin Pembayaran",
        teks_asli:
          "Pembayaran dilakukan 90 hari setelah proyek dinyatakan selesai oleh klien.",
        tingkat_risiko: "kuning",
        penjelasan:
          "Termin 90 hari sangat panjang untuk freelancer individu. Ini bisa memengaruhi arus kas secara signifikan, terutama jika kamu mengandalkan proyek ini untuk menutupi biaya operasional.",
        rekomendasi:
          "Usulkan termin 14–30 hari, atau pembayaran bertahap: DP di awal, pelunasan saat serah terima.",
        ada_draft_negosiasi: false,
      },
      {
        id: "kls_mock_004",
        nomor_urut: 4,
        judul: "Klausul 3 — Ruang Lingkup Pekerjaan",
        teks_asli:
          "Freelancer akan menyelesaikan desain antarmuka aplikasi mobile sesuai brief yang diberikan klien.",
        tingkat_risiko: "hijau",
        penjelasan:
          "Ruang lingkup pekerjaan terdefinisi dengan cukup jelas. Referensi ke brief yang spesifik mengurangi risiko scope creep.",
        rekomendasi:
          "Pastikan brief dilampirkan sebagai dokumen terpisah dan dirujuk secara eksplisit di kontrak.",
        ada_draft_negosiasi: false,
      },
    ],
    statistik: {
      total_klausul: 4,
      klausul_merah: 1,
      klausul_kuning: 2,
      klausul_hijau: 1,
    },
  };

  return hasilSelesai;
}