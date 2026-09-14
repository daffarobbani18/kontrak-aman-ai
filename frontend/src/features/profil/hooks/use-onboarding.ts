"use client";

// ============================================================
// useOnboarding — state machine onboarding pemilihan profesi
// F-PROF-01 PRD.md: onboarding pemilihan profesi (Should Have)
// PATCH /pengguna/saya (api.md 5.2) — field profesi + onboarding_selesai
//
// Perubahan dari versi sebelumnya:
// - simpan() dan lewati() sekarang memanggil simpanOnboarding() via API
//   menggantikan penyimpanan localStorage
// - Error handling sesuai pola KesalahanAPI — jika gagal, tampilkan
//   pesanError dan tidak redirect sampai berhasil
// - lewati() tetap async agar error API bisa ditangani dengan benar
// ============================================================

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { simpanOnboarding } from "../services/profil.service";
import { KesalahanAPI } from "@/lib/api-client";
import type { NilaiProfesi } from "../types";

type StatusOnboarding = "idle" | "menyimpan" | "selesai" | "gagal";

interface StateOnboarding {
  profesiTerpilih: NilaiProfesi | null;
  status: StatusOnboarding;
  pesanError: string | null;
}

export function useOnboarding() {
  const router = useRouter();
  const [state, setState] = useState<StateOnboarding>({
    profesiTerpilih: null,
    status: "idle",
    pesanError: null,
  });

  const pilihProfesi = useCallback((nilai: NilaiProfesi) => {
    setState((prev) => ({ ...prev, profesiTerpilih: nilai, pesanError: null }));
  }, []);

  // Simpan profesi ke backend via PATCH /pengguna/saya (api.md 5.2)
  // Menggantikan localStorage — data tersimpan permanen di akun pengguna
  const simpan = useCallback(async () => {
    if (!state.profesiTerpilih) return;

    setState((prev) => ({ ...prev, status: "menyimpan", pesanError: null }));

    try {
      await simpanOnboarding(state.profesiTerpilih);
      setState((prev) => ({ ...prev, status: "selesai" }));
      router.push("/dashboard");
    } catch (err) {
      const pesan =
        err instanceof KesalahanAPI
          ? err.message
          : "Gagal menyimpan pilihan. Coba lagi.";
      setState((prev) => ({
        ...prev,
        status: "gagal",
        pesanError: pesan,
      }));
    }
  }, [state.profesiTerpilih, router]);

  // Lewati onboarding — tandai onboarding_selesai=true tanpa profesi
  // Tetap panggil API agar backend tahu onboarding sudah dilewati
  // sehingga layar onboarding tidak muncul lagi saat login berikutnya
  const lewati = useCallback(async () => {
    setState((prev) => ({ ...prev, status: "menyimpan", pesanError: null }));

    try {
      await simpanOnboarding(null);
      setState((prev) => ({ ...prev, status: "selesai" }));
      router.push("/dashboard");
    } catch {
      // Jika lewati gagal, tetap redirect — jangan blokir pengguna
      // karena lewati bersifat opsional dan tidak kritis
      router.push("/dashboard");
    }
  }, [router]);

  return {
    state,
    pilihProfesi,
    simpan,
    lewati,
  };
}