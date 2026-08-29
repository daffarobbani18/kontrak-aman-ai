"use client";

// ============================================================
// useProfil — hook fetch + update profil pengguna
// State machine: idle → memuat → selesai | gagal
// Update: menyimpan → tersimpan | gagal-simpan
// Sesuai api.md 5.1, 5.2, 5.3
// ============================================================

import { useCallback, useEffect, useReducer } from "react";
import { ambilProfil } from "@/features/dashboard/services/dashboard.service";
import { perbaruhiProfil, ubahKataSandi } from "../services/profil.service";
import { KesalahanAPI } from "@/lib/api-client";
import type { DataProfilPengguna } from "@/features/dashboard/types";

// ============================================================
// State
// ============================================================
type StatusMuat = "idle" | "memuat" | "selesai" | "gagal";
type StatusSimpan = "idle" | "menyimpan" | "tersimpan" | "gagal";

interface StateProfil {
  statusMuat: StatusMuat;
  statusSimpanProfil: StatusSimpan;
  statusSimpanKataSandi: StatusSimpan;
  data: DataProfilPengguna | null;
  pesanError: string | null;
  pesanErrorKataSandi: string | null;
}

type AksiProfil =
  | { tipe: "MULAI_MUAT" }
  | { tipe: "SET_DATA"; data: DataProfilPengguna }
  | { tipe: "SET_GAGAL_MUAT"; pesan: string }
  | { tipe: "MULAI_SIMPAN_PROFIL" }
  | { tipe: "SET_PROFIL_TERSIMPAN"; namaBaru: string }
  | { tipe: "SET_GAGAL_SIMPAN_PROFIL"; pesan: string }
  | { tipe: "RESET_STATUS_PROFIL" }
  | { tipe: "MULAI_SIMPAN_KATA_SANDI" }
  | { tipe: "SET_KATA_SANDI_TERSIMPAN" }
  | { tipe: "SET_GAGAL_SIMPAN_KATA_SANDI"; pesan: string }
  | { tipe: "RESET_STATUS_KATA_SANDI" };

const stateAwal: StateProfil = {
  statusMuat: "idle",
  statusSimpanProfil: "idle",
  statusSimpanKataSandi: "idle",
  data: null,
  pesanError: null,
  pesanErrorKataSandi: null,
};

function reducer(state: StateProfil, aksi: AksiProfil): StateProfil {
  switch (aksi.tipe) {
    case "MULAI_MUAT":
      return { ...state, statusMuat: "memuat", pesanError: null };
    case "SET_DATA":
      return { ...state, statusMuat: "selesai", data: aksi.data };
    case "SET_GAGAL_MUAT":
      return { ...state, statusMuat: "gagal", pesanError: aksi.pesan };
    case "MULAI_SIMPAN_PROFIL":
      return { ...state, statusSimpanProfil: "menyimpan", pesanError: null };
    case "SET_PROFIL_TERSIMPAN":
      return {
        ...state,
        statusSimpanProfil: "tersimpan",
        data: state.data ? { ...state.data, nama_lengkap: aksi.namaBaru } : null,
      };
    case "SET_GAGAL_SIMPAN_PROFIL":
      return { ...state, statusSimpanProfil: "gagal", pesanError: aksi.pesan };
    case "RESET_STATUS_PROFIL":
      return { ...state, statusSimpanProfil: "idle", pesanError: null };
    case "MULAI_SIMPAN_KATA_SANDI":
      return { ...state, statusSimpanKataSandi: "menyimpan", pesanErrorKataSandi: null };
    case "SET_KATA_SANDI_TERSIMPAN":
      return { ...state, statusSimpanKataSandi: "tersimpan" };
    case "SET_GAGAL_SIMPAN_KATA_SANDI":
      return { ...state, statusSimpanKataSandi: "gagal", pesanErrorKataSandi: aksi.pesan };
    case "RESET_STATUS_KATA_SANDI":
      return { ...state, statusSimpanKataSandi: "idle", pesanErrorKataSandi: null };
    default:
      return state;
  }
}

// ============================================================
// Hook utama
// ============================================================
export function useProfil() {
  const [state, dispatch] = useReducer(reducer, stateAwal);

  // Muat data profil saat mount
  const muatProfil = useCallback(async () => {
    dispatch({ tipe: "MULAI_MUAT" });
    try {
      const respons = await ambilProfil();
      dispatch({ tipe: "SET_DATA", data: respons.data });
    } catch (err) {
      const pesan =
        err instanceof KesalahanAPI
          ? err.message
          : "Gagal memuat profil. Coba muat ulang halaman.";
      dispatch({ tipe: "SET_GAGAL_MUAT", pesan });
    }
  }, []);

  useEffect(() => {
    muatProfil();
  }, [muatProfil]);

  // PATCH /pengguna/saya — api.md 5.2
  const simpanProfil = useCallback(async (namaLengkap: string) => {
    dispatch({ tipe: "MULAI_SIMPAN_PROFIL" });
    try {
      await perbaruhiProfil(namaLengkap);
      dispatch({ tipe: "SET_PROFIL_TERSIMPAN", namaBaru: namaLengkap });
      // Auto reset status setelah 3 detik
      setTimeout(() => dispatch({ tipe: "RESET_STATUS_PROFIL" }), 3000);
    } catch (err) {
      const pesan =
        err instanceof KesalahanAPI
          ? err.message
          : "Gagal menyimpan profil. Coba lagi.";
      dispatch({ tipe: "SET_GAGAL_SIMPAN_PROFIL", pesan });
    }
  }, []);

  // POST /pengguna/saya/ubah-kata-sandi — api.md 5.3
  const simpanKataSandi = useCallback(
    async (
      kataSandiLama: string,
      kataSandiBaru: string,
      konfirmasiKataSandiBaru: string
    ) => {
      dispatch({ tipe: "MULAI_SIMPAN_KATA_SANDI" });
      try {
        await ubahKataSandi(kataSandiLama, kataSandiBaru, konfirmasiKataSandiBaru);
        dispatch({ tipe: "SET_KATA_SANDI_TERSIMPAN" });
        setTimeout(() => dispatch({ tipe: "RESET_STATUS_KATA_SANDI" }), 3000);
      } catch (err) {
        const pesan =
          err instanceof KesalahanAPI
            ? err.message
            : "Gagal mengubah kata sandi. Coba lagi.";
        dispatch({ tipe: "SET_GAGAL_SIMPAN_KATA_SANDI", pesan });
      }
    },
    []
  );

  const resetStatusKataSandi = useCallback(() => {
    dispatch({ tipe: "RESET_STATUS_KATA_SANDI" });
  }, []);

  return {
    state,
    muatProfil,
    simpanProfil,
    simpanKataSandi,
    resetStatusKataSandi,
  };
}