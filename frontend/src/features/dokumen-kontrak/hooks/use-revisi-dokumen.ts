"use client";

// ============================================================
// useRevisiDokumen — hook state machine untuk F-DOC-05
// POST /dokumen-kontrak/:id/revisi (api.md 6.5)
// GET  /dokumen-kontrak/:id/revisi (api.md 6.6)
//
// State machine:
//   statusMuat:   idle → memuat → selesai | gagal
//   statusUnggah: idle → mengunggah → memproses → selesai | gagal
//
// Setelah revisi berhasil diunggah:
//   1. Riwayat revisi di-reload otomatis
//   2. Redirect ke halaman audit revisi baru (/audit/:auditId)
// ============================================================

import { useCallback, useReducer } from "react";
import { useRouter } from "next/navigation";
import { unggahRevisi, ambilRiwayatRevisi } from "../services/dokumen-kontrak.service";
import { KesalahanAPI, KODE_ERROR } from "@/lib/api-client";
import type { StateRevisi, StatusUnggah } from "../types";

// ============================================================
// Aksi reducer
// ============================================================
type AksiRevisi =
  | { tipe: "MULAI_MUAT" }
  | { tipe: "SET_REVISI"; data: import("../types").ItemRevisi[] }
  | { tipe: "SET_GAGAL_MUAT"; pesan: string }
  | { tipe: "SET_STATUS_UNGGAH"; status: StatusUnggah }
  | { tipe: "SET_GAGAL_UNGGAH"; pesan: string; kuotaHabis?: boolean }
  | { tipe: "SET_SELESAI_UNGGAH"; auditIdBaru: string; data: import("../types").ItemRevisi[] }
  | { tipe: "RESET_UNGGAH" };

// ============================================================
// Reducer
// ============================================================
const STATE_AWAL: StateRevisi = {
  statusMuat: "idle",
  statusUnggah: "idle",
  revisi: [],
  pesanErrorMuat: null,
  pesanErrorUnggah: null,
  auditIdBaru: null,
  kuotaHabis: false,
};

function reducer(state: StateRevisi, aksi: AksiRevisi): StateRevisi {
  switch (aksi.tipe) {
    case "MULAI_MUAT":
      return { ...state, statusMuat: "memuat", pesanErrorMuat: null };
    case "SET_REVISI":
      return { ...state, statusMuat: "selesai", revisi: aksi.data };
    case "SET_GAGAL_MUAT":
      return { ...state, statusMuat: "gagal", pesanErrorMuat: aksi.pesan };
    case "SET_STATUS_UNGGAH":
      return { ...state, statusUnggah: aksi.status, pesanErrorUnggah: null, kuotaHabis: false };
    case "SET_GAGAL_UNGGAH":
      return {
        ...state,
        statusUnggah: "gagal",
        pesanErrorUnggah: aksi.pesan,
        kuotaHabis: aksi.kuotaHabis ?? false,
      };
    case "SET_SELESAI_UNGGAH":
      return {
        ...state,
        statusUnggah: "selesai",
        auditIdBaru: aksi.auditIdBaru,
        revisi: aksi.data,
        pesanErrorUnggah: null,
      };
    case "RESET_UNGGAH":
      return {
        ...state,
        statusUnggah: "idle",
        pesanErrorUnggah: null,
        auditIdBaru: null,
        kuotaHabis: false,
      };
    default:
      return state;
  }
}

// ============================================================
// Hook utama
// ============================================================
export function useRevisiDokumen(dokumenId: string) {
  const [state, dispatch] = useReducer(reducer, STATE_AWAL);
  const router = useRouter();

  // ------------------------------------------------------------
  // GET /dokumen-kontrak/:id/revisi — api.md 6.6
  // Muat riwayat semua versi dokumen, urut terlama ke terbaru
  // Dipanggil saat mount dari PanelRevisi
  // ------------------------------------------------------------
  const muatRiwayat = useCallback(async () => {
    dispatch({ tipe: "MULAI_MUAT" });
    try {
      const respons = await ambilRiwayatRevisi(dokumenId);
      dispatch({ tipe: "SET_REVISI", data: respons.data });
    } catch (err) {
      const pesan =
        err instanceof KesalahanAPI
          ? err.message
          : "Gagal memuat riwayat revisi. Coba muat ulang halaman.";
      dispatch({ tipe: "SET_GAGAL_MUAT", pesan });
    }
  }, [dokumenId]);

  // ------------------------------------------------------------
  // POST /dokumen-kontrak/:id/revisi — api.md 6.5
  // Unggah versi baru kontrak — audit ulang dijadwalkan otomatis
  // Setelah selesai: reload riwayat → redirect ke audit baru
  // ------------------------------------------------------------
  const unggah = useCallback(
    async (
      file: File,
      opsi?: { nama?: string; catatan_revisi?: string }
    ) => {
      dispatch({ tipe: "SET_STATUS_UNGGAH", status: "mengunggah" });

      try {
        await unggahRevisi(dokumenId, file, opsi);

        dispatch({ tipe: "SET_STATUS_UNGGAH", status: "memproses" });

        // Reload riwayat revisi supaya daftar terupdate
        const responsTerbaru = await ambilRiwayatRevisi(dokumenId);

        // audit_id dari item revisi terbaru — dipakai untuk redirect
        // api.md 6.5 tidak mengembalikan audit_id langsung karena audit
        // berjalan via job asinkron. Ambil dari riwayat setelah reload.
        const revisiTerbaru = responsTerbaru.data[responsTerbaru.data.length - 1];
        const auditIdRevisiTerbaru = revisiTerbaru?.audit_id ?? null;

        dispatch({
          tipe: "SET_SELESAI_UNGGAH",
          // Simpan audit_id (bukan dokumen_id) ke state untuk keperluan
          // komponen yang mungkin ingin menampilkan link ke hasil audit
          auditIdBaru: auditIdRevisiTerbaru ?? revisiTerbaru?.id ?? "",
          data: responsTerbaru.data,
        });

        // Redirect ke halaman detail audit setelah 1.5 detik
        setTimeout(() => {
          if (auditIdRevisiTerbaru) {
            router.push(`/audit/${auditIdRevisiTerbaru}`);
          }
          // Jika audit_id belum tersedia (job masih menunggu),
          // tetap di halaman ini — pengguna bisa lihat status di daftar revisi
        }, 1500);
      } catch (err) {
        const kuotaHabis =
          err instanceof KesalahanAPI && err.kode === KODE_ERROR.KUOTA_HABIS;
        const pesan = tangkapPesanError(err);
        dispatch({ tipe: "SET_GAGAL_UNGGAH", pesan, kuotaHabis });
      }
    },
    [dokumenId, router]
  );

  const resetUnggah = useCallback(() => {
    dispatch({ tipe: "RESET_UNGGAH" });
  }, []);

  return {
    state,
    muatRiwayat,
    unggah,
    resetUnggah,
  };
}

// ============================================================
// Helper: terjemahkan pesan error dari API ke Bahasa Indonesia
// Selaras kode error api.md Bagian 3 dan 6.5
// ============================================================
function tangkapPesanError(err: unknown): string {
  if (err instanceof KesalahanAPI) {
    switch (err.kode) {
      case KODE_ERROR.KUOTA_HABIS:
        return "Kuota auditmu bulan ini sudah habis. Upgrade ke Pro untuk audit tidak terbatas.";
      case KODE_ERROR.TIDAK_DITEMUKAN:
        return "Dokumen tidak ditemukan atau bukan milikmu.";
      case KODE_ERROR.FORMAT_FILE_TIDAK_DIDUKUNG:
        return "Format file tidak didukung. Gunakan PDF, JPG, PNG, atau WEBP.";
      case KODE_ERROR.UKURAN_FILE_MELEBIHI_BATAS:
        return "Ukuran file melebihi batas 10MB. Coba kompres file terlebih dahulu.";
      case KODE_ERROR.FILE_TIDAK_DAPAT_DIBACA:
        return "File tidak dapat dibaca. Pastikan file tidak rusak atau coba unggah ulang.";
      case KODE_ERROR.LAYANAN_TIDAK_TERSEDIA:
        return "Layanan AI sedang tidak tersedia. Kuotamu tidak berkurang — coba lagi dalam beberapa menit.";
      case KODE_ERROR.TERLALU_BANYAK_PERMINTAAN:
        return "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.";
      default:
        return err.message || "Terjadi kesalahan. Coba lagi.";
    }
  }
  if (err instanceof Error) return err.message;
  return "Terjadi kesalahan yang tidak diketahui. Coba lagi.";
}
