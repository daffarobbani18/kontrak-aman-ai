// ============================================================
// FormUnggah — form utama halaman unggah kontrak
// Menggabungkan: ZonaUnggah + PemilihKategori + DisclaimerHukum + StatusUnggah
// Selaras F-DOC-01, F-DOC-02 PRD.md, api.md 6.1 dan 7.1
// ============================================================

"use client";

import { useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { ZonaUnggah } from "./zona-unggah";
import { PemilihKategori } from "./pemilih-kategori";
import { DisclaimerHukum } from "@/features/edukasi/components/disclaimer-hukum";
import { StatusUnggah } from "./status-unggah";
import { KartuKuotaUnggah } from "./kartu-kuota-unggah";
import { useUnggahDokumen } from "../hooks/use-unggah-dokumen";
import { skemaUnggahDokumen, type NilaiFormUnggah } from "../types";
import { useDashboard } from "@/features/dashboard/context/dashboard-context";

export function FormUnggah() {
  const { state, proses, reset } = useUnggahDokumen();
  const { profil } = useDashboard();

  const kuotaHabis =
    profil?.kuota.audit.batas !== null &&
    profil?.kuota.audit.batas !== undefined &&
    (profil?.kuota.audit.digunakan ?? 0) >= (profil?.kuota.audit.batas ?? 0);

  const sedangBerjalan =
    state.status === "memvalidasi" ||
    state.status === "mengunggah" ||
    state.status === "memproses" ||
    state.status === "selesai";

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    reset: resetForm,
    formState: { errors },
  } = useForm<NilaiFormUnggah>({
    resolver: zodResolver(skemaUnggahDokumen),
  });

  const fileTerpilih = watch("file");

  const tanganiPilihFile = useCallback(
    (file: File) => {
      setValue("file", file, { shouldValidate: true });
    },
    [setValue]
  );

  const tanganiHapusFile = useCallback(() => {
    setValue("file", undefined as unknown as File, { shouldValidate: false });
    resetForm({ file: undefined as unknown as File });
  }, [setValue, resetForm]);

  const tanganiCobaLagi = useCallback(() => {
    reset();
  }, [reset]);

  const onSubmit = useCallback(
    async (data: NilaiFormUnggah) => {
      await proses(data.file, {
        nama: data.nama,
        kategori: data.kategori,
      });
    },
    [proses]
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Form unggah kontrak"
    >
      <div className="space-y-6">
        {/* Info kuota — hanya untuk tier gratis */}
        <KartuKuotaUnggah />

        {/* Zona unggah file */}
        <div>
          <label className="mb-2 block text-body-md font-medium text-[var(--jernih-on-surface)]">
            File kontrak
            <span className="ml-1 text-[var(--jernih-error)]" aria-hidden="true">
              *
            </span>
          </label>

          <Controller
            name="file"
            control={control}
            render={() => (
              <ZonaUnggah
                file={fileTerpilih ?? null}
                onPilihFile={tanganiPilihFile}
                onHapusFile={tanganiHapusFile}
                errorFile={errors.file?.message}
                disabled={sedangBerjalan || kuotaHabis}
              />
            )}
          />
        </div>

        {/* Pilih kategori pekerjaan */}
        <Controller
          name="kategori"
          control={control}
          render={({ field }) => (
            <PemilihKategori
              nilai={field.value}
              onChange={field.onChange}
              disabled={sedangBerjalan || kuotaHabis}
            />
          )}
        />

        {/* Status progres — muncul saat proses berjalan */}
        {state.status !== "idle" && (
          <StatusUnggah state={state} onCobaLagi={tanganiCobaLagi} />
        )}

        {/* Disclaimer hukum — WAJIB selalu tampil (F-EDU-01) */}
        <DisclaimerHukum />

        {/* Tombol submit */}
        {state.status !== "selesai" && (
          <motion.button
            type="submit"
            disabled={sedangBerjalan || kuotaHabis || !fileTerpilih}
            whileHover={
              !sedangBerjalan && !kuotaHabis && fileTerpilih
                ? { x: -2, y: -2 }
                : {}
            }
            whileTap={
              !sedangBerjalan && !kuotaHabis && fileTerpilih
                ? { x: 2, y: 2 }
                : {}
            }
            className="btn-brutal w-full py-3 text-body-md font-medium disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
            aria-busy={sedangBerjalan}
          >
            {sedangBerjalan
              ? state.status === "mengunggah"
                ? "Mengunggah..."
                : "Menganalisis..."
              : "Mulai Audit Kontrak"}
          </motion.button>
        )}
      </div>
    </form>
  );
}