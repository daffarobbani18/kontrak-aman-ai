"use client";

// ============================================================
// useBuatNegosiasi — hook state machine untuk buat draf negosiasi
// State machine: idle → meminta → memproses → selesai | gagal
// Polling GET /negosiasi/:id tiap 3 detik saat memproses
// Sesuai PRD Alur Kritikal 2, api.md 8.1 & 8.2
// ============================================================

import { useCallback, useEffect, useReducer, useRef } from "react";
import { mintaDrafNegosiasi, ambilHasilNegosiasi } from "../services/negosiasi.service";
import { KesalahanAPI, KODE_ERROR } from "@/lib/api-client";
import type {
  StateBuatNegosiasi,
  HasilNegosiasiSelesai,
  KodeErrorNegosiasi,
} from "../types";

const INTERVAL_POLLING_MS = 3000;

// ============================================================
// Reducer
// ============================================================
type AksiNegosiasi =
  | { tipe: "MULAI_MINTA" }
  | { tipe: "SET_MEMPROSES"; negosiasiId: string }
  | { tipe: "SET_SELESAI"; data: HasilNegosiasiSelesai }
  | { tipe: "SET_GAGAL"; pesan: string; kodeError: KodeErrorNegosiasi }
  | { tipe: "RESET" };

const stateAwal: StateBuatNegosiasi = {
  status: "idle",
  data: null,
  negosiasiId: null,
  pesanError: null,
  kodeError: null,
};

function reducer(
  state: StateBuatNegosiasi,
  aksi: AksiNegosiasi
): StateBuatNegosiasi {
  switch (aksi.tipe) {
    case "MULAI_MINTA":
      return { ...stateAwal, status: "meminta" };
    case "SET_MEMPROSES":
      return {
        ...state,
        status: "memproses",
        negosiasiId: aksi.negosiasiId,
        pesanError: null,
        kodeError: null,
      };
    case "SET_SELESAI":
      return {
        ...state,
        status: "selesai",
        data: aksi.data,
        pesanError: null,
        kodeError: null,
      };
    case "SET_GAGAL":
      return {
        ...state,
        status: "gagal",
        pesanError: aksi.pesan,
        kodeError: aksi.kodeError,
      };
    case "RESET":
      return stateAwal;
    default:
      return state;
  }
}

// ============================================================
// Petakan kode error API ke KodeErrorNegosiasi
// ============================================================
function petakanKodeError(err: unknown): {
  pesan: string;
  kodeError: KodeErrorNegosiasi;
} {
  if (err instanceof KesalahanAPI) {
    if (err.kode === KODE_ERROR.KUOTA_HABIS) {
      return {
        pesan:
          "Kuota draf negosiasi bulan ini sudah habis. Upgrade ke tier berbayar untuk melanjutkan.",
        kodeError: "KUOTA_HABIS",
      };
    }
    if (err.kode === KODE_ERROR.LANGGANAN_DIPERLUKAN) {
      return {
        pesan:
          "Fitur draf negosiasi memerlukan langganan Pro atau Bisnis.",
        kodeError: "LANGGANAN_DIPERLUKAN",
      };
    }
    // 409 KONFLIK — draf sudah ada untuk klausul ini
    // Kode ini tidak ada di KODE_ERROR, tangani lewat statusHttp
    if (err.statusHttp === 409) {
      return {
        pesan: "Draf negosiasi untuk klausul ini sudah pernah dibuat.",
        kodeError: "KONFLIK",
      };
    }
    return { pesan: err.message, kodeError: "UMUM" };
  }
  return {
    pesan: "Terjadi kesalahan. Silakan coba lagi.",
    kodeError: "UMUM",
  };
}

// ============================================================
// Hook utama
// ============================================================
export function useBuatNegosiasi() {
  const [state, dispatch] = useReducer(reducer, stateAwal);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sedangPollingRef = useRef(false);
  // Ref untuk melacak state terminal — hindari membaca state dari closure lama
  const statusTerminalRef = useRef(false);

  const bersihkanInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Polling GET /negosiasi/:id
  const polling = useCallback(
    async (negosiasiId: string) => {
      if (sedangPollingRef.current) return;
      sedangPollingRef.current = true;

      try {
        const hasil = await ambilHasilNegosiasi(negosiasiId);

        if (hasil.status === "selesai") {
          statusTerminalRef.current = true;
          bersihkanInterval();
          dispatch({ tipe: "SET_SELESAI", data: hasil });
        } else if (hasil.status === "gagal") {
          statusTerminalRef.current = true;
          bersihkanInterval();
          dispatch({
            tipe: "SET_GAGAL",
            pesan: "Pembuatan draf negosiasi gagal. Silakan coba lagi.",
            kodeError: "UMUM",
          });
        }
        // status memproses → lanjut polling
      } catch (err) {
        statusTerminalRef.current = true;
        bersihkanInterval();
        const { pesan, kodeError } = petakanKodeError(err);
        dispatch({ tipe: "SET_GAGAL", pesan, kodeError });
      } finally {
        sedangPollingRef.current = false;
      }
    },
    [bersihkanInterval]
  );

  // Hentikan polling saat state terminal
  useEffect(() => {
    if (state.status === "selesai" || state.status === "gagal") {
      bersihkanInterval();
    }
  }, [state.status, bersihkanInterval]);

  // Cleanup saat unmount
  useEffect(() => {
    return () => bersihkanInterval();
  }, [bersihkanInterval]);

  // Aksi utama — POST /negosiasi lalu mulai polling
  const buatNegosiasi = useCallback(
    async (klausulId: string, konteksTambahan?: string) => {
      // Reset ref status terminal sebelum mulai
      statusTerminalRef.current = false;
      dispatch({ tipe: "MULAI_MINTA" });

      try {
        const respons = await mintaDrafNegosiasi(klausulId, konteksTambahan);
        dispatch({ tipe: "SET_MEMPROSES", negosiasiId: respons.id });

        // Panggil sekali langsung
        await polling(respons.id);

        // Mulai interval polling hanya jika belum terminal
        // Gunakan ref — bukan state dari closure lama
        if (!statusTerminalRef.current) {
          intervalRef.current = setInterval(() => {
            if (statusTerminalRef.current) {
              bersihkanInterval();
              return;
            }
            polling(respons.id);
          }, INTERVAL_POLLING_MS);
        }
      } catch (err) {
        statusTerminalRef.current = true;
        const { pesan, kodeError } = petakanKodeError(err);
        dispatch({ tipe: "SET_GAGAL", pesan, kodeError });
      }
    },
    [polling, bersihkanInterval]
  );

  const reset = useCallback(() => {
    statusTerminalRef.current = false;
    bersihkanInterval();
    dispatch({ tipe: "RESET" });
  }, [bersihkanInterval]);

  return { state, buatNegosiasi, reset };
}