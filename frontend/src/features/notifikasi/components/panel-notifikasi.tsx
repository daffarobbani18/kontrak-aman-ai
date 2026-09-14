"use client";

// ============================================================
// PanelNotifikasi — dropdown notifikasi di navbar
// F-NOTIF-01 PRD.md: notifikasi audit selesai
// F-NOTIF-02 PRD.md: pengingat tindak lanjut
// DESIGN.md: animated-list Magic UI, flat, token warna Jernih
// ============================================================

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Bell } from "lucide-react";
import { ItemNotifikasi } from "./item-notifikasi";
import type { StateNotifikasi } from "../types";

interface PropPanelNotifikasi {
  state: StateNotifikasi;
  onTandaiDibaca: (id: string) => void;
  onTandaiSemuaDibaca: () => void;
  onHapus: (id: string) => void;
}

export function PanelNotifikasi({
  state,
  onTandaiDibaca,
  onTandaiSemuaDibaca,
  onHapus,
}: PropPanelNotifikasi) {
  const [terbuka, setTerbuka] = useState(false);
  const kurangiGerak = useReducedMotion();
  const refPanel = useRef<HTMLDivElement>(null);

  // Tutup panel saat klik di luar
  useEffect(() => {
    function tanganiKlikLuar(e: MouseEvent) {
      if (refPanel.current && !refPanel.current.contains(e.target as Node)) {
        setTerbuka(false);
      }
    }
    if (terbuka) {
      document.addEventListener("mousedown", tanganiKlikLuar);
    }
    return () => document.removeEventListener("mousedown", tanganiKlikLuar);
  }, [terbuka]);

  // Tutup panel saat tekan Escape
  useEffect(() => {
    function tanganiEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setTerbuka(false);
    }
    if (terbuka) {
      document.addEventListener("keydown", tanganiEscape);
    }
    return () => document.removeEventListener("keydown", tanganiEscape);
  }, [terbuka]);

  const adaNotifikasi = state.items.length > 0;
  const adaBelumDibaca = state.jumlahBelumDibaca > 0;

  return (
    <div ref={refPanel} className="relative">
      {/* Tombol lonceng */}
      <button
        type="button"
        onClick={() => setTerbuka((v) => !v)}
        className="relative flex h-8 w-8 items-center justify-center rounded-[var(--jernih-radius-md)] text-[var(--jernih-neutral)] transition-colors duration-150 hover:bg-[var(--jernih-on-surface)]/5 hover:text-[var(--jernih-on-surface)]"
        aria-label={
          adaBelumDibaca
            ? `${state.jumlahBelumDibaca} notifikasi belum dibaca`
            : "Notifikasi"
        }
        aria-haspopup="true"
        aria-expanded={terbuka}
      >
        <Bell className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        {/* Badge jumlah belum dibaca */}
        {adaBelumDibaca && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--jernih-error)] text-[10px] font-bold text-[var(--jernih-surface)]"
            aria-hidden="true"
          >
            {state.jumlahBelumDibaca > 9 ? "9+" : state.jumlahBelumDibaca}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {terbuka && (
          <motion.div
            initial={kurangiGerak ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={kurangiGerak ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-10 z-50 w-80 rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] shadow-md"
            role="dialog"
            aria-label="Panel notifikasi"
          >
            {/* Header panel */}
            <div className="flex items-center justify-between border-b border-[var(--jernih-neutral)]/10 px-4 py-3">
              <h2
                className="text-body-md font-medium text-[var(--jernih-on-surface)]"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Notifikasi
              </h2>
              {adaBelumDibaca && (
                <button
                  type="button"
                  onClick={onTandaiSemuaDibaca}
                  className="text-label-sm text-[var(--jernih-primary)] underline-offset-2 hover:underline"
                >
                  Tandai semua dibaca
                </button>
              )}
            </div>

            {/* Daftar notifikasi — animated list sesuai DESIGN.md */}
            <div
              className="max-h-80 overflow-y-auto"
              role="list"
              aria-label="Daftar notifikasi"
            >
              {!adaNotifikasi ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                  <Bell
                    className="h-8 w-8 text-[var(--jernih-neutral)]/30"
                    strokeWidth={1}
                    aria-hidden="true"
                  />
                  <p className="text-body-md text-[var(--jernih-neutral)]">
                    Belum ada notifikasi
                  </p>
                  <p className="text-label-sm text-[var(--jernih-neutral)]/70">
                    Notifikasi akan muncul setelah audit selesai.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--jernih-neutral)]/10">
                  {state.items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={kurangiGerak ? {} : { opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: kurangiGerak ? 0 : i * 0.04,
                        ease: "easeOut",
                      }}
                    >
                      <ItemNotifikasi
                        item={item}
                        onTandaiDibaca={(id) => {
                          onTandaiDibaca(id);
                          setTerbuka(false);
                        }}
                        onHapus={onHapus}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer — hanya tampil jika ada notifikasi */}
            {adaNotifikasi && (
              <div className="border-t border-[var(--jernih-neutral)]/10 px-4 py-2.5">
                <p className="text-label-sm text-[var(--jernih-neutral)]">
                  {state.items.length} notifikasi
                  {adaBelumDibaca && (
                    <span className="ml-1 text-[var(--jernih-primary)]">
                      ({state.jumlahBelumDibaca} belum dibaca)
                    </span>
                  )}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}