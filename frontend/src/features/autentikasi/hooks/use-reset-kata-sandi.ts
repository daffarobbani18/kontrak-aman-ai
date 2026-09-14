"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { skemaResetKataSandi, type TipeResetKataSandi } from "@/features/autentikasi/types";
import { resetKataSandi } from "@/features/autentikasi/services/autentikasi.service";
import { mockResetKataSandi } from "@/lib/mock-auth";
import { KesalahanAPI, KODE_ERROR } from "@/lib/api-client";

const PAKAI_MOCK = process.env.NEXT_PUBLIC_MOCK_AUTH === "true";

// ============================================================
// Hook useResetKataSandi
// Mengelola form reset kata sandi dari link email
// api.md 4.8 — token berlaku 1 jam, sekali pakai
// ============================================================

export type StatusResetKataSandi = "idle" | "berhasil" | "token-tidak-valid";

export function useResetKataSandi(token: string) {
  const [status, setStatus] = useState<StatusResetKataSandi>(token ? "idle" : "token-tidak-valid");
  const [pesanKesalahan, setPesanKesalahan] = useState<string | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(false);

  const form = useForm<TipeResetKataSandi>({
    resolver: zodResolver(skemaResetKataSandi),
    defaultValues: {
      token,
      kata_sandi_baru: "",
      konfirmasi_kata_sandi_baru: "",
    },
  });

  async function kirimResetKataSandi(data: TipeResetKataSandi) {
    setSedangMemuat(true);
    setPesanKesalahan(null);

    try {
      PAKAI_MOCK ? await mockResetKataSandi(data.token) : await resetKataSandi(data);
      setStatus("berhasil");
    } catch (error) {
      if (error instanceof KesalahanAPI) {
        switch (error.kode) {
          case KODE_ERROR.TOKEN_TIDAK_VALID:
            // Token kedaluwarsa atau sudah dipakai — api.md 4.8
            setStatus("token-tidak-valid");
            break;
          case KODE_ERROR.VALIDASI_GAGAL:
            setPesanKesalahan("Kata sandi tidak memenuhi syarat. Periksa kembali formulir.");
            break;
          case KODE_ERROR.TERLALU_BANYAK_PERMINTAAN:
            setPesanKesalahan(
              "Terlalu banyak percobaan. Tunggu beberapa saat sebelum mencoba lagi."
            );
            break;
          default:
            setPesanKesalahan(error.message || "Terjadi kesalahan. Coba lagi dalam beberapa saat.");
        }
      } else {
        setPesanKesalahan("Tidak dapat terhubung ke server. Periksa koneksi internetmu.");
      }
    } finally {
      setSedangMemuat(false);
    }
  }

  return {
    form,
    kirimResetKataSandi,
    sedangMemuat,
    pesanKesalahan,
    status,
  };
}
