// ============================================================
// ekspor-negosiasi.utils.ts — utilitas ekspor draf negosiasi
// F-NEGO-03 PRD.md: ekspor sebagai PDF, Word, atau salin teks
// DESIGN.md: disclaimer wajib disertakan (F-EDU-01, PRD Bagian 11)
//
// Semua fungsi adalah pure function (tidak ada side effect DOM)
// sehingga bisa ditest tanpa browser environment.
// unduhBlob() adalah satu-satunya fungsi yang menyentuh DOM —
// dipisahkan agar logika ekspor bisa ditest terpisah.
//
// Siap disambung ke backend: saat ini semua ekspor berjalan
// client-side (tidak memerlukan endpoint API tambahan).
// Tidak ada endpoint baru di api.md yang dibutuhkan untuk fitur ini.
// ============================================================

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
} from "@react-pdf/renderer";
import {
  Document as DocxDocument,
  Paragraph,
  TextRun,
  HeadingLevel,
  BorderStyle,
  AlignmentType,
  Packer,
} from "docx";
import { createElement } from "react";

// ============================================================
// Konstanta
// ============================================================

// Teks disclaimer wajib — sesuai F-EDU-01 dan PRD Bagian 11
// Disinkronkan manual dengan DisclaimerHukum di features/edukasi/
export const TEKS_DISCLAIMER_EKSPOR =
  "Dokumen ini adalah alat bantu analisis risiko, bukan nasihat hukum profesional. " +
  "Untuk kontrak bernilai besar atau kompleks, tetap disarankan berkonsultasi dengan pengacara.";

// Header dokumen
const NAMA_APLIKASI = "KontrakAman AI";

// ============================================================
// Tipe
// ============================================================

export interface DataEksporNegosiasi {
  judulKlausul: string;  // contoh: "Klausul 5 — Denda Keterlambatan"
  labelVersi: string;    // contoh: "Negosiasi Standar — Pendekatan profesional"
  teksAsliKlausul: string;
  teksDraf: string;
  tanggalEkspor?: string; // ISO 8601, default: sekarang
}

// ============================================================
// Registrasi font untuk PDF
// Pakai font system (Helvetica) karena tidak perlu file font eksternal.
// Cukup untuk karakter Latin dan teks hukum Indonesia tanpa karakter
// khusus di luar Unicode dasar.
// ============================================================
Font.registerHyphenationCallback((word) => [word]);

// ============================================================
// Style dokumen PDF
// DESIGN.md: minimalis, keterbacaan prioritas, tidak ada dekorasi berlebih
// ============================================================
const stylesPdf = StyleSheet.create({
  halaman: {
    paddingTop: 48,
    paddingBottom: 64,
    paddingLeft: 56,
    paddingRight: 56,
    fontFamily: "Helvetica",
    backgroundColor: "#FAFAF9",
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E4E7",
    borderBottomStyle: "solid",
  },
  namaAplikasi: {
    fontSize: 11,
    color: "#4F46E5",
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  judulDokumen: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#18181B",
    marginBottom: 4,
  },
  subJudul: {
    fontSize: 12,
    color: "#71717A",
  },
  tanggal: {
    fontSize: 10,
    color: "#71717A",
    marginTop: 4,
  },
  seksi: {
    marginBottom: 20,
  },
  labelSeksi: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#71717A",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  kotakKlausulAsli: {
    backgroundColor: "#F4F4F5",
    borderLeftWidth: 3,
    borderLeftColor: "#A1A1AA",
    borderLeftStyle: "solid",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
  },
  teksKlausulAsli: {
    fontSize: 11,
    color: "#3F3F46",
    lineHeight: 1.6,
    fontFamily: "Helvetica-Oblique",
  },
  kotakDraf: {
    backgroundColor: "#EEF2FF",
    borderLeftWidth: 3,
    borderLeftColor: "#4F46E5",
    borderLeftStyle: "solid",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
  },
  teksDraf: {
    fontSize: 11,
    color: "#18181B",
    lineHeight: 1.7,
  },
  labelVersi: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#4F46E5",
    marginBottom: 6,
  },
  kotakDisclaimer: {
    marginTop: 24,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F4F4F5",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E4E4E7",
    borderStyle: "solid",
  },
  teksDisclaimer: {
    fontSize: 9,
    color: "#71717A",
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 56,
    right: 56,
    borderTopWidth: 1,
    borderTopColor: "#E4E4E7",
    borderTopStyle: "solid",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  teksFooter: {
    fontSize: 8,
    color: "#A1A1AA",
  },
});

// ============================================================
// Komponen dokumen PDF (React element, bukan JSX langsung
// karena file ini bukan .tsx — pakai createElement)
// ============================================================
function buatDokumenPdf(data: DataEksporNegosiasi) {
  const tanggal = new Date(
    data.tanggalEkspor ?? new Date().toISOString()
  ).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return createElement(
    Document,
    { title: `Draf Negosiasi — ${data.judulKlausul}` },
    createElement(
      Page,
      { size: "A4", style: stylesPdf.halaman },
      // Header
      createElement(
        View,
        { style: stylesPdf.header },
        createElement(Text, { style: stylesPdf.namaAplikasi }, NAMA_APLIKASI),
        createElement(
          Text,
          { style: stylesPdf.judulDokumen },
          "Draf Negosiasi"
        ),
        createElement(
          Text,
          { style: stylesPdf.subJudul },
          data.judulKlausul
        ),
        createElement(
          Text,
          { style: stylesPdf.tanggal },
          `Diekspor pada ${tanggal}`
        )
      ),
      // Versi draf
      createElement(
        View,
        { style: stylesPdf.seksi },
        createElement(Text, { style: stylesPdf.labelSeksi }, "Versi Draf"),
        createElement(Text, { style: stylesPdf.labelVersi }, data.labelVersi)
      ),
      // Klausul asli
      createElement(
        View,
        { style: stylesPdf.seksi },
        createElement(
          Text,
          { style: stylesPdf.labelSeksi },
          "Klausul Asli"
        ),
        createElement(
          View,
          { style: stylesPdf.kotakKlausulAsli },
          createElement(
            Text,
            { style: stylesPdf.teksKlausulAsli },
            `"${data.teksAsliKlausul}"`
          )
        )
      ),
      // Draf tandingan
      createElement(
        View,
        { style: stylesPdf.seksi },
        createElement(
          Text,
          { style: stylesPdf.labelSeksi },
          "Draf Kalimat Tandingan"
        ),
        createElement(
          View,
          { style: stylesPdf.kotakDraf },
          createElement(Text, { style: stylesPdf.teksDraf }, data.teksDraf)
        )
      ),
      // Disclaimer — WAJIB, tidak bisa dihapus (F-EDU-01, PRD Bagian 11)
      createElement(
        View,
        { style: stylesPdf.kotakDisclaimer },
        createElement(
          Text,
          { style: stylesPdf.teksDisclaimer },
          `⚠ ${TEKS_DISCLAIMER_EKSPOR}`
        )
      ),
      // Footer
      createElement(
        View,
        { style: stylesPdf.footer },
        createElement(
          Text,
          { style: stylesPdf.teksFooter },
          NAMA_APLIKASI
        ),
        createElement(
          Text,
          { style: stylesPdf.teksFooter },
          `Draf ini bukan nasihat hukum final`
        )
      )
    )
  );
}

// ============================================================
// eksporSebagaiPdf — kembalikan Blob PDF
// Async karena @react-pdf/renderer menggunakan Web Workers
// ============================================================
export async function eksporSebagaiPdf(
  data: DataEksporNegosiasi
): Promise<Blob> {
  const dokumen = buatDokumenPdf(data);
  const blob = await pdf(dokumen).toBlob();
  return blob;
}

// ============================================================
// eksporSebagaiWord — kembalikan Blob .docx
// Menggunakan library docx untuk generate Word document
// ============================================================
export async function eksporSebagaiWord(
  data: DataEksporNegosiasi
): Promise<Blob> {
  const tanggal = new Date(
    data.tanggalEkspor ?? new Date().toISOString()
  ).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const dokumen = new DocxDocument({
    creator: NAMA_APLIKASI,
    title: `Draf Negosiasi — ${data.judulKlausul}`,
    description: "Draf kalimat negosiasi tandingan dari KontrakAman AI",
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        children: [
          // Header aplikasi
          new Paragraph({
            children: [
              new TextRun({
                text: NAMA_APLIKASI,
                bold: true,
                color: "4F46E5",
                size: 20,
              }),
            ],
            spacing: { after: 120 },
          }),
          // Judul dokumen
          new Paragraph({
            text: "Draf Negosiasi",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 80 },
          }),
          // Sub-judul (judul klausul)
          new Paragraph({
            children: [
              new TextRun({
                text: data.judulKlausul,
                color: "71717A",
                size: 22,
              }),
            ],
            spacing: { after: 80 },
          }),
          // Tanggal ekspor
          new Paragraph({
            children: [
              new TextRun({
                text: `Diekspor pada ${tanggal}`,
                color: "A1A1AA",
                size: 18,
                italics: true,
              }),
            ],
            spacing: { after: 400 },
          }),
          // Label versi
          new Paragraph({
            children: [
              new TextRun({
                text: "Versi Draf",
                bold: true,
                allCaps: true,
                size: 18,
                color: "71717A",
              }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.labelVersi,
                bold: true,
                color: "4F46E5",
                size: 22,
              }),
            ],
            spacing: { after: 320 },
          }),
          // Klausul asli
          new Paragraph({
            children: [
              new TextRun({
                text: "Klausul Asli",
                bold: true,
                allCaps: true,
                size: 18,
                color: "71717A",
              }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `"${data.teksAsliKlausul}"`,
                italics: true,
                color: "3F3F46",
                size: 22,
              }),
            ],
            border: {
              left: {
                style: BorderStyle.THICK,
                size: 6,
                color: "A1A1AA",
              },
            },
            indent: { left: 360 },
            spacing: { after: 320 },
          }),
          // Draf tandingan
          new Paragraph({
            children: [
              new TextRun({
                text: "Draf Kalimat Tandingan",
                bold: true,
                allCaps: true,
                size: 18,
                color: "71717A",
              }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.teksDraf,
                size: 22,
                color: "18181B",
              }),
            ],
            border: {
              left: {
                style: BorderStyle.THICK,
                size: 6,
                color: "4F46E5",
              },
            },
            indent: { left: 360 },
            spacing: { after: 480 },
          }),
          // Disclaimer — WAJIB, tidak bisa dihapus (F-EDU-01, PRD Bagian 11)
          new Paragraph({
            children: [
              new TextRun({
                text: `⚠ ${TEKS_DISCLAIMER_EKSPOR}`,
                size: 18,
                color: "71717A",
                italics: true,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            border: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "E4E4E7" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "E4E4E7" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "E4E4E7" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "E4E4E7" },
            },
            spacing: { before: 120, after: 120 },
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBlob(dokumen);
  return buffer;
}

// ============================================================
// unduhBlob — trigger download file di browser
// Satu-satunya fungsi yang menyentuh DOM.
// Dipisahkan dari fungsi ekspor agar logika ekspor bisa ditest
// di lingkungan tanpa browser (jsdom mock cukup untuk ini).
// ============================================================
export function unduhBlob(blob: Blob, namaFile: string): void {
  const url = URL.createObjectURL(blob);
  const tautan = document.createElement("a");
  tautan.href = url;
  tautan.download = namaFile;
  // Perlu ditambahkan ke DOM agar berfungsi di Firefox
  document.body.appendChild(tautan);
  tautan.click();
  document.body.removeChild(tautan);
  // Bebaskan memori — tunda sedikit agar download sempat dimulai
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

// ============================================================
// buatNamaFile — buat nama file yang aman dari judul klausul
// ============================================================
export function buatNamaFile(
  judulKlausul: string,
  ekstensi: "pdf" | "docx"
): string {
  // Ambil bagian pertama sebelum " — " jika ada, lalu sanitasi
  const bagian = judulKlausul.split("—")[0]?.trim() ?? judulKlausul;
  const aman = bagian
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50)
    .trim();
  return `draf-negosiasi-${aman || "klausul"}.${ekstensi}`;
}