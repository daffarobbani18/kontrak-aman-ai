import type { Metadata } from "next";
import { Suspense } from "react";
import KontenLangganan from "./konten-langganan";

export const metadata: Metadata = {
  title: "Langganan — KontrakAman AI",
  description: "Kelola paket langganan dan pembayaranmu.",
};

// Halaman langganan — F-BILL-01, F-BILL-02, F-BILL-03, F-BILL-04 PRD
// KontenLangganan adalah client component — dibungkus Suspense
// karena memakai useSearchParams() (api.md 9.2 redirect Mayar)
export default function HalamanLangganan() {
  return (
    <Suspense fallback={null}>
      <KontenLangganan />
    </Suspense>
  );
}
