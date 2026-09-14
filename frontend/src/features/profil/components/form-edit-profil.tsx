"use client";

// ============================================================
// FormEditProfil — edit nama lengkap pengguna
// PATCH /pengguna/saya (api.md 5.2)
// DESIGN.md: input flat, btn-brutal, feedback inline
// ============================================================

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, AlertCircle } from "lucide-react";
import { skemaEditProfil, type TipeEditProfil } from "../types";
import type { StatusForm } from "../types";

interface PropFormEditProfil {
  namaAwal: string;
  status: StatusForm;
  pesanError: string | null;
  onSimpan: (namaLengkap: string) => void;
}

export function FormEditProfil({
  namaAwal,
  status,
  pesanError,
  onSimpan,
}: PropFormEditProfil) {
  const sedangMenyimpan = status === "menyimpan";
  const tersimpan = status === "tersimpan";

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TipeEditProfil>({
    resolver: zodResolver(skemaEditProfil),
    defaultValues: { nama_lengkap: namaAwal },
  });

  // Pantau nilai input secara real-time
  const nilaiSaatIni = watch("nama_lengkap");
  // Tombol aktif jika nilai berbeda dari nama awal dan tidak sedang menyimpan
  const adaPerubahan = nilaiSaatIni?.trim() !== namaAwal?.trim();

  // Reset form saat namaAwal berubah (misal setelah tersimpan)
  useEffect(() => {
    reset({ nama_lengkap: namaAwal });
  }, [namaAwal, reset]);

  const onSubmit = (data: TipeEditProfil) => {
    onSimpan(data.nama_lengkap);
  };

  return (
    <div className="rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-6">
      <h2
        className="mb-4 text-headline-md text-[var(--jernih-on-surface)]"
        style={{ fontFamily: "var(--font-headline)" }}
      >
        Edit Profil
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Field nama lengkap */}
        <div>
          <label
            htmlFor="nama-lengkap"
            className="mb-1.5 block text-body-md font-medium text-[var(--jernih-on-surface)]"
          >
            Nama Lengkap
            <span className="ml-1 text-[var(--jernih-error)]" aria-hidden="true">*</span>
          </label>
          <input
            id="nama-lengkap"
            type="text"
            autoComplete="name"
            disabled={sedangMenyimpan}
            {...register("nama_lengkap")}
            className={`w-full rounded-[var(--jernih-radius-md)] border bg-[var(--jernih-surface)] px-3 py-2.5 text-body-md text-[var(--jernih-on-surface)] transition-colors duration-150 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
              errors.nama_lengkap
                ? "border-[var(--jernih-error)] focus:border-[var(--jernih-error)]"
                : "border-[var(--jernih-neutral)]/30 focus:border-[var(--jernih-primary)]"
            }`}
            aria-invalid={!!errors.nama_lengkap}
            aria-describedby={
              errors.nama_lengkap ? "error-nama" : undefined
            }
          />
          {errors.nama_lengkap && (
            <p
              id="error-nama"
              className="mt-1.5 text-label-sm text-[var(--jernih-error)]"
              role="alert"
            >
              {errors.nama_lengkap.message}
            </p>
          )}
        </div>

        {/* Feedback error dari server */}
        {status === "gagal" && pesanError && (
          <div
            className="flex items-center gap-2 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-error)]/30 bg-[var(--jernih-error)]/5 px-3 py-2.5"
            role="alert"
          >
            <AlertCircle
              className="h-4 w-4 shrink-0 text-[var(--jernih-error)]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <p className="text-body-md text-[var(--jernih-error)]">{pesanError}</p>
          </div>
        )}

        {/* Feedback sukses */}
        {tersimpan && (
          <div
            className="flex items-center gap-2 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-success)]/30 bg-[var(--jernih-success)]/5 px-3 py-2.5"
            role="status"
          >
            <CheckCircle
              className="h-4 w-4 shrink-0 text-[var(--jernih-success)]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <p className="text-body-md text-[var(--jernih-success)]">
              Profil berhasil diperbarui.
            </p>
          </div>
        )}

        {/* Tombol simpan */}
        <button
          type="submit"
          disabled={sedangMenyimpan || !adaPerubahan}
          className="btn-brutal px-5 py-2.5 text-body-md font-medium disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
        >
          {sedangMenyimpan ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
}