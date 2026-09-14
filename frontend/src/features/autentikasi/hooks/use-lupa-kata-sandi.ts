"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { skemaLupaKataSandi, type TipeLupaKataSandi } from "@/features/autentikasi/types";
import { lupaKataSandi } from "@/features/autentikasi/services/autentikasi.service";
import { mockLupaKataSandi } from "@/lib/mock-auth";
import { KesalahanAPI, KODE_ERROR } from "@/lib/api-client";

const PAKAI_MOCK = process.env.NEXT_PUBLIC_MOCK_AUTH === "true";

// ============================================================
// Hook useLupaKataSandi
// Mengelola form lupa kata sandi
// api.md 4.7 — selalu respons 200, tidak bocorkan status email
// ============================================================

export type StatusLupaKataSandi = "idle" | "terkirim";

export function useLupaKataSandi() {
  const [status, setStatus] = useState<StatusLupaKataSandi>("idle");
  const [pesanKesalahan, setPesanKesalahan] = useState<string | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(false);

  const form = useForm<TipeLupaKataSandi>({
    resolver: zodResolver(skemaLupaKataSandi),
    defaultValues: {
      email: "",
    },
  });

  async function kirimLupaKataSandi(data: TipeLupaKataSandi) {
    setSedangMemuat(true);
    setPesanKesalahan(null);

    try {
      PAKAI_MOCK ? await mockLupaKataSandi() : await lupaKataSandi(data);
      // Tampilkan pesan sukses generik terlepas dari apakah email terdaftar
      // Sesuai api.md 4.7 — mencegah enumerasi email
      setStatus("terkirim");
    } catch (error) {
      if (error instanceof KesalahanAPI) {
        switch (error.kode) {
          case KODE_ERROR.TERLALU_BANYAK_PERMINTAAN:
            setPesanKesalahan(
              "Terlalu banyak percobaan. Tunggu beberapa saat sebelum mencoba lagi."
            );
            break;
          default:
            // Untuk error lain tetap tampilkan pesan generik
            // agar tidak membocorkan informasi apapun
            setStatus("terkirim");
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
    kirimLupaKataSandi,
    sedangMemuat,
    pesanKesalahan,
    status,
  };
}
