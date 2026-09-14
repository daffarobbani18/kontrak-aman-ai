import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface OpsiUpload {
  kunci: string;
  konten: Buffer;
  tipeKonten: string;
  ukuran: number;
}

export interface HasilUpload {
  kunci: string;
  url: string;
}

export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;

  constructor(cfg: ConfigService) {
    this.bucket = cfg.getOrThrow<string>('SUPABASE_S3_BUCKET');
    this.endpoint = cfg.getOrThrow<string>('SUPABASE_S3_ENDPOINT');
    this.s3 = new S3Client({
      endpoint: this.endpoint,
      region: cfg.get<string>('SUPABASE_S3_REGION', 'ap-southeast-1'),
      credentials: {
        accessKeyId: cfg.getOrThrow<string>('SUPABASE_S3_ACCESS_KEY'),
        secretAccessKey: cfg.getOrThrow<string>('SUPABASE_S3_SECRET_KEY'),
      },
      forcePathStyle: true, // Wajib untuk Supabase S3
    });
  }

  /** Upload file ke Supabase S3 */
  async upload(opsi: OpsiUpload): Promise<HasilUpload> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: opsi.kunci,
        Body: opsi.konten,
        ContentType: opsi.tipeKonten,
        ContentLength: opsi.ukuran,
      }),
    );

    return { kunci: opsi.kunci, url: this.bangunUrl(opsi.kunci) };
  }

  /** Hapus file dari Supabase S3 */
  async hapus(kunci: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: kunci }),
    );
  }

  /** Buat presigned URL untuk download sementara (default 1 jam) */
  async buatUrlSementara(
    kunci: string,
    kadaluarsaDalamDetik = 3600,
  ): Promise<string> {
    const perintah = new GetObjectCommand({
      Bucket: this.bucket,
      Key: kunci,
    });
    return getSignedUrl(this.s3, perintah, {
      expiresIn: kadaluarsaDalamDetik,
    });
  }

  /** URL publik permanen (hanya untuk bucket yang bersifat publik) */
  bangunUrl(kunci: string): string {
    return `${this.endpoint}/${this.bucket}/${kunci}`;
  }
}

@Global()
@Module({
  providers: [
    {
      provide: StorageService,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => new StorageService(cfg),
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
