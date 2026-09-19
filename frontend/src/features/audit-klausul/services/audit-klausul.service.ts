// ============================================================
// Service audit klausul — KontrakAman AI
// Memanggil GET /audit/:id (api.md 7.2)
// ============================================================

import { apiClient } from "@/lib/api-client";
import type { HasilAudit } from "../types";

// ============================================================
// GET /audit/:id — api.md 7.2
// Mengembalikan hasil audit (selesai) atau status progres (memproses)
// ============================================================
export async function ambilHasilAudit(auditId: string): Promise<HasilAudit> {
  const respons = await apiClient.get<any>(`/audit/${auditId}`, true);
  const data = respons.data;

  // Map status
  let statusMapped = "memproses";
  const s = String(data.status).toUpperCase();
  if (s === "COMPLETED" || s === "SELESAI") statusMapped = "selesai";
  else if (s === "FAILED" || s === "GAGAL") statusMapped = "gagal";
  else statusMapped = "memproses";

  // Map skor_risiko numerik (0-100) menjadi string (hijau/kuning/merah)
  let skorRisikoEnum = null;
  const skorNumerik = data.skorRisiko ?? data.skor_risiko;
  if (skorNumerik !== null && skorNumerik !== undefined) {
    if (skorNumerik <= 33) skorRisikoEnum = "hijau";
    else if (skorNumerik <= 66) skorRisikoEnum = "kuning";
    else skorRisikoEnum = "merah";
  }

  // Map klausul
  let klausulMapped = [];
  let statistik = {
    total_klausul: 0,
    klausul_merah: 0,
    klausul_kuning: 0,
    klausul_hijau: 0,
  };

  if (Array.isArray(data.klausul)) {
    klausulMapped = data.klausul.map((k: any, i: number) => {
      let riskStr = String(k.tingkatRisiko || k.tingkat_risiko || "hijau").toLowerCase();
      let risk = "hijau";
      
      if (riskStr.includes("merah") || riskStr.includes("tinggi") || riskStr.includes("high") || riskStr.includes("red")) {
        risk = "merah";
      } else if (riskStr.includes("kuning") || riskStr.includes("sedang") || riskStr.includes("medium") || riskStr.includes("yellow")) {
        risk = "kuning";
      }
      
      // Hitung statistik
      if (risk === "merah") statistik.klausul_merah++;
      else if (risk === "kuning") statistik.klausul_kuning++;
      else statistik.klausul_hijau++;
      
      return {
        id: k.id,
        nomor_urut: i + 1,
        judul: k.judul,
        teks_asli: k.isi || k.teks_asli || "",
        tingkat_risiko: risk,
        penjelasan: k.penjelasan,
        rekomendasi: k.rekomendasi,
        ada_draft_negosiasi: false,
      };
    });
    statistik.total_klausul = klausulMapped.length;
  }

  return {
    ...data,
    status: statusMapped,
    dokumen_kontrak_id: data.dokumenId || data.dokumenKontrakId || data.dokumen_kontrak_id,
    skor_risiko: skorRisikoEnum,
    dimulai_pada: data.dibuatPada || data.dimulai_pada,
    selesai_pada: data.selesaiPada || data.selesai_pada,
    progres_persen: data.progresPersen ?? data.progres_persen ?? 0,
    klausul: klausulMapped,
    statistik: statistik,
  } as HasilAudit;
}
