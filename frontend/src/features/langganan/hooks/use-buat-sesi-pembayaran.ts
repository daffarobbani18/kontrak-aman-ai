"use client";

// ============================================================
// useBuatSesiPembayaran — POST /langganan/buat-sesi-pembayaran
// api.md 9.2 — mendapat url_checkout Mayar lalu redirect
// State machine: idle → memproses → (redirect) | gagal
// Tidak ada state "selesai" — sukses = redirect ke Mayar
// Mode mock: url_checkout mengarah ke /langganan?status=berhasil
// ============================================================

import { useCallback, useReducer } from "react";
import { buatSesiPembayaran } from "../services/langganan.service";
import { KesalahanAPI } from "@/lib/api-client";
import type { StateBuatSesiPembayaran, IdPaket, Periode } from "../types";

type AksiBuatSesi =
  | { tipe: "MULAI_PROSES"; paketId: IdPaket }
  | { tipe: "SET_GAGAL"; pesan: string }
  | { tipe: "RESET" };

const stateAwal: StateBuatSesiPembayaran = {
  status: "idle",
  paketIdDiproses: null,
  pesanError: null,
};

function reducer(
  state: StateBuatSesiPembayaran,
  aksi: AksiBuatSesi
): StateBuatSesiPembayaran {
  switch (aksi.tipe) {
    case "MULAI_PROSES":
      return { status: "memproses", paketIdDiproses: aksi.paketId, pesanError: null };
    case "SET_GAGAL":
      return { status: "gagal", paketIdDiproses: null, pesanError: aksi.pesan };
    case "RESET":
      return stateAwal;
    default:
      return state;
  }
}

export function useBuatSesiPembayaran() {
  const [state, dispatch] = useReducer(reducer, stateAwal);

  const mulaiPembayaran = useCallback(
    async (paketId: IdPaket, periode: Periode = "bulanan") => {
      dispatch({ tipe: "MULAI_PROSES", paketId });

      try {
        const sesi = await buatSesiPembayaran(paketId, periode);

        // Redirect ke halaman checkout Mayar
        // Mode mock: url_checkout = /langganan?status=berhasil&mock=true
        // Mode produksi: url_checkout = https://mayar.id/pay/checkout/...
        window.location.href = sesi.url_checkout;
      } catch (err) {
        const pesan =
          err instanceof KesalahanAPI
            ? err.message
            : "Gagal memulai proses pembayaran. Coba lagi.";
        dispatch({ tipe: "SET_GAGAL", pesan });
      }
    },
    []
  );

  const reset = useCallback(() => dispatch({ tipe: "RESET" }), []);

  return {
    state,
    mulaiPembayaran,
    reset,
    sedangMemproses: state.status === "memproses",
  };
}