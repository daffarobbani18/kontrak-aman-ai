"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { skemaDaftar, type TipeDaftar } from "@/features/autentikasi/types";
import { daftar } from "@/features/autentikasi/services/autentikasi.service";
import { mockDaftar } from "@/lib/mock-auth";
import { KesalahanAPI, KODE_ERROR } from "@/lib/api-client";

const PAKAI_MOCK = process.env.NEXT_PUBLIC_MOCK_AUTH === "true";

// ============================================================
// Hook useDaftar
// Mengelola form registrasi dengan React Hook Form + Zod
// Menangani semua error dari api.md Bagian 4.1
// ============================================================

export type StatusDaftar = "idle" | "berhasil" | "gagal";

export function useDaftar() {
  const [status, setStatus] = useState<StatusDaftar>("idle");
  const [pesanKesalahan, setPesanKesalahan] = useState<string | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [emailTerdaftar, setEmailTerdaftar] = useState("");

  const form = useForm<TipeDaftar>({
    resolver: zodResolver(skemaDaftar),
    defaultValues: {
      nama_lengkap: "",
      email: "",
      kata_sandi: "",
      konfirmasi_kata_sandi: "",
      setuju_kebijakan_privasi: false,
    },
  });

  async function kirimDaftar(data: TipeDaftar) {
    setSedangMemuat(true);
    setPesanKesalahan(null);

    try {
      // Field setuju_kebijakan_privasi tidak dikirim ke API
      // karena hanya divalidasi di frontend (F-PRIV-01)
      PAKAI_MOCK
        ? await mockDaftar(data.nama_lengkap, data.email)
        : await daftar({
            nama_lengkap: data.nama_lengkap,
            email: data.email,
            kata_sandi: data.kata_sandi,
            konfirmasi_kata_sandi: data.konfirmasi_kata_sandi,
          });

      // Simpan email untuk ditampilkan di halaman konfirmasi
      setEmailTerdaftar(data.email);
      setStatus("berhasil");
    } catch (error) {
      if (error instanceof KesalahanAPI) {
        switch (error.kode) {
          case KODE_ERROR.EMAIL_SUDAH_TERDAFTAR:
            // Set error langsung ke field email
            form.setError("email", {
              type: "server",
              message: "Email ini sudah terdaftar. Coba masuk atau gunakan email lain.",
            });
            break;
          case KODE_ERROR.VALIDASI_GAGAL:
            setPesanKesalahan("Data yang kamu masukkan tidak valid. Periksa kembali formulir.");
            break;
          case KODE_ERROR.TERLALU_BANYAK_PERMINTAAN:
            setPesanKesalahan(
              "Terlalu banyak percobaan pendaftaran. Tunggu beberapa saat sebelum mencoba lagi."
            );
            break;
          default:
            setPesanKesalahan(error.message || "Terjadi kesalahan. Coba lagi dalam beberapa saat.");
        }
        setStatus("gagal");
      } else {
        setPesanKesalahan("Tidak dapat terhubung ke server. Periksa koneksi internetmu.");
        setStatus("gagal");
      }
    } finally {
      setSedangMemuat(false);
    }
  }

  return {
    form,
    kirimDaftar,
    sedangMemuat,
    pesanKesalahan,
    status,
    emailTerdaftar,
  };
}
