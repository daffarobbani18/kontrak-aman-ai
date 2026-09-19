import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

export interface HasilAudit {
  skorRisiko: number;
  ringkasan: string;
  klausul: Array<{
    judul: string;
    isi: string;
    tingkatRisiko: string;
    penjelasan: string;
    rekomendasi?: string;
  }>;
}

export interface HasilNegosiasi {
  ringkasan: string;
  drafDokumen: string;
  poinPerubahan: Array<{
    klausulAsli: string;
    klausulBaru: string;
    alasan: string;
  }>;
}

@Injectable()
export class AnalisisService {
  private readonly logger = new Logger(AnalisisService.name);
  // Primary: Gemini via Google AI SDK
  private readonly gemini: GoogleGenerativeAI;
  private readonly geminiModel: string;
  // Fallback: Groq via OpenAI-compatible SDK
  private readonly groq: OpenAI;
  private readonly groqModel: string;

  constructor(private readonly cfg: ConfigService) {
    this.gemini = new GoogleGenerativeAI(
      cfg.get<string>('GEMINI_API_KEY', ''),
    );
    this.geminiModel = cfg.get<string>('GEMINI_MODEL', 'gemini-2.5-flash');
    this.groq = new OpenAI({
      apiKey: cfg.get<string>('GROQ_API_KEY', ''),
      baseURL: cfg.get<string>('GROQ_BASE_URL', 'https://api.groq.com/openai/v1'),
    });
    this.groqModel = cfg.get<string>('GROQ_MODEL', 'llama-3.3-70b-versatile');
  }

  /**
   * Kirim prompt ke LLM dengan strategi primary (Gemini) + fallback (Groq).
   * Otomatis fallback jika Gemini gagal (rate limit, quota, dll).
   */
  private async kirimPrompt(prompt: string): Promise<string> {
    // Coba Gemini dulu
    if (this.cfg.get<string>('GEMINI_API_KEY')) {
      let percobaan = 0;
      const maksPercobaan = 5;
      
      while (percobaan < maksPercobaan) {
        try {
          this.logger.debug(`Menggunakan Gemini (${this.geminiModel}) sebagai primary LLM (Percobaan ${percobaan + 1}/${maksPercobaan})`);
          const model = this.gemini.getGenerativeModel({
            model: this.geminiModel,
            generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
          });
          const hasil = await model.generateContent(prompt);
          const teks = hasil.response.text();
          if (!teks) throw new Error('Gemini mengembalikan respons kosong');
          return teks;
        } catch (err) {
          percobaan++;
          const pesanError = String(err);
          this.logger.warn(`Gemini gagal (Percobaan ${percobaan}): ${pesanError}`);
          
          if (percobaan >= maksPercobaan) {
            if (!this.cfg.get<string>('GROQ_API_KEY')) {
              throw err; // Lempar error asli Gemini jika tidak ada fallback
            }
            this.logger.warn('Gemini gagal total setelah retries, fallback ke Groq...');
            break;
          }
          
          // Exponential backoff: 3s, 6s, 12s, 24s
          const delay = 3000 * Math.pow(2, percobaan - 1);
          this.logger.debug(`Menunggu ${delay}ms sebelum mencoba Gemini lagi...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    } else {
      this.logger.debug('GEMINI_API_KEY tidak di-set, langsung ke Groq');
    }

    // Jika tidak ada Groq, langsung error
    if (!this.cfg.get<string>('GROQ_API_KEY')) {
      throw new Error('Semua LLM gagal dan GROQ_API_KEY tidak dikonfigurasi.');
    }

    // Fallback ke Groq
    this.logger.debug(`Menggunakan Groq (${this.groqModel}) sebagai fallback LLM`);
    const respons = await this.groq.chat.completions.create({
      model: this.groqModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });
    const teks = respons.choices[0]?.message?.content;
    if (!teks) throw new Error('Groq mengembalikan respons kosong');
    return teks;
  }

  /** Analisis kontrak dan hasilkan laporan audit */
  async analisisAudit(teksKontrak: string): Promise<HasilAudit> {
    this.logger.log(`Memulai analisis audit, panjang teks: ${teksKontrak.length} karakter`);

    const prompt = `Anda adalah ahli hukum kontrak freelance Indonesia. Analisis kontrak berikut secara menyeluruh.

KONTRAK:
${teksKontrak.slice(0, 120000)}

Berikan analisis dalam format JSON berikut (HANYA JSON, tanpa teks lain):
{
  "skorRisiko": <angka 0-100, 100=sangat berisiko>,
  "ringkasan": "<ringkasan singkat 2-3 kalimat tentang kontrak ini>",
  "klausul": [
    {
      "judul": "<nama klausul>",
      "isi": "<isi klausul asli atau ringkasannya>",
      "tingkatRisiko": "<LOW|MEDIUM|HIGH>",
      "penjelasan": "<penjelasan mengapa berisiko atau tidak>",
      "rekomendasi": "<saran perbaikan jika berisiko, kosong jika LOW>"
    }
  ]
}

Fokus pada:
- Klausul pembayaran (syarat, tenggat, denda keterlambatan)
- Hak kekayaan intelektual dan kepemilikan hasil kerja
- Klausul pemutusan kontrak (kapan dan bagaimana)
- Garansi dan tanggung jawab (liability)
- Klausul non-kompetisi atau eksklusivitas
- Kepatuhan hukum Indonesia`;

    const kontenRespons = await this.kirimPrompt(prompt);
    return this.parseJsonRespons<HasilAudit>(kontenRespons);
  }

  /** Buat draf negosiasi berdasarkan hasil audit */
  async buatDrafNegosiasi(
    teksKontrak: string,
    klausulBerisiko: Array<{ judul: string; risiko: string }>,
    instruksiTambahan?: string | null,
  ): Promise<HasilNegosiasi> {
    this.logger.log('Memulai pembuatan draf negosiasi');

    const daftarKlausul = klausulBerisiko
      .map((k) => `- ${k.judul} (risiko: ${k.risiko})`)
      .join('\n');

    const prompt = `Anda adalah ahli negosiasi kontrak freelance Indonesia. Buat draf kontrak yang lebih adil berdasarkan analisis berikut.

KONTRAK ASLI:
${teksKontrak.slice(0, 80000)}

KLAUSUL BERISIKO YANG PERLU DIREVISI:
${daftarKlausul}

${instruksiTambahan ? `INSTRUKSI TAMBAHAN DARI KLIEN:\n${instruksiTambahan}\n` : ''}

Berikan hasil dalam format JSON berikut (HANYA JSON, tanpa teks lain):
{
  "ringkasan": "<ringkasan perubahan utama yang dilakukan>",
  "drafDokumen": "<teks lengkap kontrak yang sudah direvisi>",
  "poinPerubahan": [
    {
      "klausulAsli": "<teks klausul sebelum perubahan>",
      "klausulBaru": "<teks klausul setelah perubahan>",
      "alasan": "<alasan perubahan ini menguntungkan freelancer>"
    }
  ]
}

Pastikan perubahan:
- Melindungi hak freelancer
- Sesuai hukum Indonesia
- Tetap masuk akal bagi klien
- Memperjelas syarat pembayaran`;

    const kontenRespons = await this.kirimPrompt(prompt);
    return this.parseJsonRespons<HasilNegosiasi>(kontenRespons);
  }

  private parseJsonRespons<T>(teks: string): T {
    try {
      // Hapus markdown code block jika ada
      const bersih = teks
        .replace(/^```(?:json)?\n?/m, '')
        .replace(/\n?```$/m, '')
        .trim();
      return JSON.parse(bersih) as T;
    } catch (err) {
      this.logger.error(`Gagal parse JSON respons LLM: ${String(err)}`);
      this.logger.debug(`Respons raw: ${teks.slice(0, 500)}`);
      throw new Error(`Respons LLM tidak valid: ${String(err)}`);
    }
  }
}
