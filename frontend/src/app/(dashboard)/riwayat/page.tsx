import type { Metadata } from "next";
import KontenRiwayat from "./konten-riwayat";

export const metadata: Metadata = {
  title: "Riwayat Kontrak — KontrakAman AI",
  description: "Daftar seluruh kontrak yang pernah kamu audit.",
};

// ============================================================
// Halaman riwayat kontrak — F-DOC-03 PRD
// Server Component tipis, logika UI ada di KontenRiwayat (Client Component)
// ============================================================
export default function HalamanRiwayat() {
  return <KontenRiwayat />;
}
