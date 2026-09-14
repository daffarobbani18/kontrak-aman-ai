import { Injectable, Logger } from '@nestjs/common';
import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  /**
   * Ekstrak teks dari file PDF atau gambar.
   * @param buffer - Buffer konten file
   * @param mimeType - MIME type file ('application/pdf', 'image/jpeg', dll)
   */
  async ekstrakTeks(buffer: Buffer, mimeType: string): Promise<string> {
    if (mimeType === 'application/pdf') {
      return this.ekstrakDariPdf(buffer);
    }

    if (mimeType.startsWith('image/')) {
      return this.ekstrakDariGambar(buffer);
    }

    throw new Error(`Tipe file tidak didukung untuk OCR: ${mimeType}`);
  }

  /** Ekstrak teks dari PDF menggunakan pdf-parse; fallback ke Tesseract jika PDF berupa scan */
  private async ekstrakDariPdf(buffer: Buffer): Promise<string> {
    try {
      const hasil = await pdfParse(buffer);
      const teks = hasil.text.trim();

      // Jika teks terlalu pendek → PDF kemungkinan berupa scan gambar
      if (teks.length >= 50) {
        return teks;
      }

      this.logger.warn(
        'PDF tampaknya berupa scan (teks < 50 karakter), fallback ke Tesseract OCR',
      );
      return await this.ekstrakDariGambar(buffer);
    } catch (err) {
      this.logger.error(`Gagal parse PDF: ${String(err)}`);
      throw new Error(`Ekstraksi PDF gagal: ${String(err)}`);
    }
  }

  /** Ekstrak teks dari gambar menggunakan Tesseract.js */
  private async ekstrakDariGambar(buffer: Buffer): Promise<string> {
    try {
      const {
        data: { text },
      } = await Tesseract.recognize(buffer, 'ind+eng', {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') {
            this.logger.debug(`OCR progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      return text.trim();
    } catch (err) {
      this.logger.error(`Gagal OCR gambar: ${String(err)}`);
      throw new Error(`OCR gambar gagal: ${String(err)}`);
    }
  }
}
