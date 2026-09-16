"use client";

// ============================================================
// useHapusAkun — state machine konfirmasi + eksekusi hapus akun
// DELETE /pengguna/saya (api.md 5.4)
// idle → mengkonfirmasi → memproses → selesai | gagal
// ============================================================

import { useCallback, useReducer } from "react";
import { useRouter } from "next/navigation";
import { hapusAkun } from "../services/privasi.service";
import { KesalahanAPI } from "@/lib/api-client";
import type { StateHapusAkun } from "../types";

type AksiHapusAkun =
  | { tipe: "BUKA_KONFIRMASI" }
  | { tipe: "TUTUP_KONFIRMASI" }
  | { tipe: "MULAI_PROSES" }
  | { tipe: "SET_SELESAI"; tanggalHapusPermanen: string }
  | { tipe: "SET_GAGAL"; pesan: string }
  | { tipe: "RESET" };

const STATE_AWAL: StateHapusAkun = {
  status: "idle",
  pesanError: null,
  tanggalHapusPermanen: null,
};

function reducer(state: StateHapusAkun, aksi: AksiHapusAkun): StateHapusAkun {
  switch (aksi.tipe) {
    case "BUKA_KONFIRMASI":
      return { ...state, status: "mengkonfirmasi", pesanError: null };
    case "TUTUP_KONFIRMASI":
      return { ...state, status: "idle", pesanError: null };
    case "MULAI_PROSES":
      return { ...state, status: "memproses", pesanError: null };
    case "SET_SELESAI":
      return { ...state, status: "selesai", tanggalHapusPermanen: aksi.tanggalHapusPermanen };
    case "SET_GAGAL":
      return { ...state, status: "gagal", pesanError: aksi.pesan };
    case "RESET":
      return STATE_AWAL;
    default:
      return state;
  }
}

export function useHapusAkun() {
  const [state, dispatch] = useReducer(reducer, STATE_AWAL);
  const router = useRouter();

  const bukaKonfirmasi = useCallback(() => {
    dispatch({ tipe: "BUKA_KONFIRMASI" });
  }, []);

  const tutupKonfirmasi = useCallback(() => {
    dispatch({ tipe: "TUTUP_KONFIRMASI" });
  }, []);

  // DELETE /pengguna/saya — api.md 5.4
  const eksekusiHapus = useCallback(
    async (konfirmasi: string, kataSandi: string) => {
      dispatch({ tipe: "MULAI_PROSES" });
      try {
        const respons = await hapusAkun(konfirmasi, kataSandi);
        dispatch({
          tipe: "SET_SELESAI",
          tanggalHapusPermanen: respons.data.dihapus_pada,
        });

        // Delay singkat agar pengguna bisa baca pesan sukses
        setTimeout(() => {
          router.push("/masuk");
        }, 2000);
      } catch (err) {
        const pesan =
          err instanceof KesalahanAPI
            ? err.message
            : "Gagal menghapus akun. Coba lagi.";
        dispatch({ tipe: "SET_GAGAL", pesan });
      }
    },
    [router]
  );

  const resetError = useCallback(() => {
    dispatch({ tipe: "RESET" });
  }, []);

  return {
    state,
    bukaKonfirmasi,
    tutupKonfirmasi,
    eksekusiHapus,
    resetError,
  };
}