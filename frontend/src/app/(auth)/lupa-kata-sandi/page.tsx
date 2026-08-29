import type { Metadata } from "next";
import FormLupaKataSandi from "@/features/autentikasi/components/form-lupa-kata-sandi";

export const metadata: Metadata = {
  title: "Lupa Kata Sandi — KontrakAman AI",
  description: "Reset kata sandi akun KontrakAman AI milikmu.",
};

export default function HalamanLupaKataSandi() {
  return <FormLupaKataSandi />;
}
