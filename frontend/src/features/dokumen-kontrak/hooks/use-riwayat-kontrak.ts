"use client";

// ============================================================
// useRiwayatKontrak — hook fetch daftar kontrak + paginasi + filter
// Memanggil GET /dokumen-kontrak (api.md 6.2)
// State machine: idle → memuat → selesai | gagal
// Paginasi cursor-based sesuai api.md Bagian 1
// ============================================================

import { useCallback, useReducer } from "react";
import { ambilDaftarDokumen } from "@/features/dashboard/services/dashboard.service";
import { KesalahanAPI } from "@/lib/api-client";
import type { ItemDokumenKontrak, DataPaginasi, StatusDokumen } from "@/features/dashboard/types";

// ============================================================
// Tipe filter — sesuai query parameter api.md 6.2
// ============================================================
export type FilterStatus = StatusDokumen | "semua";

// ============================================================
// State machine
// ============================================================
type StatusMuat = "idle" | "memuat" | "memuat-lebih" | "selesai" | "gagal";

// Jumlah per filter — disimpan dari data "semua" supaya
// tombol filter tidak hilang saat filter lain aktif
export type JumlahPerFilter = Record<FilterStatus, number>;

interface StateRiwayat {
  status: StatusMuat;
  dokumen: ItemDokumenKontrak[];
  paginasi: DataPaginasi | null;
  filterAktif: FilterStatus;
  pesanError: string | null;
  jumlahPerFilter: JumlahPerFilter;
}

type AksiRiwayat =
  | { tipe: "MULAI_MUAT"; filter: FilterStatus }
  | { tipe: "MULAI_MUAT_LEBIH" }
  | { tipe: "SET_SELESAI"; dokumen: ItemDokumenKontrak[]; paginasi: DataPaginasi; tambah: boolean; filter: FilterStatus }
  | { tipe: "SET_GAGAL"; pesan: string }
  | { tipe: "GANTI_FILTER"; filter: FilterStatus }
  // Hapus dokumen dari list setelah DELETE /dokumen-kontrak/:id berhasil
  | { tipe: "HAPUS_DOKUMEN"; dokumenId: string };

const jumlahAwal: JumlahPerFilter = {
  semua: 0,
  selesai: 0,
  memproses: 0,
  menunggu: 0,
  gagal: 0,
};

const stateAwal: StateRiwayat = {
  status: "idle",
  dokumen: [],
  paginasi: null,
  filterAktif: "semua",
  pesanError: null,
  jumlahPerFilter: jumlahAwal,
};

function reducer(state: StateRiwayat, aksi: AksiRiwayat): StateRiwayat {
  switch (aksi.tipe) {
    case "MULAI_MUAT":
      return {
        ...stateAwal,
        status: "memuat",
        filterAktif: aksi.filter,
        // Pertahankan jumlahPerFilter supaya tab filter tidak menghilang
        // saat sedang memuat ulang data dengan filter berbeda
        jumlahPerFilter: state.jumlahPerFilter,
      };
    case "MULAI_MUAT_LEBIH":
      return { ...state, status: "memuat-lebih" };
    case "SET_SELESAI": {
      const dokumenBaru = aksi.tambah ? [...state.dokumen, ...aksi.dokumen] : aksi.dokumen;
      // Hitung ulang jumlah per filter hanya saat filter "semua" aktif
      // supaya tombol filter selalu terlihat walau filter lain sedang aktif
      // Jumlah per filter hanya diperbarui dari data filter "semua"
      // supaya snapshot tab filter konsisten dan tidak hilang saat
      // pengguna berpindah ke filter spesifik.
      // Catatan: penghitungan per-status dari array lokal hanya akurat
      // bila semua dokumen termuat (< 1 halaman). Untuk data banyak,
      // backend perlu endpoint agregasi — catat di API-yang-dibutuhkan.md
      // bila diperlukan ke depannya.
      const jumlahBaru: JumlahPerFilter =
        aksi.filter === "semua"
          ? {
              semua: aksi.paginasi.total,
              selesai: dokumenBaru.filter((d) => d.status === "selesai").length,
              memproses: dokumenBaru.filter((d) => d.status === "memproses").length,
              menunggu: dokumenBaru.filter((d) => d.status === "menunggu").length,
              gagal: dokumenBaru.filter((d) => d.status === "gagal").length,
            }
          : state.jumlahPerFilter; // pertahankan snapshot saat filter spesifik aktif
      return {
        ...state,
        status: "selesai",
        dokumen: dokumenBaru,
        paginasi: aksi.paginasi,
        pesanError: null,
        jumlahPerFilter: jumlahBaru,
      };
    }
    case "SET_GAGAL":
      return { ...state, status: "gagal", pesanError: aksi.pesan };
    case "GANTI_FILTER":
      return { ...state, filterAktif: aksi.filter };
    case "HAPUS_DOKUMEN": {
      const dokumenBaru = state.dokumen.filter((d) => d.id !== aksi.dokumenId);
      const totalBaru = Math.max(0, (state.paginasi?.total ?? 0) - 1);
      return {
        ...state,
        dokumen: dokumenBaru,
        paginasi: state.paginasi
          ? { ...state.paginasi, total: totalBaru }
          : null,
        // Perbarui jumlah per filter berdasarkan dokumen yang baru dihapus
        jumlahPerFilter: {
          ...state.jumlahPerFilter,
          semua: Math.max(0, state.jumlahPerFilter.semua - 1),
        },
      };
    }
    default:
      return state;
  }
}

const LIMIT_PER_HALAMAN = 20;

// ============================================================
// Hook utama
// ============================================================
export function useRiwayatKontrak() {
  const [state, dispatch] = useReducer(reducer, stateAwal);

  // Muat data pertama kali atau saat filter berubah
  const muat = useCallback(async (filter: FilterStatus = "semua") => {
    dispatch({ tipe: "MULAI_MUAT", filter });

    try {
      const opsi =
        filter === "semua"
          ? { limit: LIMIT_PER_HALAMAN }
          : { status: filter as StatusDokumen, limit: LIMIT_PER_HALAMAN };

      const respons = await ambilDaftarDokumen(opsi);

      dispatch({
        tipe: "SET_SELESAI",
        dokumen: respons.data,
        paginasi: respons.paginasi,
        tambah: false,
        filter,
      });
    } catch (err) {
      const pesan =
        err instanceof KesalahanAPI
          ? err.message
          : "Gagal memuat riwayat kontrak. Coba muat ulang halaman.";
      dispatch({ tipe: "SET_GAGAL", pesan });
    }
  }, []);

  // Muat halaman berikutnya — append ke daftar yang sudah ada
  const muatLebih = useCallback(async () => {
    if (!state.paginasi?.ada_lagi || !state.paginasi.cursor_berikutnya) return;
    if (state.status === "memuat-lebih") return;

    dispatch({ tipe: "MULAI_MUAT_LEBIH" });

    try {
      const opsi =
        state.filterAktif === "semua"
          ? {
              limit: LIMIT_PER_HALAMAN,
              cursor: state.paginasi.cursor_berikutnya,
            }
          : {
              status: state.filterAktif as StatusDokumen,
              limit: LIMIT_PER_HALAMAN,
              cursor: state.paginasi.cursor_berikutnya,
            };

      const respons = await ambilDaftarDokumen(opsi);

      dispatch({
        tipe: "SET_SELESAI",
        dokumen: respons.data,
        paginasi: respons.paginasi,
        tambah: true,
        filter: state.filterAktif,
      });
    } catch (err) {
      const pesan =
        err instanceof KesalahanAPI
          ? err.message
          : "Gagal memuat lebih banyak kontrak. Coba lagi.";
      dispatch({ tipe: "SET_GAGAL", pesan });
    }
  }, [state.paginasi, state.status, state.filterAktif]);

  // Ganti filter — reset ke halaman pertama
  const gantiFilter = useCallback(
    async (filter: FilterStatus) => {
      if (filter === state.filterAktif) return;
      dispatch({ tipe: "GANTI_FILTER", filter });
      await muat(filter);
    },
    [state.filterAktif, muat]
  );

  const muatUlang = useCallback(() => muat(state.filterAktif), [muat, state.filterAktif]);

  // Hapus dokumen dari list — dipanggil oleh useHapusDokumen lewat callback onBerhasil
  const hapusDokumenDariList = useCallback((dokumenId: string) => {
    dispatch({ tipe: "HAPUS_DOKUMEN", dokumenId });
  }, []);

  return {
    state,
    muat,
    muatLebih,
    gantiFilter,
    muatUlang,
    hapusDokumenDariList,
  };
}