"use client";

// ============================================================
// BottomNavMobile — navigasi bawah untuk mobile
// Hanya tampil di bawah breakpoint sm (< 640px)
// DESIGN.md: flat, token warna Jernih, radius-md, accessible
// ============================================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderOpen, User } from "lucide-react";

const ITEM_NAV = [
  {
    label: "Dashboard",
    href: "/dashboard",
    Ikon: LayoutDashboard,
  },
  {
    label: "Riwayat",
    href: "/riwayat",
    Ikon: FolderOpen,
  },
  {
    label: "Profil",
    href: "/profil",
    Ikon: User,
  },
];

export default function BottomNavMobile() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 sm:hidden"
      aria-label="Navigasi utama mobile"
    >
      {/* Safe area untuk iPhone notch/home indicator */}
      {/* bg solid — DESIGN.md melarang efek blur/glassmorphism */}
      <div className="border-t border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] pb-safe">
        <div className="flex items-stretch">
          {ITEM_NAV.map((item) => {
            const aktif = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const { Ikon } = item;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors duration-150 ${
                  aktif
                    ? "text-[var(--jernih-primary)]"
                    : "text-[var(--jernih-neutral)] hover:text-[var(--jernih-on-surface)]"
                }`}
                aria-current={aktif ? "page" : undefined}
              >
                <Ikon
                  className="h-5 w-5"
                  strokeWidth={aktif ? 2 : 1.5}
                  aria-hidden="true"
                />
                <span
                  className={`text-label-sm ${
                    aktif ? "font-medium" : "font-normal"
                  }`}
                >
                  {item.label}
                </span>
                {/* Indikator aktif — absolute relatif ke Link parent */}
                {aktif && (
                  <span
                    className="absolute bottom-0 left-1/2 h-0.5 w-10 -translate-x-1/2 rounded-full bg-[var(--jernih-primary)]"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}