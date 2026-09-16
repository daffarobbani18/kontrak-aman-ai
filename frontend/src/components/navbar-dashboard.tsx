"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck, LayoutDashboard, FolderOpen, LogOut, User, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDashboard } from "@/features/dashboard/context/dashboard-context";
import { useNotifikasi } from "@/features/notifikasi/hooks/use-notifikasi";
import { PanelNotifikasi } from "@/features/notifikasi/components/panel-notifikasi";
import BottomNavMobile from "@/components/bottom-nav-mobile";
import { keluar } from "@/features/autentikasi/services/autentikasi.service";
import { hapusAccessToken } from "@/lib/api-client";

// ============================================================
// NavbarDashboard — navigasi untuk halaman yang membutuhkan auth
// Berbeda dari navbar landing page (components/navbar.tsx)
// Fetch profil sendiri via useDashboard — layout tidak perlu passing data
// ============================================================
const navigasiUtama = [
  {
    label: "Dashboard",
    href: "/dashboard",
    ikon: LayoutDashboard,
  },
  {
    label: "Riwayat Kontrak",
    href: "/riwayat",
    ikon: FolderOpen,
  },
];

function inisialNama(namaLengkap: string): string {
  return namaLengkap
    .split(" ")
    .slice(0, 2)
    .map((kata) => kata[0]?.toUpperCase() ?? "")
    .join("");
}

function labelTier(tier: string): string {
  const label: Record<string, string> = {
    gratis: "Gratis",
    pro: "Pro",
    bisnis: "Bisnis",
  };
  return label[tier] ?? tier;
}

export default function NavbarDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [sedangKeluar, setSedangKeluar] = useState(false);
  const { profil } = useDashboard();
  // useNotifikasi sekarang fetch mandiri dari GET /notifikasi (api.md 11.1)
  // via notifikasi.service.ts — tidak lagi bergantung pada data dokumen dari DashboardContext
  const { state: stateNotifikasi, tandaiDibaca, tandaiSemuaDibaca, hapusNotifikasi } =
    useNotifikasi();

  async function tanganiKeluar() {
    setSedangKeluar(true);
    try {
      // Cabut refresh token di backend (POST /auth/keluar, api.md 4.6)
      // Refresh token diambil otomatis via httpOnly cookie (credentials: "include" sudah
      // diset di api-client.ts) — tidak perlu diakses dari JS secara eksplisit.
      // keluar() juga memanggil hapusAccessToken() secara internal.
      // Body refresh_token dikirim kosong karena backend membaca dari cookie,
      // bukan dari body (sesuai arsitektur AGENTS.md Bagian 7).
      try {
        await keluar("");
      } catch {
        // Jika request gagal (jaringan putus atau token sudah expired di server),
        // tetap bersihkan sisi client agar pengguna bisa logout
        hapusAccessToken();
      }
      router.push("/masuk");
    } finally {
      setSedangKeluar(false);
    }
  }

  return (
    <>
    {/* bg solid — DESIGN.md melarang efek blur/glassmorphism */}
    <header className="sticky top-0 z-50 w-full border-b border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2"
          aria-label="KontrakAman AI — Dashboard"
        >
          <ShieldCheck
            className="h-5 w-5 text-[var(--jernih-primary)]"
            strokeWidth={2}
            aria-hidden="true"
          />
          <span
            className="text-body-lg font-semibold text-[var(--jernih-on-surface)]"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            KontrakAman AI
          </span>
        </Link>

        {/* Navigasi tengah — desktop */}
        <nav className="hidden items-center gap-1 sm:flex" aria-label="Navigasi dashboard">
          {navigasiUtama.map((item) => {
            const Ikon = item.ikon;
            const aktif = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={aktif ? "page" : undefined}
                className={`flex items-center gap-1.5 rounded-[var(--jernih-radius-md)] px-3 py-1.5 text-body-md transition-colors duration-150 hover:bg-[var(--jernih-on-surface)]/5 ${
                  aktif
                    ? "bg-[var(--jernih-on-surface)]/5 font-medium text-[var(--jernih-on-surface)]"
                    : "text-[var(--jernih-neutral)] hover:text-[var(--jernih-on-surface)]"
                }`}
              >
                <Ikon
                  className="h-4 w-4"
                  strokeWidth={aktif ? 2 : 1.5}
                  aria-hidden="true"
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Kanan — notifikasi + avatar + dropdown */}
        <div className="flex items-center gap-2">
          {/* Panel notifikasi — hanya tampil saat profil sudah termuat */}
          {profil && (
            <PanelNotifikasi
              state={stateNotifikasi}
              onTandaiDibaca={tandaiDibaca}
              onTandaiSemuaDibaca={tandaiSemuaDibaca}
              onHapus={hapusNotifikasi}
            />
          )}

          {profil && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-2 rounded-[var(--jernih-radius-md)] px-2 py-1.5 transition-colors duration-150 hover:bg-[var(--jernih-on-surface)]/5"
                aria-label="Menu akun"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-[var(--jernih-primary)]/10 text-label-sm font-medium text-[var(--jernih-primary)]">
                    {inisialNama(profil.nama_lengkap)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start sm:flex">
                  <span className="text-body-md font-medium text-[var(--jernih-on-surface)] leading-none">
                    {profil.nama_lengkap.split(" ")[0]}
                  </span>
                  <span className="text-label-sm text-[var(--jernih-neutral)] leading-none mt-0.5">
                    {labelTier(profil.tier)}
                  </span>
                </div>
                <ChevronDown
                  className="h-3.5 w-3.5 text-[var(--jernih-neutral)]"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => router.push("/profil")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <User className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  Profil Saya
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/langganan")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  Langganan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={tanganiKeluar}
                  disabled={sedangKeluar}
                  className="flex items-center gap-2 cursor-pointer text-[var(--jernih-error)] focus:text-[var(--jernih-error)]"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  {sedangKeluar ? "Keluar..." : "Keluar"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
    {/* Bottom navigation untuk mobile — hanya tampil di bawah sm breakpoint */}
    <BottomNavMobile />
    </>
  );
}
