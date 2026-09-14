"use client";

// ============================================================
// usePreferensiNotifikasi — hook preferensi notifikasi
// F-PROF-03 PRD.md: preferensi notifikasi (Could Have)
// GET  /pengguna/saya/preferensi-notifikasi (api.md 5.7)
// PATCH /pengguna/saya/preferensi-notifikasi (api.md 5.8)
//
// Pola state machine konsisten dengan use-profil.ts:
//   statusMuat: idle → memuat → selesai | gagal
//   statusSimpan: idle → menyimpan → tersimpan | gagal
//
// Auto-save per toggle: setiap perubahan satu field langsung
// trigger PATCH tanpa tombol simpan eksplisit.
// ============================================================

import { useCallback, useEffect, useReducer } from "react";
import {
  ambilPreferensiNotifikasi,
  perbaruiPreferensiNotifikasi,
} from "../services/preferensi-notifikasi.service";
import { KesalahanAPI } from "@/lib/api-client";
import type {
  StatePreferensiNotifikasi,
  PreferensiNotifikasiData,
  PayloadPerbaruiPreferensi,
} from "../types";

// ============================================================
// Aksi reducer
// ============================================================
type AksiPreferensi =
  | { tipe: "MULAI_MUAT" }
  | { tipe: "SET_DATA"; data: PreferensiNotifikasiData }
  | { tipe: "SET_GAGAL_MUAT"; pesan: string }
  | { tipe: "MULAI_SIMPAN" }
  | { tipe: "SET_TERSIMPAN"; data: PreferensiNotifikasiData }
  | { tipe: "SET_GAGAL_SIMPAN"; pesan: string }
  | { tipe: "RESET_STATUS_SIMPAN" };

// ============================================================
// Reducer
// ============================================================
const stateAwal: StatePreferensiNotifikasi = {
  statusMuat: "idle",
  statusSimpan: "idle",
  data: null,
  pesanError: null,
};

function reducer(
  state: StatePreferensiNotifikasi,
  aksi: AksiPreferensi
): StatePreferensiNotifikasi {
  switch (aksi.tipe) {
    case "MULAI_MUAT":
      return { ...state, statusMuat: "memuat", pesanError: null };
    case "SET_DATA":
      return { ...state, statusMuat: "selesai", data: aksi.data };
    case "SET_GAGAL_MUAT":
      return { ...state, statusMuat: "gagal", pesanError: aksi.pesan };
    case "MULAI_SIMPAN":
      return { ...state, statusSimpan: "menyimpan", pesanError: null };
    case "SET_TERSIMPAN":
      return { ...state, statusSimpan: "tersimpan", data: aksi.data };
    case "SET_GAGAL_SIMPAN":
      return { ...state, statusSimpan: "gagal", pesanError: aksi.pesan };
    case "RESET_STATUS_SIMPAN":
      return { ...state, statusSimpan: "idle", pesanError: null };
    default:
      return state;
  }
}

// ============================================================
// Hook utama
// ============================================================
export function usePreferensiNotifikasi() {
  const [state, dispatch] = useReducer(reducer, stateAwal);

  // ------------------------------------------------------------
  // GET /pengguna/saya/preferensi-notifikasi — api.md 5.7
  // Dipanggil saat mount
  // ------------------------------------------------------------
  const muatPreferensi = useCallback(async () => {
    dispatch({ tipe: "MULAI_MUAT" });
    try {
      const respons = await ambilPreferensiNotifikasi();
      dispatch({ tipe: "SET_DATA", data: respons.data });
    } catch (err) {
      const pesan =
        err instanceof KesalahanAPI
          ? err.message
          : "Gagal memuat preferensi notifikasi. Coba muat ulang halaman.";
      dispatch({ tipe: "SET_GAGAL_MUAT", pesan });
    }
  }, []);

  useEffect(() => {
    muatPreferensi();
  }, [muatPreferensi]);

  // ------------------------------------------------------------
  // PATCH /pengguna/saya/preferensi-notifikasi — api.md 5.8
  // Partial update — dipanggil per toggle, hanya kirim satu field
  // ------------------------------------------------------------
  const simpanPreferensi = useCallback(
    async (payload: PayloadPerbaruiPreferensi) => {
      dispatch({ tipe: "MULAI_SIMPAN" });
      try {
        const respons = await perbaruiPreferensiNotifikasi(payload);
        dispatch({ tipe: "SET_TERSIMPAN", data: respons.data });
        // Auto-reset status tersimpan setelah 3 detik — konsisten dengan use-profil.ts
        setTimeout(() => dispatch({ tipe: "RESET_STATUS_SIMPAN" }), 3000);
      } catch (err) {
        const pesan =
          err instanceof KesalahanAPI
            ? err.message
            : "Gagal menyimpan preferensi. Coba lagi.";
        dispatch({ tipe: "SET_GAGAL_SIMPAN", pesan });
      }
    },
    []
  );

  const resetStatusSimpan = useCallback(() => {
    dispatch({ tipe: "RESET_STATUS_SIMPAN" });
  }, []);

  return {
    state,
    muatPreferensi,
    simpanPreferensi,
    resetStatusSimpan,
  };
}
