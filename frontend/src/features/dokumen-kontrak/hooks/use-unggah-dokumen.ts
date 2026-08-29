// ============================================================
// Hook useUnggahDokumen — KontrakAman AI
// State machine: idle → memvalidasi → mengunggah → memproses → selesai | gagal
// Selaras Alur Kritikal 1 PRD.md Bagian 4.11
// ============================================================

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { unggahDokumen, mulaiAudit } from "../services/dokumen-kontrak.service";
import { KesalahanAPI, KODE_ERROR } from "@/lib/api-client";
import type { StateUnggah, NilaiKategori } from "../types";

const STATE_AWAL: StateUnggah = {
  status: "idle",
  progressPersen: 0,
  pesanError: null,
  auditId: null,
  dokumenId: null,
  kuotaHabis: false,
};

export function useUnggahDokumen() {
  const [state, setState] = useState<StateUnggah>(STATE_AWAL);
  const router = useRouter();

  const setelState = (perubahan: Partial<StateUnggah>) =>
    setState((prev) => ({ ...prev, ...perubahan }));

  const reset = useCallback(() => {
    setState(STATE_AWAL);
  }, []);

  // ============================================================
  // Fungsi utama: validasi → unggah → mulai audit → redirect
  // Selaras Alur Kritikal 1 PRD.md langkah 3–10
  // ============================================================
  const proses = useCallback(
    async (file: File, opsi?: { nama?: string; kategori?: NilaiKategori }) => {
      // Langkah 1: Validasi sisi client (format + ukuran)
      setelState({ status: "memvalidasi", progressPersen: 0, pesanError: null });

      // Langkah 2: Unggah dokumen
      setelState({ status: "mengunggah", progressPersen: 10 });

      let dokumenId: string;
      try {
        const responsDokumen = await unggahDokumen(file, opsi);
        dokumenId = responsDokumen.id;
        setelState({ dokumenId, progressPersen: 50 });
      } catch (err) {
        const pesanError = tangkapPesanError(err, "unggah");
        const kuotaHabis = err instanceof KesalahanAPI && err.kode === KODE_ERROR.KUOTA_HABIS;
        setelState({ status: "gagal", pesanError, kuotaHabis });
        return;
      }

      // Langkah 3: Mulai audit AI
      setelState({ status: "memproses", progressPersen: 70 });

      let auditId: string;
      try {
        const responsAudit = await mulaiAudit(dokumenId);
        auditId = responsAudit.id;
        setelState({ auditId, progressPersen: 100 });
      } catch (err) {
        // Jika mulai audit gagal, kuota tidak berkurang (sesuai PRD alur 9a)
        const pesanError = tangkapPesanError(err, "audit");
        const kuotaHabis = err instanceof KesalahanAPI && err.kode === KODE_ERROR.KUOTA_HABIS;
        setelState({ status: "gagal", pesanError, dokumenId, kuotaHabis });
        return;
      }

      // Langkah 4: Selesai — redirect ke halaman detail audit
      setelState({ status: "selesai", auditId });

      // Delay 1.5 detik agar pengguna bisa melihat status selesai
      setTimeout(() => {
        router.push(`/audit/${auditId}`);
      }, 1500);
    },
    [router]
  );

  return { state, proses, reset };
}

// ============================================================
// Helper: tangkap dan terjemahkan pesan error dari API
// Selaras kode error api.md Bagian 3
// ============================================================
function tangkapPesanError(err: unknown, konteks: "unggah" | "audit"): string {
  if (err instanceof KesalahanAPI) {
    switch (err.kode) {
      case KODE_ERROR.KUOTA_HABIS:
        return "Kuota auditmu bulan ini sudah habis. Upgrade ke Pro untuk audit tidak terbatas.";
      case KODE_ERROR.FORMAT_FILE_TIDAK_DIDUKUNG:
        return "Format file tidak didukung. Gunakan PDF, JPG, PNG, atau WEBP.";
      case KODE_ERROR.UKURAN_FILE_MELEBIHI_BATAS:
        return "Ukuran file melebihi batas 10MB. Coba kompres file terlebih dahulu.";
      case KODE_ERROR.FILE_TIDAK_DAPAT_DIBACA:
        return "File tidak dapat dibaca. Pastikan file tidak rusak atau coba unggah ulang dengan kualitas lebih baik.";
      case KODE_ERROR.LAYANAN_TIDAK_TERSEDIA:
        return konteks === "audit"
          ? "Layanan AI sedang tidak tersedia. Kuotamu tidak berkurang — coba lagi dalam beberapa menit."
          : "Layanan sedang tidak tersedia. Coba lagi dalam beberapa menit.";
      case KODE_ERROR.TERLALU_BANYAK_PERMINTAAN:
        return "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.";
      default:
        return err.message || "Terjadi kesalahan. Coba lagi.";
    }
  }

  if (err instanceof Error) {
    // Error jaringan dari api-client.ts
    return err.message;
  }

  return "Terjadi kesalahan yang tidak diketahui. Coba lagi.";
}