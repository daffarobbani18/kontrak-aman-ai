"use client";

// ============================================================
// DaftarTransaksi — riwayat transaksi pembayaran
// Data dari GET /langganan/transaksi (api.md 9.5)
// DESIGN.md: tabel flat, warna semantik untuk status transaksi
// ============================================================

import { RotateCcw, AlertCircle, ChevronDown } from "lucide-react";
import type { StateRiwayatTransaksi, StatusTransaksi, JenisTransaksi } from "../types";

interface PropDaftarTransaksi {
  state: StateRiwayatTransaksi;
  onMuat: () => void;
  onMuatLebih: () => void;
}

function formatHarga(jumlah: number, matauang: string): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: matauang,
    minimumFractionDigits: 0,
  }).format(jumlah);
}

function formatTanggal(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function labelJenis(jenis: JenisTransaksi): string {
  const label: Record<JenisTransaksi, string> = {
    langganan_baru: "Langganan Baru",
    perpanjangan: "Perpanjangan",
    upgrade: "Upgrade",
    refund: "Refund",
  };
  return label[jenis] ?? jenis;
}

function BadgeStatusTransaksi({ status }: { status: StatusTransaksi }) {
  const konfigurasi: Record<StatusTransaksi, { kelas: string; label: string }> = {
    berhasil: {
      kelas:
        "border-[var(--jernih-success)]/30 bg-[var(--jernih-success)]/10 text-[var(--jernih-success)]",
      label: "Berhasil",
    },
    gagal: {
      kelas:
        "border-[var(--jernih-error)]/30 bg-[var(--jernih-error)]/10 text-[var(--jernih-error)]",
      label: "Gagal",
    },
    menunggu: {
      kelas:
        "border-[var(--jernih-neutral)]/30 bg-[var(--jernih-neutral)]/10 text-[var(--jernih-neutral)]",
      label: "Menunggu",
    },
  };
  const { kelas, label } = konfigurasi[status];
  return (
    <span
      className={`rounded-[var(--jernih-radius-sm)] border px-2 py-0.5 text-label-sm font-medium ${kelas}`}
    >
      {label}
    </span>
  );
}

function SkeletonBaris() {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      {["w-20", "w-24", "w-16", "w-20", "w-16"].map((w, i) => (
        <div
          key={i}
          className={`h-4 animate-pulse rounded bg-[var(--jernih-neutral)]/15 ${w}`}
        />
      ))}
    </div>
  );
}

export function DaftarTransaksi({
  state,
  onMuat,
  onMuatLebih,
}: PropDaftarTransaksi) {
  const { sedangMemuatLebih } = state;

  return (
    <section aria-label="Riwayat transaksi pembayaran">
      <div className="mb-6">
        <h2
          className="text-headline-md text-[var(--jernih-on-surface)]"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Riwayat Transaksi
        </h2>
        <p className="mt-1 text-body-md text-[var(--jernih-neutral)]">
          Catatan pembayaran langgananmu.
        </p>
      </div>

      {/* State: memuat pertama */}
      {(state.status === "idle" || state.status === "memuat") && (
        <div className="rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)]">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={i < 3 ? "border-b border-[var(--jernih-neutral)]/10" : ""}
            >
              <SkeletonBaris />
            </div>
          ))}
        </div>
      )}

      {/* State: gagal */}
      {state.status === "gagal" && (
        <div
          className="flex flex-col items-center gap-4 py-12 text-center"
          role="alert"
        >
          <AlertCircle
            className="h-8 w-8 text-[var(--jernih-error)]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <div>
            <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
              Gagal Memuat Transaksi
            </p>
            <p className="mt-1 text-body-md text-[var(--jernih-neutral)]">
              {state.pesanError}
            </p>
          </div>
          <button
            type="button"
            onClick={onMuat}
            className="btn-brutal inline-flex items-center gap-2 px-4 py-2 text-body-md font-medium"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Coba Lagi
          </button>
        </div>
      )}

      {/* State: selesai */}
      {state.status === "selesai" && (
        <>
          {state.transaksi.length === 0 ? (
            <p className="py-8 text-center text-body-md text-[var(--jernih-neutral)]">
              Belum ada riwayat transaksi.
            </p>
          ) : (
            <div className="rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)]">
              {/* Header tabel — desktop only */}
              <div className="hidden grid-cols-[1fr_1fr_auto_auto_auto] gap-4 border-b border-[var(--jernih-neutral)]/10 px-4 py-2.5 sm:grid">
                {["Tanggal", "Jenis", "Paket", "Jumlah", "Status"].map((h) => (
                  <p key={h} className="text-label-sm font-semibold uppercase tracking-widest text-[var(--jernih-neutral)]">
                    {h}
                  </p>
                ))}
              </div>

              {/* Baris transaksi */}
              {state.transaksi.map((trx, i) => (
                <div
                  key={trx.id}
                  className={[
                    "grid grid-cols-1 gap-2 px-4 py-3",
                    "sm:grid-cols-[1fr_1fr_auto_auto_auto] sm:items-center sm:gap-4",
                    i < state.transaksi.length - 1
                      ? "border-b border-[var(--jernih-neutral)]/10"
                      : "",
                  ].join(" ")}
                >
                  <p className="text-body-md text-[var(--jernih-neutral)]">
                    {formatTanggal(trx.dibayar_pada)}
                  </p>
                  <p className="text-body-md text-[var(--jernih-on-surface)]">
                    {labelJenis(trx.jenis)}
                  </p>
                  <p className="text-body-md text-[var(--jernih-on-surface)]">
                    {trx.paket}
                  </p>
                  <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
                    {formatHarga(trx.jumlah, trx.mata_uang)}
                  </p>
                  <BadgeStatusTransaksi status={trx.status} />
                </div>
              ))}
            </div>
          )}

          {/* Tombol muat lebih */}
          {state.paginasi?.ada_lagi && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={onMuatLebih}
                disabled={sedangMemuatLebih}
                className="inline-flex items-center gap-2
                  rounded-[var(--jernih-radius-md)]
                  border border-[var(--jernih-neutral)]/30
                  bg-[var(--jernih-surface)]
                  px-4 py-2
                  text-body-md text-[var(--jernih-neutral)]
                  hover:border-[var(--jernih-neutral)]/60
                  transition-colors duration-150
                  disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronDown className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                {sedangMemuatLebih ? "Memuat..." : "Muat Lebih"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}