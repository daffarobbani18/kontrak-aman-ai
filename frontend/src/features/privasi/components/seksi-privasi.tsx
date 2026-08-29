"use client";

// ============================================================
// SeksiPrivasi — merakit semua komponen privasi di halaman profil
// F-PRIV-01: KartuKebijakanPrivasi
// F-PRIV-02: KartuRetensiData
// F-PRIV-03: KartuEksporData (statis, menunggu API)
// F-PRIV-04: FormHapusAkun via useHapusAkun
// ============================================================

import { useState } from "react";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { KartuKebijakanPrivasi } from "./kartu-kebijakan-privasi";
import { KartuRetensiData } from "./kartu-retensi-data";
import { KartuEksporData } from "./kartu-ekspor-data";
import { FormHapusAkun } from "./form-hapus-akun";
import { useHapusAkun } from "../hooks/use-hapus-akun";

export function SeksiPrivasi() {
  const [hapusTerbuka, setHapusTerbuka] = useState(false);
  const kurangiGerak = useReducedMotion();
  const { state, bukaKonfirmasi, tutupKonfirmasi, eksekusiHapus, resetError } =
    useHapusAkun();

  const tanganiToggleHapus = () => {
    if (hapusTerbuka) {
      setHapusTerbuka(false);
      tutupKonfirmasi();
    } else {
      setHapusTerbuka(true);
      bukaKonfirmasi();
    }
  };

  const tanganiHapus = async (konfirmasi: string, kataSandi: string) => {
    await eksekusiHapus(konfirmasi, kataSandi);
  };

  const tanganiBatal = () => {
    setHapusTerbuka(false);
    tutupKonfirmasi();
    resetError();
  };

  return (
    <div className="space-y-6">
      {/* Divider dengan label */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--jernih-neutral)]/20" />
        <span className="text-label-sm font-medium text-[var(--jernih-neutral)]"
          style={{ fontFamily: "var(--font-headline)" }}>
          Privasi &amp; Data
        </span>
        <div className="h-px flex-1 bg-[var(--jernih-neutral)]/20" />
      </div>

      {/* F-PRIV-01 — Kebijakan privasi */}
      <KartuKebijakanPrivasi />

      {/* F-PRIV-02 — Retensi data */}
      <KartuRetensiData />

      {/* F-PRIV-03 — Ekspor data (statis, menunggu API) */}
      <KartuEksporData />

      {/* F-PRIV-04 — Hapus akun */}
      <div className="rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-error)]/20 bg-[var(--jernih-surface)] p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3
              className="text-headline-md text-[var(--jernih-on-surface)]"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Hapus Akun
            </h3>
            <p className="mt-1 text-body-md text-[var(--jernih-neutral)]">
              Hapus akun dan seluruh data terkait secara permanen. Tindakan ini
              tidak dapat dibatalkan setelah 30 hari.
            </p>
          </div>
          {/* Tombol toggle — bukan btn-brutal karena aksi destruktif (DESIGN.md) */}
          {state.status !== "selesai" && (
            <button
              type="button"
              onClick={tanganiToggleHapus}
              className={`flex shrink-0 items-center gap-1.5 rounded-[var(--jernih-radius-md)] border px-3 py-1.5 text-body-md transition-colors duration-150 ${
                hapusTerbuka
                  ? "border-[var(--jernih-error)]/30 bg-[var(--jernih-error)]/5 text-[var(--jernih-error)]"
                  : "border-[var(--jernih-neutral)]/30 text-[var(--jernih-neutral)] hover:border-[var(--jernih-error)]/30 hover:text-[var(--jernih-error)]"
              }`}
              aria-expanded={hapusTerbuka}
              aria-controls="form-hapus-akun"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              <span>{hapusTerbuka ? "Tutup" : "Hapus Akun"}</span>
              {hapusTerbuka ? (
                <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              )}
            </button>
          )}
        </div>

        {/* Form hapus akun — accordion */}
        <AnimatePresence>
          {(hapusTerbuka || state.status === "selesai") && (
            <motion.div
              id="form-hapus-akun"
              initial={kurangiGerak ? {} : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={kurangiGerak ? {} : { opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="mt-5 border-t border-[var(--jernih-neutral)]/10 pt-5">
                <FormHapusAkun
                  status={state.status}
                  pesanError={state.pesanError}
                  tanggalHapusPermanen={state.tanggalHapusPermanen}
                  onHapus={tanganiHapus}
                  onBatal={tanganiBatal}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}