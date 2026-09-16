"use client";

// ============================================================
// useNotifikasi — hook notifikasi in-app
// F-NOTIF-01 PRD.md: notifikasi audit selesai (Must Have)
// F-NOTIF-02 PRD.md: pengingat tindak lanjut (Could Have)
//
// Arsitektur:
// - Fetch data dari notifikasi.service.ts (bukan dari DashboardContext)
// - Reducer dari notifikasi.utils.ts (tidak ada duplikasi)
// - Optimistic update untuk tandai dibaca — UI berubah langsung
//   tanpa menunggu API (bukan operasi kritis, tidak perlu rollback)
// ============================================================

import { useCallback, useEffect, useReducer } from "react";
import {
  ambilNotifikasi,
  tandaiDibaca as serviceTandaiDibaca,
  tandaiSemuaDibaca as serviceTandaiSemuaDibaca,
} from "../services/notifikasi.service";
import { reducer, stateAwalNotifikasi } from "../notifikasi.utils";

export function useNotifikasi() {
  const [state, dispatch] = useReducer(reducer, stateAwalNotifikasi);

  // ── Fetch notifikasi saat mount ──
  // Panggil GET /notifikasi (api.md 11.1) via service
  useEffect(() => {
    let dibatalkan = false;

    async function muatNotifikasi() {
      dispatch({ tipe: "SET_MEMUAT", nilai: true });
      try {
        const respons = await ambilNotifikasi({ limit: 20 });
        if (dibatalkan) return;

        // Tambahkan satu per satu — reducer TAMBAH menangani deduplikasi
        for (const item of respons.data) {
          dispatch({ tipe: "TAMBAH", item });
        }
      } catch {
        // Notifikasi adalah fitur non-kritis — gagal fetch tidak
        // boleh memblokir halaman. Cukup abaikan dan lanjut.
      } finally {
        if (!dibatalkan) {
          dispatch({ tipe: "SET_MEMUAT", nilai: false });
        }
      }
    }

    muatNotifikasi();

    return () => {
      dibatalkan = true;
    };
  }, []);

  // ── Tandai satu notifikasi dibaca ──
  // Optimistic: dispatch dulu, panggil API di background
  // PATCH /notifikasi/:id/baca (api.md 11.2)
  const tandaiDibaca = useCallback((id: string) => {
    dispatch({ tipe: "TANDAI_DIBACA", id });
    serviceTandaiDibaca(id).catch(() => {
      // Gagal di backend tidak di-rollback — notifikasi sudah
      // ditandai dibaca di UI, konsisten dengan UX yang diharapkan
    });
  }, []);

  // ── Tandai semua notifikasi dibaca ──
  // Optimistic: dispatch dulu, panggil API di background
  // PATCH /notifikasi/baca-semua (api.md 11.3)
  const tandaiSemuaDibaca = useCallback(() => {
    dispatch({ tipe: "TANDAI_SEMUA_DIBACA" });
    serviceTandaiSemuaDibaca().catch(() => {
      // Tidak di-rollback — sama seperti tandaiDibaca
    });
  }, []);

  // ── Hapus notifikasi dari tampilan ──
  // State lokal saja — tidak ada endpoint DELETE di api.md 11
  const hapusNotifikasi = useCallback((id: string) => {
    dispatch({ tipe: "HAPUS", id });
  }, []);

  return {
    state,
    tandaiDibaca,
    tandaiSemuaDibaca,
    hapusNotifikasi,
  };
}