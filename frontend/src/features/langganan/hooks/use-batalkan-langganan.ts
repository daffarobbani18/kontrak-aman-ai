"use client";

// ============================================================
// useBatalkanLangganan — POST /langganan/batalkan (api.md 9.4)
// State machine: idle → mengkonfirmasi → membatalkan → selesai | gagal
// Setelah selesai, memanggil callback onBerhasil untuk update parent
// ============================================================

import { useCallback, useState } from "react";
import { batalkanLangganan } from "../services/langganan.service";
import { KesalahanAPI } from "@/lib/api-client";
import type { StateBatalkanLangganan } from "../types";

const stateAwal: StateBatalkanLangganan = {
  status: "idle",
  pesanError: null,
  aktifHingga: null,
};

export function useBatalkanLangganan(opsi?: {
  onBerhasil?: (aktifHingga: string) => void;
}) {
  const [state, setState] = useState<StateBatalkanLangganan>(stateAwal);

  // Buka dialog konfirmasi
  const mintaKonfirmasi = useCallback(() => {
    setState({ status: "mengkonfirmasi", pesanError: null, aktifHingga: null });
  }, []);

  // Tutup dialog tanpa batalkan
  const batalkan = useCallback(() => {
    setState(stateAwal);
  }, []);

  // Eksekusi pembatalan setelah konfirmasi
  const konfirmasiBatalkan = useCallback(
    async (alasan?: string) => {
      setState((sebelumnya) => ({
        ...sebelumnya,
        status: "membatalkan",
        pesanError: null,
      }));

      try {
        const hasil = await batalkanLangganan(alasan);

        setState({
          status: "selesai",
          pesanError: null,
          aktifHingga: hasil.aktif_hingga,
        });

        opsi?.onBerhasil?.(hasil.aktif_hingga);

        // Reset ke idle setelah selesai
        setTimeout(() => setState(stateAwal), 300);
      } catch (err) {
        const pesan =
          err instanceof KesalahanAPI
            ? err.message
            : "Gagal membatalkan langganan. Coba lagi.";
        setState((sebelumnya) => ({
          ...sebelumnya,
          status: "gagal",
          pesanError: pesan,
        }));
      }
    },
    [opsi]
  );

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
    konfirmasiBatalkan,
    resetError,
    dialogTerbuka:
      state.status === "mengkonfirmasi" ||
      state.status === "membatalkan" ||
      state.status === "gagal",
    sedangMembatalkan: state.status === "membatalkan",
  };
}