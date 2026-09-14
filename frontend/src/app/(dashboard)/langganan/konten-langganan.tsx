"use client";

// ============================================================
// KontenLangganan — client component utama halaman /langganan
// Merakit: BannerStatus + KartuLanggananAktif + DaftarPaket + DaftarTransaksi
// F-BILL-01, F-BILL-02, F-BILL-03, F-BILL-04 PRD
// ============================================================

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { usePaketHarga } from "@/features/langganan/hooks/use-paket-harga";
import { useLanggananAktif } from "@/features/langganan/hooks/use-langganan-aktif";
import { useBuatSesiPembayaran } from "@/features/langganan/hooks/use-buat-sesi-pembayaran";
import { useBatalkanLangganan } from "@/features/langganan/hooks/use-batalkan-langganan";
import { useRiwayatTransaksi } from "@/features/langganan/hooks/use-riwayat-transaksi";
import { BannerStatusPembayaran } from "@/features/langganan/components/banner-status-pembayaran";
import { KartuLanggananAktif } from "@/features/langganan/components/kartu-langganan-aktif";
import { DaftarPaket } from "@/features/langganan/components/daftar-paket";
import { DaftarTransaksi } from "@/features/langganan/components/daftar-transaksi";
import { DialogBatalkanLangganan } from "@/features/langganan/components/dialog-batalkan-langganan";
import type { IdPaket, StatusPembayaranMayar } from "@/features/langganan/types";

export default function KontenLangganan() {
  const searchParams = useSearchParams();

  // Query param dari redirect Mayar: ?status=berhasil|dibatalkan|gagal
  const statusPembayaran = searchParams.get("status") as StatusPembayaranMayar | null;
  const isMock = searchParams.get("mock") === "true";

  // Hooks
  const paketHarga = usePaketHarga();
  const langgananAktif = useLanggananAktif();
  const sesiPembayaran = useBuatSesiPembayaran();
  const batalkan = useBatalkanLangganan({
    onBerhasil: (aktifHingga) => {
      langgananAktif.tandaiBatalkan(aktifHingga);
    },
  });
  const riwayatTransaksi = useRiwayatTransaksi();

  // Muat riwayat transaksi saat halaman pertama dibuka
  useEffect(() => {
    riwayatTransaksi.muat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tier aktif pengguna dari data langganan
  // Saat masih memuat, gunakan string kosong supaya semua tombol "Pilih"
  // di DaftarPaket tidak muncul prematur sebelum data tiba
  const tierAktif =
    langgananAktif.state.status === "selesai"
      ? (langgananAktif.state.data?.tier ?? "gratis")
      : "";

  const tanganiPilihPaket = (paketId: IdPaket) => {
    sesiPembayaran.mulaiPembayaran(paketId, "bulanan");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Judul halaman */}
      <div className="mb-8">
        <h1
          className="text-headline-lg text-[var(--jernih-on-surface)]"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Langganan
        </h1>
        <p className="mt-2 text-body-md text-[var(--jernih-neutral)]">
          Kelola paket langganan dan riwayat pembayaranmu.
        </p>
      </div>

      <div className="space-y-10">
        {/* Banner status setelah redirect dari Mayar */}
        {statusPembayaran && (
          <BannerStatusPembayaran
            status={statusPembayaran}
            isMock={isMock}
          />
        )}

        {/* Langganan aktif — F-BILL-01, F-BILL-04 */}
        <KartuLanggananAktif
          state={langgananAktif.state}
          onBatalkan={batalkan.mintaKonfirmasi}
          onMuatUlang={langgananAktif.muatUlang}
        />

        {/* Pilih paket — F-BILL-02 */}
        <DaftarPaket
          statePaket={paketHarga.state}
          stateSesi={sesiPembayaran.state}
          tierAktif={tierAktif}
          onPilihPaket={tanganiPilihPaket}
          onMuatUlang={paketHarga.muatUlang}
        />

        {/* Riwayat transaksi — F-BILL-03 */}
        <DaftarTransaksi
          state={riwayatTransaksi.state}
          onMuat={riwayatTransaksi.muat}
          onMuatLebih={riwayatTransaksi.muatLebih}
        />
      </div>

      {/* Dialog konfirmasi batalkan — F-BILL-04 */}
      <DialogBatalkanLangganan
        state={batalkan.state}
        terbuka={batalkan.dialogTerbuka}
        aktifHingga={langgananAktif.state.data?.aktif_hingga ?? null}
        onBatalkan={batalkan.batalkan}
        onKonfirmasi={() => batalkan.konfirmasiBatalkan()}
        onResetError={batalkan.resetError}
      />
    </div>
  );
}