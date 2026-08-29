import type { Metadata } from "next";
import FormDaftar from "@/features/autentikasi/components/form-daftar";

export const metadata: Metadata = {
  title: "Daftar Gratis — KontrakAman AI",
  description: "Buat akun gratis KontrakAman AI dan mulai audit kontrak freelancemu hari ini.",
};

export default function HalamanDaftar() {
  return <FormDaftar />;
}
