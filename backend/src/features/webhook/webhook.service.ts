import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.module';
import { EmailService } from '../../shared/email/email.module';

export interface PayloadWebhookMayar {
  event: string;
  data: Record<string, unknown>;
  timestamp?: string;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cfg: ConfigService,
    private readonly email: EmailService,
  ) {}

  /** Proses webhook Mayar dengan HMAC verification + idempotency */
  async prosesWebhookMayar(
    signature: string,
    rawBody: Buffer,
    payload: PayloadWebhookMayar,
  ): Promise<void> {
    // 1. Verifikasi HMAC signature
    this.verifikasiSignature(signature, rawBody);

    // 2. Idempotency — cek apakah event sudah diproses
    const idempotencyKey = `${payload.event}-${String(payload.data['id'] ?? payload.data['transaction_id'] ?? '')}`;
    const sudahDiproses = await this.prisma.webhookEvent.findFirst({
      where: { idempotency_key: idempotencyKey, processed: true },
    });

    if (sudahDiproses) {
      this.logger.log(`Webhook duplikat diabaikan: ${idempotencyKey}`);
      return;
    }

    // 3. Simpan event
    const webhookEvent = await this.prisma.webhookEvent.create({
      data: {
        event_type: payload.event,
        payload: payload as unknown as import('@prisma/client').Prisma.InputJsonValue,
        idempotency_key: idempotencyKey,
        processed: false,
      },
    });

    try {
      // 4. Proses berdasarkan jenis event
      await this.prosesEvent(payload);

      // 5. Tandai sudah diproses
      await this.prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { processed: true, processed_at: new Date() },
      });
    } catch (err) {
      this.logger.error(
        `Gagal memproses webhook ${payload.event}: ${String(err)}`,
      );
      await this.prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { error_message: String(err) },
      });
      throw err;
    }
  }

  private async prosesEvent(payload: PayloadWebhookMayar): Promise<void> {
    switch (payload.event) {
      case 'payment.received':
        await this.prosesPaymentReceived(payload.data);
        break;

      case 'membership.activated':
      case 'membership.renewed':
        await this.prosesMembershipAktif(payload.data);
        break;

      case 'membership.cancelled':
        await this.prosesMembershipBerakhir(payload.data, 'cancelled');
        break;

      case 'membership.expired':
        await this.prosesMembershipBerakhir(payload.data, 'expired');
        break;

      case 'payment.expired':
        await this.prosesPaymentExpired(payload.data);
        break;

      default:
        this.logger.warn(`Event webhook tidak dikenal: ${payload.event}`);
    }
  }

  private async prosesPaymentReceived(
    data: Record<string, unknown>,
  ): Promise<void> {
    const externalId = String(data['external_id'] ?? data['reference'] ?? '');
    const gatewayId = String(data['id'] ?? '');

    // Cari transaksi: utamakan external_id, fallback ke gateway_transaction_id
    const transaksi = await this.prisma.transaction.findFirst({
      where: externalId
        ? { external_id: externalId }
        : { gateway_transaction_id: gatewayId },
    });

    if (!transaksi) {
      this.logger.warn(
        `Transaksi tidak ditemukan untuk external_id: ${externalId}, gateway_id: ${gatewayId}`,
      );
      return;
    }

    await this.prisma.transaction.update({
      where: { id: transaksi.id },
      data: {
        status: 'PAID',
        paid_at: new Date(),
        gateway_transaction_id: gatewayId || transaksi.gateway_transaction_id,
      },
    });

    this.logger.log(`Pembayaran diterima untuk transaksi ${transaksi.id}`);
  }

  /** Tandai transaksi sebagai kedaluwarsa ketika Mayar mengirim payment.expired */
  private async prosesPaymentExpired(
    data: Record<string, unknown>,
  ): Promise<void> {
    const externalId = String(data['external_id'] ?? data['reference'] ?? '');
    const gatewayId = String(data['id'] ?? '');

    const transaksi = await this.prisma.transaction.findFirst({
      where: externalId
        ? { external_id: externalId }
        : { gateway_transaction_id: gatewayId },
    });

    if (!transaksi) {
      this.logger.warn(
        `Transaksi tidak ditemukan untuk payment.expired — external_id: ${externalId}, gateway_id: ${gatewayId}`,
      );
      return;
    }

    // Hanya update jika masih PENDING — hindari overwrite status PAID
    if (transaksi.status !== 'PENDING') {
      this.logger.warn(
        `payment.expired diabaikan — transaksi ${transaksi.id} sudah berstatus ${transaksi.status}`,
      );
      return;
    }

    await this.prisma.transaction.update({
      where: { id: transaksi.id },
      data: { status: 'EXPIRED' },
    });

    this.logger.log(`Transaksi ${transaksi.id} ditandai EXPIRED via Mayar payment.expired`);
  }

  private async prosesMembershipAktif(
    data: Record<string, unknown>,
  ): Promise<void> {
    const userId = String(data['customer_id'] ?? data['user_id'] ?? '');
    const productId = String(data['product_id'] ?? '');
    const periodeAwal = new Date(String(data['start_date'] ?? Date.now()));
    const periodeAkhir = new Date(String(data['end_date'] ?? Date.now()));

    if (!userId || !productId) return;

    // Temukan paket berdasarkan mayar_product_id
    const paket = await this.prisma.plan.findFirst({
      where: { mayar_product_id: productId },
    });

    if (!paket) {
      this.logger.warn(`Paket tidak ditemukan untuk product_id: ${productId}`);
      return;
    }

    // Nonaktifkan langganan lama
    await this.prisma.subscription.updateMany({
      where: { user_id: userId, status: 'ACTIVE' },
      data: { status: 'EXPIRED' },
    });

    // Buat langganan baru
    await this.prisma.subscription.create({
      data: {
        user_id: userId,
        plan_id: paket.id,
        status: 'ACTIVE',
        current_period_start: periodeAwal,
        current_period_end: periodeAkhir,
        mayar_subscription_id: String(data['id'] ?? ''),
      },
    });

    this.logger.log(`Langganan aktif untuk pengguna ${userId}, paket ${paket.name}`);

    // Kirim email konfirmasi pembayaran jika preferensi notifikasi aktif
    const pengguna = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, notif_email_audit: true },
    });
    if (pengguna?.notif_email_audit) {
      this.email
        .kirim({
          ke: pengguna.email,
          subjek: `Pembayaran Berhasil — Langganan ${paket.name} Aktif`,
          html: this.email.htmlPembayaranBerhasil({
            nama: pengguna.name,
            namaPaket: paket.name,
            periodeAkhir: periodeAkhir,
          }),
        })
        .catch((err: unknown) => {
          this.logger.error(
            `Gagal kirim email konfirmasi pembayaran ke ${pengguna.email}: ${String(err)}`,
          );
        });
    }
  }

  private async prosesMembershipBerakhir(
    data: Record<string, unknown>,
    jenis: 'cancelled' | 'expired',
  ): Promise<void> {
    const subscriptionId = String(data['id'] ?? '');
    if (!subscriptionId) return;

    const statusBaru = jenis === 'cancelled' ? 'CANCELLED' : 'EXPIRED';
    const updateData =
      jenis === 'cancelled'
        ? { status: statusBaru as 'CANCELLED', cancelled_at: new Date() }
        : { status: statusBaru as 'EXPIRED' };

    // Ambil data langganan + pengguna untuk notifikasi email
    const langganan = await this.prisma.subscription.findFirst({
      where: { mayar_subscription_id: subscriptionId },
      include: {
        user: { select: { email: true, name: true, notif_email_audit: true } },
        plan: { select: { name: true } },
      },
    });

    if (!langganan) {
      this.logger.warn(`Langganan tidak ditemukan untuk mayar_subscription_id: ${subscriptionId}`);
      return;
    }

    await this.prisma.subscription.update({
      where: { id: langganan.id },
      data: updateData,
    });

    this.logger.log(`Langganan ${subscriptionId} ditandai ${statusBaru}`);

    // Kirim email notifikasi jika preferensi aktif
    if (langganan.user.notif_email_audit) {
      this.email
        .kirim({
          ke: langganan.user.email,
          subjek:
            jenis === 'cancelled'
              ? `Langganan ${langganan.plan.name} Telah Dibatalkan — KontrakAman AI`
              : `Langganan ${langganan.plan.name} Telah Berakhir — KontrakAman AI`,
          html: this.email.htmlLanggananBerakhir({
            nama: langganan.user.name ?? 'Pengguna',
            namaPaket: langganan.plan.name,
            alasan: jenis,
          }),
        })
        .catch((err: unknown) => {
          this.logger.error(
            `Gagal kirim email notifikasi langganan ${jenis} ke ${langganan.user.email}: ${String(err)}`,
          );
        });
    }
  }

  private verifikasiSignature(signature: string, rawBody: Buffer): void {
    const secret = this.cfg.getOrThrow<string>('MAYAR_WEBHOOK_SECRET');
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    // Perbandingan aman dari timing attack
    const sigValid =
      signature.length === expectedSig.length &&
      crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSig, 'hex'),
      );

    if (!sigValid) {
      throw new UnauthorizedException('Signature webhook tidak valid');
    }
  }
}
