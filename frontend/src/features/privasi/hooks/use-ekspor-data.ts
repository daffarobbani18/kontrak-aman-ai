"use client";

// ============================================================
// useEksporData — state machine alur ekspor data pribadi
// F-PRIV-03 PRD.md: hak subjek data sesuai UU PDP
// POST /pengguna/saya/ekspor-data (api.md 5.5)
// GET  /pengguna/saya/ekspor-data/status (api.md 5.6)
//
// Alur: idle → mengajukan → memproses (polling) → selesai | gagal
//
// Polling GET /ekspor-data/status setiap INTERVAL_POLL_MS selama
// status backend masih "memproses". Berhenti otomatis saat selesai
// atau saat komponen unmount (cleanup via useEffect return).
//
// Untuk disambungkan ke backend:
//   Cukup set NEXT_PUBLIC_MOCK_AUTH=false — service sudah siap
// ============================================================

import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  ajukanEksporData,
  ambilStatusEkspor,
} from "../services/privasi.service";
import { KesalahanAPI } from "@/lib/api-client";
import type { StateEksporData } from "../types";

// Interval polling 5 detik — sesuai UX yang wajar untuk operasi async
// PRD.md: backend menyiapkan berkas lalu kirim tautan ke email
const INTERVAL_POLL_MS = 5000;

// ============================================================
// Reducer
// ============================================================
type AksiEksporData =
  | { tipe: "MULAI_AJUKAN" }
  | { tipe: "SET_MEMPROSES"; estimasiMenit: number; dimintaPada: string }
  | { tipe: "SET_SELESAI" }
  | { tipe: "SET_GAGAL"; pesan: string }
  | { tipe: "RESET" };

const STATE_AWAL: StateEksporData = {
  status: "idle",
  pesanError: null,
  estimasiMenit: null,
  dimintaPada: null,
};

function reducer(
  state: StateEksporData,
  aksi: AksiEksporData
): StateEksporData {
  switch (aksi.tipe) {
    case "MULAI_AJUKAN":
      return { ...state, status: "mengajukan", pesanError: null };
    case "SET_MEMPROSES":
      return {
        ...state,
        status: "memproses",
        pesanError: null,
        estimasiMenit: aksi.estimasiMenit,
        dimintaPada: aksi.dimintaPada,
      };
    case "SET_SELESAI":
      return { ...state, status: "selesai", pesanError: null };
    case "SET_GAGAL":
      return { ...state, status: "gagal", pesanError: aksi.pesan };
    case "RESET":
      return STATE_AWAL;
    default:
      return state;
  }
}

// ============================================================
// Hook utama
// ============================================================
export function useEksporData() {
  const [state, dispatch] = useReducer(reducer, STATE_AWAL);

  // Ref untuk interval polling — dibersihkan saat unmount atau selesai
  const refInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Bersihkan interval saat komponen unmount
  useEffect(() => {
    return () => {
      if (refInterval.current) {
        clearInterval(refInterval.current);
        refInterval.current = null;
      }
    };
  }, []);

  // ── Fungsi polling status ──
  // Dipanggil berulang via setInterval saat status "memproses"
  // GET /pengguna/saya/ekspor-data/status (api.md 5.6)
  const pollStatus = useCallback(async () => {
    try {
      const respons = await ambilStatusEkspor();
      const statusBackend = respons.data.status;

      if (statusBackend === "selesai") {
        // Hentikan polling, tampilkan konfirmasi email terkirim
        if (refInterval.current) {
          clearInterval(refInterval.current);
          refInterval.current = null;
        }
        dispatch({ tipe: "SET_SELESAI" });
      }
      // Jika masih "memproses", biarkan interval jalan terus
      // Jika "tidak_ada", ini state tidak normal saat polling — abaikan
    } catch {
      // Gagal polling tidak langsung error — coba lagi di interval berikutnya
      // Jika terlalu banyak gagal, backend akan timeout dan dispatch SET_GAGAL
    }
  }, []);

  // ── Ajukan permintaan ekspor ──
  // POST /pengguna/saya/ekspor-data (api.md 5.5)
  const ajukan = useCallback(async () => {
    dispatch({ tipe: "MULAI_AJUKAN" });

    try {
      const respons = await ajukanEksporData();
      dispatch({
        tipe: "SET_MEMPROSES",
        estimasiMenit: respons.data.estimasi_selesai_menit,
        dimintaPada: respons.data.diminta_pada,
      });

      // Mulai polling GET /ekspor-data/status
      // PRD.md: backend memproses async, frontend polling untuk tahu kapan selesai
      refInterval.current = setInterval(pollStatus, INTERVAL_POLL_MS);
    } catch (err) {
      let pesan = "Gagal mengajukan permintaan ekspor data. Coba lagi.";

      if (err instanceof KesalahanAPI) {
        if (err.statusHttp === 429) {
          // api.md 5.5: 429 jika sudah ada permintaan yang sedang diproses
          pesan =
            "Permintaan ekspor data sedang diproses. Tunggu hingga selesai sebelum mengajukan permintaan baru.";
        } else {
          pesan = err.message;
        }
      }

      dispatch({ tipe: "SET_GAGAL", pesan });
    }
  }, [pollStatus]);

  // ── Reset ke state awal ──
  // Dipakai tombol "Coba Lagi" atau "Minta Ekspor Ulang"
  const reset = useCallback(() => {
    if (refInterval.current) {
      clearInterval(refInterval.current);
      refInterval.current = null;
    }
    dispatch({ tipe: "RESET" });
  }, []);

  return {
    state,
    ajukan,
    reset,
  };
}
