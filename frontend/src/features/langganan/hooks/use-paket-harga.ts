"use client";

// ============================================================
// usePaketHarga — fetch daftar paket harga
// GET /langganan/paket (api.md 9.1) — endpoint publik
// State machine: idle → memuat → selesai | gagal
// ============================================================

import { useCallback, useEffect, useReducer } from "react";
import { ambilPaketHarga } from "../services/langganan.service";
import { KesalahanAPI } from "@/lib/api-client";
import type { StatePaketHarga, PaketHarga } from "../types";

type AksiPaket =
  | { tipe: "MULAI_MUAT" }
  | { tipe: "SET_SELESAI"; paket: PaketHarga[] }
  | { tipe: "SET_GAGAL"; pesan: string };

const stateAwal: StatePaketHarga = {
  status: "idle",
  paket: [],
  pesanError: null,
};

function reducer(state: StatePaketHarga, aksi: AksiPaket): StatePaketHarga {
  switch (aksi.tipe) {
    case "MULAI_MUAT":
      return { ...stateAwal, status: "memuat" };
    case "SET_SELESAI":
      return { status: "selesai", paket: aksi.paket, pesanError: null };
    case "SET_GAGAL":
      return { status: "gagal", paket: [], pesanError: aksi.pesan };
    default:
      return state;
  }
}

export function usePaketHarga() {
  const [state, dispatch] = useReducer(reducer, stateAwal);

  const muat = useCallback(async () => {
    dispatch({ tipe: "MULAI_MUAT" });
    try {
      const paket = await ambilPaketHarga();
      dispatch({ tipe: "SET_SELESAI", paket });
    } catch (err) {
      const pesan =
        err instanceof KesalahanAPI
          ? err.message
          : "Gagal memuat daftar paket. Coba lagi.";
      dispatch({ tipe: "SET_GAGAL", pesan });
    }
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  return { state, muatUlang: muat };
}