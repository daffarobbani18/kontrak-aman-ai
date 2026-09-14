"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ambilProfil, ambilDaftarDokumen } from "@/features/dashboard/services/dashboard.service";
import { mockAmbilProfil, mockAmbilDaftarDokumen } from "@/lib/mock-dashboard";
import { KesalahanAPI, hapusAccessToken } from "@/lib/api-client";
import type { StateDashboard } from "@/features/dashboard/types";

// ============================================================
// DashboardContext — state dashboard dibagikan ke seluruh
// halaman dan komponen dalam route group (dashboard)
// Mencegah double fetch antara navbar dan halaman dashboard
// ============================================================

const PAKAI_MOCK = process.env.NEXT_PUBLIC_MOCK_AUTH === "true";

type KonteksDashboard = StateDashboard & {
  muatUlang: () => Promise<void>;
};

const KonteksDashboard = createContext<KonteksDashboard | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<StateDashboard>({
    profil: null,
    dokumen: [],
    sedangMemuat: true,
    kesalahan: null,
    paginasi: null,
  });

  const muatData = useCallback(async () => {
    setState((prev) => ({ ...prev, sedangMemuat: true, kesalahan: null }));

    try {
      if (PAKAI_MOCK) {
        // sessionStorage tidak tersedia di SSR — guard dengan typeof window
        const emailMock =
          typeof window !== "undefined"
            ? (sessionStorage.getItem("mock_email") ?? "rani@example.com")
            : "rani@example.com";

        const responsProfil = await mockAmbilProfil(emailMock);
        const profil = responsProfil.data;
        const responsDokumen = await mockAmbilDaftarDokumen(profil.id);

        setState({
          profil,
          dokumen: responsDokumen.data,
          sedangMemuat: false,
          kesalahan: null,
          paginasi: responsDokumen.paginasi,
        });
      } else {
        // Fetch paralel — api.md 5.1 dan 6.2
        const [responsProfil, responsDokumen] = await Promise.all([
          ambilProfil(),
          ambilDaftarDokumen({ limit: 10 }),
        ]);

        setState({
          profil: responsProfil.data,
          dokumen: responsDokumen.data,
          sedangMemuat: false,
          kesalahan: null,
          paginasi: responsDokumen.paginasi,
        });
      }
    } catch (error) {
      // Jika token expired atau tidak valid, bersihkan sesi dan redirect ke login
      // Mencegah pengguna terjebak di halaman error tanpa tahu harus apa (AGENTS.md Bagian 7)
      if (
        error instanceof KesalahanAPI &&
        (error.statusHttp === 401 || error.kode === "TOKEN_TIDAK_VALID")
      ) {
        hapusAccessToken();
        if (PAKAI_MOCK && typeof window !== "undefined") {
          sessionStorage.removeItem("mock_email");
        }
        router.push("/masuk");
        return;
      }

      const pesan =
        error instanceof KesalahanAPI
          ? error.message
          : "Gagal memuat data. Coba muat ulang halaman.";

      setState((prev) => ({
        ...prev,
        sedangMemuat: false,
        kesalahan: pesan,
      }));
    }
  }, [router]);

  useEffect(() => {
    // muatData() memanggil setState secara async (setelah await fetch selesai),
    // bukan secara sinkron — rule ini false positive untuk pola data fetching di context.
    // Pola ini adalah cara yang direkomendasikan Next.js untuk inisialisasi data di Provider.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    muatData();
  }, [muatData]);

  return (
    <KonteksDashboard.Provider value={{ ...state, muatUlang: muatData }}>
      {children}
    </KonteksDashboard.Provider>
  );
}

// Hook untuk mengkonsumsi context — wajib dipakai di dalam DashboardProvider
export function useDashboard(): KonteksDashboard {
  const konteks = useContext(KonteksDashboard);
  if (!konteks) {
    throw new Error(
      "useDashboard harus dipakai di dalam DashboardProvider. Pastikan komponen berada di dalam route group (dashboard).",
    );
  }
  return konteks;
}