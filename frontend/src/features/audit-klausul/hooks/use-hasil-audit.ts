// ============================================================
// useHasilAudit — hook polling hasil audit
// State machine: idle → memuat → memproses → selesai | gagal
// Polling setiap 3 detik saat status masih memproses
// Sesuai PRD Alur Kritikal 1, langkah 6 dan 9
// ============================================================

"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { ambilHasilAudit } from "../services/audit-klausul.service";
import { ambilDetailDokumen } from "../services/dokumen-pratinjau.service";
import type { StateMuatAudit, StatusMuatAudit, HasilAuditSelesai, DetailDokumenKontrak } from "../types";
import { KesalahanAPI } from "@/lib/api-client";

const INTERVAL_POLLING_MS = 3000;

// State diperluas untuk menyimpan detail dokumen (termasuk url_pratinjau)
export interface StateMuatAuditLengkap extends StateMuatAudit {
  dokumen: DetailDokumenKontrak | null;
}

const stateAwalLengkap: StateMuatAuditLengkap = {
  status: "idle",
  data: null,
  progres: 0,
  pesanError: null,
  dokumen: null,
};

// ============================================================
// Reducer — state machine eksplisit
// ============================================================
type AksiAudit =
  | { tipe: "MULAI_MUAT" }
  | { tipe: "SET_MEMPROSES"; progres: number }
  | { tipe: "SET_SELESAI"; data: HasilAuditSelesai }
  | { tipe: "SET_DOKUMEN"; dokumen: DetailDokumenKontrak }
  | { tipe: "SET_GAGAL"; pesan: string }
  | { tipe: "RESET" };

function reducer(state: StateMuatAuditLengkap, aksi: AksiAudit): StateMuatAuditLengkap {
  switch (aksi.tipe) {
    case "MULAI_MUAT":
      return { ...stateAwalLengkap, status: "memuat" };
    case "SET_MEMPROSES":
      return { ...state, status: "memproses", progres: aksi.progres, pesanError: null };
    case "SET_SELESAI":
      return { ...state, status: "selesai", data: aksi.data, progres: 100, pesanError: null };
    case "SET_DOKUMEN":
      return { ...state, dokumen: aksi.dokumen };
    case "SET_GAGAL":
      return { ...state, status: "gagal", pesanError: aksi.pesan };
    case "RESET":
      return stateAwalLengkap;
    default:
      return state;
  }
}

// ============================================================
// Hook utama
// ============================================================
export function useHasilAudit(auditId: string | null) {
  const [state, dispatch] = useReducer(reducer, stateAwalLengkap);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sedangPollingRef = useRef(false);
  // Ref status terminal — menghindari stale closure di setInterval
  // Pola yang sama dengan use-buat-negosiasi.ts
  const statusTerminalRef = useRef(false);

  const bersihkanInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const muatData = useCallback(
    async (id: string) => {
      // Cegah panggilan bersamaan (race condition)
      if (sedangPollingRef.current) return;
      sedangPollingRef.current = true;

      try {
        const hasil = await ambilHasilAudit(id);

        if (hasil.status === "selesai") {
          statusTerminalRef.current = true;
          bersihkanInterval();
          dispatch({ tipe: "SET_SELESAI", data: hasil });
          // Fetch detail dokumen untuk url_pratinjau — tidak kritis,
          // kegagalan tidak menggagalkan tampilan hasil audit
          try {
            const detailDokumen = await ambilDetailDokumen(
              hasil.dokumen_kontrak_id
            );
            dispatch({ tipe: "SET_DOKUMEN", dokumen: detailDokumen });
          } catch {
            // url_pratinjau null → layout fallback ke satu kolom
          }
        } else if (hasil.status === "gagal") {
          statusTerminalRef.current = true;
          bersihkanInterval();
          dispatch({
            tipe: "SET_GAGAL",
            pesan: "Proses audit gagal. Silakan coba unggah ulang kontrakmu.",
          });
        } else {
          // masih memproses
          dispatch({ tipe: "SET_MEMPROSES", progres: hasil.progres_persen });
        }
      } catch (err) {
        statusTerminalRef.current = true;
        bersihkanInterval();
        if (err instanceof KesalahanAPI) {
          dispatch({ tipe: "SET_GAGAL", pesan: err.message });
        } else {
          dispatch({
            tipe: "SET_GAGAL",
            pesan: "Terjadi kesalahan saat mengambil hasil audit. Silakan coba lagi.",
          });
        }
      } finally {
        sedangPollingRef.current = false;
      }
    },
    [bersihkanInterval]
  );

  useEffect(() => {
    if (!auditId) return;

    dispatch({ tipe: "MULAI_MUAT" });

    // Reset ref terminal sebelum mulai siklus baru
    statusTerminalRef.current = false;

    // Panggil langsung sekali, lalu polling
    muatData(auditId);

    intervalRef.current = setInterval(() => {
      // Gunakan ref — bukan state dari closure lama (pola dari use-buat-negosiasi.ts)
      if (statusTerminalRef.current) {
        bersihkanInterval();
        return;
      }
      muatData(auditId);
    }, INTERVAL_POLLING_MS);

    return () => {
      bersihkanInterval();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditId]);

  // Hentikan polling saat state terminal tercapai
  useEffect(() => {
    if (state.status === "selesai" || state.status === "gagal") {
      bersihkanInterval();
    }
  }, [state.status, bersihkanInterval]);

  const muatUlang = useCallback(() => {
    if (!auditId) return;
    statusTerminalRef.current = false;
    bersihkanInterval();
    dispatch({ tipe: "RESET" });
    // Tunda sedikit supaya state reset dulu sebelum mulai muat
    setTimeout(() => {
      dispatch({ tipe: "MULAI_MUAT" });
      muatData(auditId);

      intervalRef.current = setInterval(() => {
        if (statusTerminalRef.current) {
          bersihkanInterval();
          return;
        }
        muatData(auditId);
      }, INTERVAL_POLLING_MS);
    }, 50);
  }, [auditId, muatData, bersihkanInterval]);

  return { state, muatUlang };
}