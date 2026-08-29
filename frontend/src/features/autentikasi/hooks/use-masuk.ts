"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { skemaMasuk, type TipeMasuk } from "@/features/autentikasi/types";
import { masuk } from "@/features/autentikasi/services/autentikasi.service";
import { mockMasuk } from "@/lib/mock-auth";
import { KesalahanAPI, KODE_ERROR } from "@/lib/api-client";

const PAKAI_MOCK = process.env.NEXT_PUBLIC_MOCK_AUTH === "true";

// ============================================================
// Hook useMasuk
// Mengelola form masuk dengan React Hook Form + Zod
// Menangani semua error dari api.md Bagian 4.3
// ============================================================
export function useMasuk() {
  const router = useRouter();
  const [pesanKesalahan, setPesanKesalahan] = useState<string | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(false);

  const form = useForm<TipeMasuk>({
    resolver: zodResolver(skemaMasuk),
    defaultValues: {
      email: "",
      kata_sandi: "",
    },
  });

  async function kirimMasuk(data: TipeMasuk) {
    setSedangMemuat(true);
    setPesanKesalahan(null);

    try {
            const respons = PAKAI_MOCK
        ? await mockMasuk(data.email, data.kata_sandi)
        : await masuk(data);
      // Catatan: masuk() dari service sudah memanggil simpanAccessToken() secara internal.
      // Mock juga mengembalikan access_token tapi tidak memanggil simpanAccessToken,
      // sehingga perlu disimpan manual di sini khusus untuk mode mock.
      if (PAKAI_MOCK && respons.berhasil && respons.data?.access_token) {
        const { simpanAccessToken } = await import("@/lib/api-client");
        simpanAccessToken(respons.data.access_token);
      }
      // Simpan email untuk dipakai mock dashboard
      if (PAKAI_MOCK) {
        sessionStorage.setItem("mock_email", data.email);
      }
      // Redirect ke dashboard setelah berhasil masuk
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof KesalahanAPI) {
        switch (error.kode) {
          case KODE_ERROR.TOKEN_TIDAK_VALID:
            // Pesan generik — tidak membocorkan apakah email terdaftar (PRD F-AUTH-02)
            setPesanKesalahan("Email atau kata sandi yang kamu masukkan salah.");
            break;
          case KODE_ERROR.AKSES_DITOLAK:
            // Email belum diverifikasi
            setPesanKesalahan("Email kamu belum diverifikasi. Silakan cek kotak masuk emailmu.");
            break;
          case KODE_ERROR.TERLALU_BANYAK_PERMINTAAN:
            setPesanKesalahan(
              "Terlalu banyak percobaan masuk. Tunggu beberapa saat sebelum mencoba lagi."
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
    kirimMasuk,
    sedangMemuat,
    pesanKesalahan,
  };
}
