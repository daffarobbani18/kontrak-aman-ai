import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PayloadBuatLinkMayar {
  /** Nama produk yang ditampilkan di halaman pembayaran */
  name: string;
  /** Deskripsi singkat produk */
  description: string;
  /** Jumlah dalam Rupiah (IDR) */
  amount: number;
  /** URL redirect setelah pembayaran selesai */
  redirectUrl: string;
  /** Waktu kadaluarsa link (ISO 8601) */
  expiredAt: string;
}

export interface HasilLinkMayar {
  id: string;
  link: string;
}

@Injectable()
export class MayarService {
  private readonly logger = new Logger(MayarService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly redirectUrl: string;

  constructor(private readonly cfg: ConfigService) {
    this.baseUrl = cfg.get<string>(
      'MAYAR_BASE_URL',
      'https://api.mayar.id',
    );
    this.apiKey = cfg.getOrThrow<string>('MAYAR_API_KEY');
    this.redirectUrl = cfg.get<string>(
      'MAYAR_REDIRECT_URL',
      'https://kontrakaman.id/langganan/sukses',
    );
  }

  /**
   * Buat payment link via Mayar API v2.
   * POST {baseUrl}/hl/v2/products/payment-link/create
   */
  async buatLinkPembayaran(payload: PayloadBuatLinkMayar): Promise<HasilLinkMayar> {
    const url = `${this.baseUrl}/hl/v2/products/payment-link/create`;

    try {
      const respons = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!respons.ok) {
        const teks = await respons.text();
        throw new Error(`Mayar API error (${respons.status}): ${teks}`);
      }

      const json = (await respons.json()) as { data: HasilLinkMayar };

      if (!json?.data?.link) {
        throw new Error('Respons Mayar tidak mengandung link pembayaran');
      }

      return json.data;
    } catch (err: unknown) {
      const pesan = err instanceof Error ? err.message : String(err);
      this.logger.error(`Gagal membuat payment link Mayar: ${pesan}`);
      throw new InternalServerErrorException(
        'Gagal membuat sesi pembayaran. Silakan coba lagi.',
      );
    }
  }

  /** Buat waktu kadaluarsa 24 jam dari sekarang dalam format ISO 8601 */
  buatWaktuKadaluarsa(jamKedepan = 24): string {
    const waktu = new Date();
    waktu.setHours(waktu.getHours() + jamKedepan);
    return waktu.toISOString();
  }

  get urlRedirect(): string {
    return this.redirectUrl;
  }
}
