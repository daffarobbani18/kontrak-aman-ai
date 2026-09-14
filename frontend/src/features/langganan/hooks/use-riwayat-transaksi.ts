"use client";

// ============================================================
// useRiwayatTransaksi — fetch riwayat transaksi pembayaran
// GET /langganan/transaksi (api.md 9.5)
// Paginasi cursor-based sesuai api.md Bagian 1
// ============================================================

import { useCallback, useReducer } from "react";
import { ambilRiwayatTransaksi } from "../services/langganan.service";
import { KesalahanAPI } from "@/lib/api-client";
import type { StateRiwayatTransaksi, ItemTransaksi } from "../types";
import type { DataPaginasi } from "@/features/dashboard/types";

const LIMIT_PER_HALAMAN = 20;

type AksiTransaksi =
  | { tipe: "MULAI_MUAT" }
  | { tipe: "MULAI_MUAT_LEBIH" }
  | { tipe: "SET_SELESAI"; transaksi: ItemTransaksi[]; paginasi: DataPaginasi; tambah: boolean }
  | { tipe: "SET_GAGAL"; pesan: string };

const stateAwal: StateRiwayatTransaksi = {
  status: "idle",
  transaksi: [],
  paginasi: null,
  pesanError: null,
  sedangMemuatLebih: false,
};

function reducer(
  state: StateRiwayatTransaksi,
  aksi: AksiTransaksi
): StateRiwayatTransaksi {
  switch (aksi.tipe) {
    case "MULAI_MUAT":
      return { ...stateAwal, status: "memuat" };
    case "MULAI_MUAT_LEBIH":
      return { ...state, status: "memuat-lebih", sedangMemuatLebih: true };
    case "SET_SELESAI": {
      const transaksi = aksi.tambah
        ? [...state.transaksi, ...aksi.transaksi]
        : aksi.transaksi;
      return {
        status: "selesai",
        transaksi,
        paginasi: aksi.paginasi,
        pesanError: null,
        sedangMemuatLebih: false,
      };
    }
    case "SET_GAGAL":
      return { ...state, status: "gagal", pesanError: aksi.pesan, sedangMemuatLebih: false };
    default:
      return state;
  }
}

export function useRiwayatTransaksi() {
  const [state, dispatch] = useReducer(reducer, stateAwal);

  const muat = useCallback(async () => {
    dispatch({ tipe: "MULAI_MUAT" });
    try {
      const hasil = await ambilRiwayatTransaksi({ limit: LIMIT_PER_HALAMAN });
      dispatch({
        tipe: "SET_SELESAI",
        transaksi: hasil.data,
        paginasi: hasil.paginasi,
        tambah: false,
      });
    } catch (err) {
      const pesan =
        err instanceof KesalahanAPI
          ? err.message
          : "Gagal memuat riwayat transaksi. Coba lagi.";
      dispatch({ tipe: "SET_GAGAL", pesan });
    }
  }, []);

  const muatLebih = useCallback(async () => {
    if (!state.paginasi?.ada_lagi || !state.paginasi.cursor_berikutnya) return;
    if (state.status === "memuat-lebih") return;

    dispatch({ tipe: "MULAI_MUAT_LEBIH" });
    try {
      const hasil = await ambilRiwayatTransaksi({
        limit: LIMIT_PER_HALAMAN,
        cursor: state.paginasi.cursor_berikutnya,
      });
      dispatch({
        tipe: "SET_SELESAI",
        transaksi: hasil.data,
        paginasi: hasil.paginasi,
        tambah: true,
      });
    } catch (err) {
      const pesan =
        err instanceof KesalahanAPI
          ? err.message
          : "Gagal memuat lebih banyak transaksi.";
      dispatch({ tipe: "SET_GAGAL", pesan });
    }
  }, [state.paginasi, state.status]);

  return { state, muat, muatLebih };
}