import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { OcrService } from '../features/ocr/ocr.service';
import { AnalisisService } from '../features/analisis/analisis.service';
import { ANTRIAN_DRAF_NEGOSIASI } from '../app.module';

export interface PayloadNegosiasi {
  negosiasiId: string;
  auditId: string;
  penggunaId: string;
  fileKey: string;
  mimeType: string;
  instruksiTambahan?: string | null;
  klausulBerisiko: Array<{ id: string; judul: string; risiko: string }>;
}

@Processor(ANTRIAN_DRAF_NEGOSIASI, {
  concurrency: 2,
})
export class NegosiasiWorker extends WorkerHost {
  private readonly logger = new Logger(NegosiasiWorker.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly backendApiUrl: string;
  private readonly internalApiKey: string;

  constructor(
    private readonly ocr: OcrService,
    private readonly analisis: AnalisisService,
    private readonly cfg: ConfigService,
  ) {
    super();
    this.bucket = cfg.getOrThrow<string>('SUPABASE_S3_BUCKET');
    this.backendApiUrl = cfg.get<string>('BACKEND_API_URL', 'http://localhost:3000');
    this.internalApiKey = cfg.getOrThrow<string>('INTERNAL_API_KEY');
    this.s3 = new S3Client({
      endpoint: cfg.getOrThrow<string>('SUPABASE_S3_ENDPOINT'),
      region: cfg.get<string>('SUPABASE_S3_REGION', 'ap-southeast-1'),
      credentials: {
        accessKeyId: cfg.getOrThrow<string>('SUPABASE_S3_ACCESS_KEY'),
        secretAccessKey: cfg.getOrThrow<string>('SUPABASE_S3_SECRET_KEY'),
      },
      forcePathStyle: true,
    });
  }

  onFailed(job: Job<PayloadNegosiasi> | undefined, err: Error): void {
    const negosiasiId = job?.data?.negosiasiId ?? 'tidak diketahui';
    const percobaan = job?.attemptsMade ?? 0;
    const maks = job?.opts?.attempts ?? 3;
    this.logger.error(
      `Job negosiasi ${negosiasiId} gagal (percobaan ${percobaan}/${maks}): ${err.message}`,
    );
  }

  async process(job: Job<PayloadNegosiasi>): Promise<void> {
    const { negosiasiId, fileKey, mimeType, klausulBerisiko, instruksiTambahan } =
      job.data;
    this.logger.log(`Memproses negosiasi ${negosiasiId}, file: ${fileKey}`);

    try {
      // 1. Unduh file dari Supabase S3
      await job.updateProgress(10);
      const buffer = await this.unduhFile(fileKey);

      // 2. OCR / ekstrak teks
      await job.updateProgress(30);
      const teksKontrak = await this.ocr.ekstrakTeks(buffer, mimeType);

      // 3. Buat draf negosiasi
      await job.updateProgress(50);
      const hasilNegosiasi = await this.analisis.buatDrafNegosiasi(
        teksKontrak,
        klausulBerisiko,
        instruksiTambahan,
      );

      // 4. Kirim hasil ke backend-api
      await job.updateProgress(90);
      await this.kirimHasilKeApi(negosiasiId, {
        negosiasiId,
        status: 'COMPLETED',
        ringkasan: hasilNegosiasi.ringkasan,
        drafDokumen: hasilNegosiasi.drafDokumen,
        poinPerubahan: hasilNegosiasi.poinPerubahan.map((p) => ({
          klausulAsli: p.klausulAsli,
          klausulBaru: p.klausulBaru,
          alasan: p.alasan,
        })),
      });

      await job.updateProgress(100);
      this.logger.log(`Negosiasi ${negosiasiId} selesai`);
    } catch (err) {
      this.logger.error(`Negosiasi ${negosiasiId} gagal: ${String(err)}`);
      await this.kirimHasilKeApi(negosiasiId, {
        negosiasiId,
        status: 'FAILED',
        pesanError: String(err),
      });
      throw err;
    }
  }

  private async unduhFile(fileKey: string): Promise<Buffer> {
    const respons = await this.s3.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: fileKey }),
    );

    if (!respons.Body) {
      throw new Error(`File ${fileKey} tidak ditemukan di storage`);
    }

    const chunks: Uint8Array[] = [];
    for await (const chunk of respons.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  private async kirimHasilKeApi(
    negosiasiId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const url = `${this.backendApiUrl}/v1/negosiasi/internal/selesai`;
    const respons = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-api-key': this.internalApiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!respons.ok) {
      const teks = await respons.text();
      throw new Error(
        `Callback ke backend-api gagal (${respons.status}): ${teks}`,
      );
    }
  }
}
