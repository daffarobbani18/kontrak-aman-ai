import type { Metadata } from "next";
import FormMasuk from "@/features/autentikasi/components/form-masuk";

export const metadata: Metadata = {
  title: "Masuk — KontrakAman AI",
  description: "Masuk ke akun KontrakAman AI untuk melanjutkan audit kontrak freelancemu.",
};

export default function HalamanMasuk() {
  return <FormMasuk />;
}
