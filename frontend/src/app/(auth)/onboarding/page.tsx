import type { Metadata } from "next";
import { FormOnboarding } from "@/features/profil/components/form-onboarding";

export const metadata: Metadata = {
  title: "Selamat Datang — KontrakAman AI",
  description: "Ceritakan sedikit tentang pekerjaanmu agar audit kontrak lebih relevan.",
};

// ============================================================
// Halaman Onboarding — F-PROF-01 PRD.md
// Ditampilkan setelah pengguna pertama kali masuk
// Bisa dilewati — PRD: "Pengguna dapat melewati langkah ini"
// ============================================================
export default function HalamanOnboarding() {
  return <FormOnboarding />;
}