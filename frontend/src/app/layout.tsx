import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

// Space Grotesk — khusus untuk headline sesuai DESIGN.md
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Inter — untuk seluruh body text dan UI sesuai DESIGN.md
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "KontrakAman AI — Audit Kontrak Freelance dengan AI",
  description:
    "Unggah kontrak freelance kamu dan dapatkan analisis risiko instan. Deteksi klausul jebakan, pahami hak-hakmu, dan negosiasikan ulang dengan percaya diri.",
  keywords: ["kontrak freelance", "audit kontrak", "AI hukum", "pekerja gig", "Indonesia"],
  openGraph: {
    title: "KontrakAman AI",
    description: "Audit kontrak freelance kamu dengan AI. Gratis untuk mulai.",
    locale: "id_ID",
    type: "website",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id" className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-surface text-on-surface">{children}</body>
    </html>
  );
}
