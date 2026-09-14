"use client";

// ============================================================
// TombolEksporDraf — tombol ekspor draf negosiasi ke PDF dan Word
// F-NEGO-03 PRD.md: ekspor sebagai PDF atau Word
// DESIGN.md: tombol sekunder (bukan btn-brutal — itu hanya untuk
//   aksi terpenting per layar). Ikon Lucide FileDown dan FileText.
//   Animasi Motion, prefers-reduced-motion dihormati.
// Disclaimer selalu disertakan di dokumen hasil ekspor (F-EDU-01).
// ============================================================

import { useState, useCallback } from "react";
import { motion, useReducedMotion } from "motion/react";
import { FileDown, FileText, Loader2 } from "lucide-react";
import {
  eksporSebagaiPdf,
  eksporSebagaiWord,
  unduhBlob,
  buatNamaFile,
  type DataEksporNegosiasi,
} from "../ekspor-negosiasi.utils";

interface PropTombolEksporDraf {
  // Data yang akan diekspor — sesuai DataEksporNegosiasi
  judulKlausul: string;
  labelVersi: string;
  teksAsliKlausul: string;
  teksDraf: string;
}

type StatusEkspor = "idle" | "memproses-pdf" | "memproses-word" | "gagal";

export function TombolEksporDraf({
  judulKlausul,
  labelVersi,
  teksAsliKlausul,
  teksDraf,
}: PropTombolEksporDraf) {
  const [status, setStatus] = useState<StatusEkspor>("idle");
  const [pesanError, setPesanError] = useState<string | null>(null);
  const kurangiGerak = useReducedMotion();

  const tanganiEksporPdf = useCallback(async () => {
    if (status !== "idle") return;
    setStatus("memproses-pdf");
    setPesanError(null);
    // dataEkspor dibuat di dalam callback agar tidak jadi deps yang berubah tiap render
    const dataEkspor: DataEksporNegosiasi = {
      judulKlausul,
      labelVersi,
      teksAsliKlausul,
      teksDraf,
      tanggalEkspor: new Date().toISOString(),
    };
    try {
      const blob = await eksporSebagaiPdf(dataEkspor);
      unduhBlob(blob, buatNamaFile(judulKlausul, "pdf"));
      setStatus("idle");
    } catch {
      // Ekspor gagal — tampilkan pesan error, salin teks tetap tersedia
      // sebagai fallback (PRD Alur Kritikal 2 langkah 7a)
      setPesanError("Gagal mengekspor PDF. Gunakan opsi Salin Teks sebagai alternatif.");
      setStatus("gagal");
    }
  }, [status, judulKlausul, labelVersi, teksAsliKlausul, teksDraf]);

  const tanganiEksporWord = useCallback(async () => {
    if (status !== "idle") return;
    setStatus("memproses-word");
    setPesanError(null);
    // dataEkspor dibuat di dalam callback agar tidak jadi deps yang berubah tiap render
    const dataEkspor: DataEksporNegosiasi = {
      judulKlausul,
      labelVersi,
      teksAsliKlausul,
      teksDraf,
      tanggalEkspor: new Date().toISOString(),
    };
    try {
      const blob = await eksporSebagaiWord(dataEkspor);
      unduhBlob(blob, buatNamaFile(judulKlausul, "docx"));
      setStatus("idle");
    } catch {
      setPesanError("Gagal mengekspor Word. Gunakan opsi Salin Teks sebagai alternatif.");
      setStatus("gagal");
    }
  }, [status, judulKlausul, labelVersi, teksAsliKlausul, teksDraf]);

  const resetError = useCallback(() => {
    setStatus("idle");
    setPesanError(null);
  }, []);

  const sedangMemprosesPdf = status === "memproses-pdf";
  const sedangMemprosesWord = status === "memproses-word";
  const sedangMemproses = sedangMemprosesPdf || sedangMemprosesWord;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {/* Tombol ekspor PDF */}
        <motion.button
          type="button"
          onClick={tanganiEksporPdf}
          disabled={sedangMemproses || !teksDraf}
          whileHover={
            kurangiGerak || sedangMemproses || !teksDraf
              ? {}
              : { scale: 1.01 }
          }
          whileTap={
            kurangiGerak || sedangMemproses || !teksDraf
              ? {}
              : { scale: 0.98 }
          }
          className="inline-flex items-center gap-2 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-neutral)]/30 bg-[var(--jernih-surface)] px-3.5 py-2 text-body-md text-[var(--jernih-on-surface)] transition-colors duration-150 hover:border-[var(--jernih-neutral)]/50 hover:bg-[var(--jernih-on-surface)]/5 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={
            sedangMemprosesPdf
              ? "Sedang mengekspor PDF..."
              : "Ekspor draf sebagai PDF"
          }
          aria-busy={sedangMemprosesPdf}
        >
          {sedangMemprosesPdf ? (
            <Loader2
              className="h-4 w-4 animate-spin"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          ) : (
            <FileDown
              className="h-4 w-4"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          )}
          {sedangMemprosesPdf ? "Mengekspor..." : "Ekspor PDF"}
        </motion.button>

        {/* Tombol ekspor Word */}
        <motion.button
          type="button"
          onClick={tanganiEksporWord}
          disabled={sedangMemproses || !teksDraf}
          whileHover={
            kurangiGerak || sedangMemproses || !teksDraf
              ? {}
              : { scale: 1.01 }
          }
          whileTap={
            kurangiGerak || sedangMemproses || !teksDraf
              ? {}
              : { scale: 0.98 }
          }
          className="inline-flex items-center gap-2 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-neutral)]/30 bg-[var(--jernih-surface)] px-3.5 py-2 text-body-md text-[var(--jernih-on-surface)] transition-colors duration-150 hover:border-[var(--jernih-neutral)]/50 hover:bg-[var(--jernih-on-surface)]/5 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={
            sedangMemprosesWord
              ? "Sedang mengekspor Word..."
              : "Ekspor draf sebagai Word"
          }
          aria-busy={sedangMemprosesWord}
        >
          {sedangMemprosesWord ? (
            <Loader2
              className="h-4 w-4 animate-spin"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          ) : (
            <FileText
              className="h-4 w-4"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          )}
          {sedangMemprosesWord ? "Mengekspor..." : "Ekspor Word"}
        </motion.button>
      </div>

      {/* Pesan error — tampil jika ekspor gagal */}
      {/* Salin teks tetap tersedia sebagai fallback (PRD Alur Kritikal 2 langkah 7a) */}
      {status === "gagal" && pesanError && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-label-sm text-[var(--jernih-error)]" role="alert">
            {pesanError}
          </p>
          <button
            type="button"
            onClick={resetError}
            className="text-label-sm text-[var(--jernih-neutral)] underline-offset-2 hover:underline"
          >
            Tutup
          </button>
        </div>
      )}
    </div>
  );
}
