"use client";

import NavbarDashboard from "@/components/navbar-dashboard";
import { DashboardProvider } from "@/features/dashboard/context/dashboard-context";

// Layout bersama untuk semua halaman yang membutuhkan autentikasi
// DashboardProvider membungkus seluruh route group — data di-fetch sekali,
// dikonsumsi oleh navbar dan halaman dashboard tanpa double fetch
interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DashboardProvider>
      <div className="flex min-h-screen flex-col bg-[var(--jernih-surface)]">
        <NavbarDashboard />
        {/* pb-20 memberi ruang agar konten tidak tertutup bottom nav mobile (tinggi ~64px) */}
        <main id="konten-utama" className="flex-1 pb-20 sm:pb-0">
          {children}
        </main>
      </div>
    </DashboardProvider>
  );
}
