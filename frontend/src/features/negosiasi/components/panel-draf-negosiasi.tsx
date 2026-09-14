"use client";

// ============================================================
// PanelDrafNegosiasi — panel utama tiga versi draf negosiasi
// Sesuai F-NEGO-01, F-NEGO-02, F-NEGO-03, F-EDU-01 PRD
// api.md 8.1 & 8.2 — POST + polling GET /negosiasi/:id
// DESIGN.md: animasi Motion, prefers-reduced-motion, disclaimer wajib
// ============================================================

import { useState, useCallback } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useBuatNegosiasi } from "../hooks/use-buat-negosiasi";
import { KartuVersiDraf } from "./kartu-versi-draf";
import { SkeletonNegosiasi } from "./skeleton-negosiasi";
import { DisclaimerHukum } from "@/features/edukasi/components/disclaimer-hukum";
import { AlertCircle, RotateCcw, TrendingUp } from "lucide-react";
import { PanelTemplatePengantar } from "./panel-template-pengantar";
import type { EditanVersi } from "../types";

interface PropPanelDrafNegosiasi {
  klausulId: string;
  judulKlausul: string;
  teksAsliKlausul: string;
}

export function PanelDrafNegosiasi({
  klausulId,
  judulKlausul,
  teksAsliKlausul,
}: PropPanelDrafNegosiasi) {
  const { state, buatNegosiasi, reset } = useBuatNegosiasi();
  const kurangiGerak = useReducedMotion();

  // Versi yang dipilih pengguna (default: versi pertama)
  const [indeksVersiDipilih, setIndeksVersiDipilih] = useState(0);

  // Editan manual per versi — F-NEGO-02
  // Key: indeks versi, value: teks yang sudah diedit
  const [editanVersi, setEditanVersi] = useState<EditanVersi>({});

  const tanganiPilihVersi = useCallback((indeks: number) => {
    setIndeksVersiDipilih(indeks);
  }, []);

  const tanganiEdit = useCallback((indeks: number, teks: string) => {
    setEditanVersi((prev) => ({ ...prev, [indeks]: teks }));
  }, []);

  const tanganiMulai = useCallback(() => {
    setIndeksVersiDipilih(0);
    setEditanVersi({});
    buatNegosiasi(klausulId);
  }, [buatNegosiasi, klausulId]);

  const tanganiCobaLagi = useCallback(() => {
    reset();
    setIndeksVersiDipilih(0);
    setEditanVersi({});
  }, [reset]);

  // ── State: idle — tombol mulai ──
  if (state.status === "idle") {
    return (
      <div className="rounded-[var(--jernih-radius-md)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-4">
        <p className="mb-3 text-body-md text-[var(--jernih-neutral)]">
          AI akan membuatkan 3 versi draf kalimat tandingan yang bisa kamu
          pilih dan edit sebelum dikirim ke klien.
        </p>
        <motion.button
          type="button"
          onClick={tanganiMulai}
          whileHover={kurangiGerak ? {} : { x: -2, y: -2 }}
          whileTap={kurangiGerak ? {} : { x: 2, y: 2 }}
          className="btn-brutal inline-flex items-center gap-2 px-4 py-2 text-body-md font-medium"
        >
          Buat Draf Negosiasi
        </motion.button>
      </div>
    );
  }

  // ── State: meminta / memproses — skeleton ──
  if (state.status === "meminta" || state.status === "memproses") {
    return (
      <div className="rounded-[var(--jernih-radius-md)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-4">
        <p className="mb-4 text-label-sm text-[var(--jernih-neutral)]">
          AI sedang menyusun draf negosiasi untukmu...
        </p>
        <SkeletonNegosiasi />
      </div>
    );
  }

  // ── State: gagal ──
  if (state.status === "gagal") {
    // Banner khusus untuk KUOTA_HABIS dan LANGGANAN_DIPERLUKAN
    if (
      state.kodeError === "KUOTA_HABIS" ||
      state.kodeError === "LANGGANAN_DIPERLUKAN"
    ) {
      return (
        <div
          className="rounded-[var(--jernih-radius-md)] border border-[var(--jernih-warning)]/30 bg-[var(--jernih-warning)]/5 p-4"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <TrendingUp
              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--jernih-warning)]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <div className="flex-1">
              <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
                {state.kodeError === "KUOTA_HABIS"
                  ? "Kuota draf negosiasi habis"
                  : "Fitur ini memerlukan langganan berbayar"}
              </p>
              <p className="mt-1 text-body-md text-[var(--jernih-neutral)]">
                {state.pesanError}
              </p>
              <a
                href="/langganan"
                className="btn-brutal mt-3 inline-flex items-center gap-2 px-4 py-2 text-body-md font-medium"
              >
                Lihat Paket Upgrade
              </a>
            </div>
          </div>
        </div>
      );
    }

    // Error umum
    return (
      <div
        className="rounded-[var(--jernih-radius-md)] border border-[var(--jernih-error)]/20 bg-[var(--jernih-surface)] p-4"
        role="alert"
      >
        <div className="flex items-start gap-3">
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--jernih-error)]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <div className="flex-1">
            <p className="text-body-md text-[var(--jernih-on-surface)]">
              {state.pesanError ?? "Gagal membuat draf negosiasi."}
            </p>
            <button
              type="button"
              onClick={tanganiCobaLagi}
              className="mt-2 inline-flex items-center gap-1.5 text-body-md text-[var(--jernih-primary)] hover:underline"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── State: selesai — tampil panel draf ──
  if (state.status === "selesai" && state.data) {
    const versiDraf = state.data.draft_negosiasi.versi;

    return (
      <motion.div
        initial={kurangiGerak ? {} : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="space-y-4"
      >
        {/* Header panel */}
        <div>
          <p className="text-label-sm font-medium uppercase tracking-wide text-[var(--jernih-neutral)]">
            Draf Negosiasi untuk
          </p>
          <p className="mt-0.5 text-body-md font-medium text-[var(--jernih-on-surface)]">
            {judulKlausul}
          </p>
        </div>

        {/* Klausul asli untuk perbandingan — PRD Alur Kritikal 2 langkah 5 */}
        <div>
          <p className="mb-1.5 text-label-sm font-medium uppercase tracking-wide text-[var(--jernih-neutral)]">
            Klausul Asli
          </p>
          <blockquote className="rounded-[var(--jernih-radius-sm)] border border-[var(--jernih-neutral)]/15 bg-[var(--jernih-neutral)]/5 px-3 py-2.5 text-body-md text-[var(--jernih-on-surface)] italic">
            &ldquo;{teksAsliKlausul}&rdquo;
          </blockquote>
        </div>

        {/* Tiga versi draf — pilih dan edit */}
        <div className="space-y-3">
          <p className="text-label-sm font-medium uppercase tracking-wide text-[var(--jernih-neutral)]">
            Pilih Versi Draf
          </p>
          {versiDraf.map((versi, i) => (
            <KartuVersiDraf
              key={i}
              versi={versi}
              indeks={i}
              terpilih={indeksVersiDipilih === i}
              teksEditan={editanVersi[i] ?? versi.teks}
              judulKlausul={judulKlausul}
              teksAsliKlausul={teksAsliKlausul}
              onPilih={tanganiPilihVersi}
              onEdit={tanganiEdit}
            />
          ))}
        </div>

        {/* Template pengantar profesional — F-NEGO-04
            Tampil setelah draf klausul, sebelum disclaimer
            Meneruskan teks draf versi terpilih untuk salin gabungan */}
        <PanelTemplatePengantar
          teksDrafTerpilih={
            editanVersi[indeksVersiDipilih] ??
            versiDraf[indeksVersiDipilih]?.teks
          }
        />

        {/* Disclaimer hukum — WAJIB tampil, tidak bisa disembunyikan (F-EDU-01) */}
        <DisclaimerHukum />

        {/* Tombol buat ulang */}
        <button
          type="button"
          onClick={tanganiCobaLagi}
          className="text-body-md text-[var(--jernih-neutral)] hover:text-[var(--jernih-on-surface)] hover:underline"
        >
          Buat Draf Ulang
        </button>
      </motion.div>
    );
  }

  return null;
}