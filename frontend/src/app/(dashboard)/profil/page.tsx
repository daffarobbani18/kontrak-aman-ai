import type { Metadata } from "next";
import KontenProfil from "./konten-profil";

export const metadata: Metadata = {
  title: "Profil — KontrakAman AI",
  description: "Kelola informasi akun dan keamananmu.",
};

// ============================================================
// Halaman profil — F-PROF-02 PRD
// Server Component tipis, logika UI ada di KontenProfil (Client Component)
// ============================================================
export default function HalamanProfil() {
  return <KontenProfil />;
}
