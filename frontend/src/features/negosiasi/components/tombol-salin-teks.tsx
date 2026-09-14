"use client";

// ============================================================
// TombolSalinTeks — salin teks draf ke clipboard dengan feedback
// DESIGN.md: btn-brutal, animasi Motion, prefers-reduced-motion
// ============================================================

import { useState, useCallback } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Copy, Check } from "lucide-react";

interface PropTombolSalinTeks {
  teks: string;
  label?: string;
}

export function TombolSalinTeks({
  teks,
  label = "Salin Teks",
}: PropTombolSalinTeks) {
  const [tersalin, setTersalin] = useState(false);
  const kurangiGerak = useReducedMotion();

  const salin = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(teks);
      setTersalin(true);
      setTimeout(() => setTersalin(false), 2000);
    } catch {
      // Fallback untuk browser yang tidak mendukung Clipboard API
      const area = document.createElement("textarea");
      area.value = teks;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
      setTersalin(true);
      setTimeout(() => setTersalin(false), 2000);
    }
  }, [teks]);

  return (
    <motion.button
      type="button"
      onClick={salin}
      whileHover={kurangiGerak ? {} : { x: -2, y: -2 }}
      whileTap={kurangiGerak ? {} : { x: 2, y: 2 }}
      className="btn-brutal inline-flex items-center gap-2 px-4 py-2 text-body-md font-medium"
      aria-label={tersalin ? "Teks berhasil disalin" : label}
    >
      {tersalin ? (
        <Check className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      ) : (
        <Copy className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
      )}
      {tersalin ? "Tersalin!" : label}
    </motion.button>
  );
}