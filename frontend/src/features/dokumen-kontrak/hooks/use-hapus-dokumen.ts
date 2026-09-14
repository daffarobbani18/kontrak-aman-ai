"use client";

// ============================================================
// useHapusDokumen — hook state machine untuk hapus dokumen
// Memanggil DELETE /dokumen-kontrak/:id (api.md 6.4)
// State: idle → mengkonfirmasi → menghapus → selesai | gagal
// ============================================================

import { useCallback, useState } from "react";
import { hapusDokumen } from "@/features/dokumen-kontrak/services/dokumen-kontrak.service";
import { KesalahanAPI } from "@/lib/api-client";

// ============================================================
// Tipe state machine
// ============================================================
export type StatusHapus = "idle" | "mengkonfirmasi" | "menghapus" | "selesai" | "gagal";

export interface StateHapusDokumen {
  status: StatusHapus;
  pesanError: string | null;
  // ID dokumen yang sedang dalam proses konfirmasi/hapus
  dokumenIdTarget: string | null;
  namaDokumenTarget: string | null;
}

const stateAwal: StateHapusDokumen = {
  status: "idle",
  pesanError: null,
  dokumenIdTarget: null,
  namaDokumenTarget: null,
};

// ============================================================
// Hook utama
// ============================================================
export function useHapusDokumen(opsi?: {
  // Callback setelah hapus berhasil — untuk update list di parent
  onBerhasil?: (dokumenId: string) => void;
}) {
  const [state, setState] = useState<StateHapusDokumen>(stateAwal);

  // Buka dialog konfirmasi untuk dokumen tertentu
  const mintaKonfirmasi = useCallback(
    (dokumenId: string, namaDokumen: string) => {
      setState({
        status: "mengkonfirmasi",
        pesanError: null,
        dokumenIdTarget: dokumenId,
        namaDokumenTarget: namaDokumen,
      });
    },
    []
  );

  // Batalkan — tutup dialog, kembali ke idle
  const batalkan = useCallback(() => {
    setState(stateAwal);
  }, []);

  // Konfirmasi dan eksekusi penghapusan
  const konfirmasiHapus = useCallback(async () => {
    const { dokumenIdTarget } = state;
    if (!dokumenIdTarget) return;

    setState((sebelumnya) => ({
      ...sebelumnya,
      status: "menghapus",
      pesanError: null,
    }));

    try {
      await hapusDokumen(dokumenIdTarget);

      setState({
        status: "selesai",
        pesanError: null,
        dokumenIdTarget: null,
        namaDokumenTarget: null,
      });

      // Beri tahu parent supaya list diupdate
      opsi?.onBerhasil?.(dokumenIdTarget);

      // Reset ke idle setelah selesai supaya hook siap dipakai lagi
      setTimeout(() => {
        setState(stateAwal);
      }, 300);
    } catch (err) {
      const pesan =
        err instanceof KesalahanAPI
          ? err.message
          : "Gagal menghapus dokumen. Coba lagi.";

      setState((sebelumnya) => ({
        ...sebelumnya,
        status: "gagal",
        pesanError: pesan,
      }));
    }
  }, [state, opsi]);

  // Reset error supaya pengguna bisa coba lagi tanpa menutup dialog
  const resetError = useCallback(() => {
    setState((sebelumnya) => ({
      ...sebelumnya,
      status: "mengkonfirmasi",
      pesanError: null,
    }));
  }, []);

  return {
    state,
    mintaKonfirmasi,
    batalkan,
    konfirmasiHapus,
    resetError,
    // Shorthand untuk kemudahan pengecekan di komponen
    sedangMenghapus: state.status === "menghapus",
    dialogTerbuka:
      state.status === "mengkonfirmasi" ||
      state.status === "menghapus" ||
      state.status === "gagal",
  };
}