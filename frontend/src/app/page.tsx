import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import CaraKerjaSection from "@/components/cara-kerja-section";
import FiturSection from "@/components/fitur-section";
import SkorRisikoSection from "@/components/skor-risiko-section";
import HargaSection from "@/components/harga-section";
import Footer from "@/components/footer";

// Halaman landing page KontrakAman AI
// Struktur: Navbar → Hero → Cara Kerja → Fitur → Skor Risiko → Harga → Footer
export default function HalamanBeranda() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--jernih-surface)]">
      <Navbar />
      <main id="konten-utama">
        <HeroSection />
        <CaraKerjaSection />
        <FiturSection />
        <SkorRisikoSection />
        <HargaSection />
      </main>
      <Footer />
    </div>
  );
}
