"use client";

// ============================================================
// useLanggananAktif — fetch detail langganan aktif pengguna
// GET /langganan/aktif (api.md 9.3)
// data: null berarti pengguna tier gratis tanpa langganan aktif
// ============================================================

import { useCallback, useEffect, useReducer } from "react";
import { ambilLanggananAktif } from "../services/langganan.service";
import { KesalahanAPI } from "@/lib/api-client";
import type { StateLanggananAktif, LanggananAktif } from "../types";

type AksiLangganan =
  | { tipe: "MULAI_MUAT" }
  | { tipe: "SET_SELESAI"; data: LanggananAktif | null }
  | { tipe: "SET_GAGAL"; pesan: string };

const stateAwal: StateLanggananAktif = {
  status: "idle",
  data: null,
  pesanError: null,
};

function reducer(
  state: StateLanggananAktif,
  aksi: AksiLangganan
): StateLanggananAktif {
  switch (aksi.tipe) {
    case "MULAI_MUAT":
      return { ...stateAwal, status: "memuat" };
    case "SET_SELESAI":
      return { status: "selesai", data: aksi.data, pesanError: null };
    case "SET_GAGAL":
      return { status: "gagal", data: null, pesanError: aksi.pesan };
    default:
      return state;
  }
}

export function useLanggananAktif() {
  const [state, dispatch] = useReducer(reducer, stateAwal);

  const muat = useCallback(async () => {
    dispatch({ tipe: "MULAI_MUAT" });
    try {
      const data = await ambilLanggananAktif();
      dispatch({ tipe: "SET_SELESAI", data });
    } catch (err) {
      const pesan =
        err instanceof KesalahanAPI
          ? err.message
          : "Gagal memuat data langganan. Coba lagi.";
      dispatch({ tipe: "SET_GAGAL", pesan });
    }
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  // Perbarui state setelah batalkan berhasil tanpa reload halaman
  const tandaiBatalkan = useCallback((aktifHingga: string) => {
    if (state.data) {
      dispatch({
        tipe: "SET_SELESAI",
        data: { ...state.data, perbarui_otomatis: false, status: "dibatalkan", aktif_hingga: aktifHingga },
      });
    }
  }, [state.data]);

  return { state, muatUlang: muat, tandaiBatalkan };
}