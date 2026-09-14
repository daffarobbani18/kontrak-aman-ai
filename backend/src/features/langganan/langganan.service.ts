import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.module';
import { KuotaService } from '../../shared/kuota/kuota.module';
import { DtoBuatSesiPembayaran, DtoDaftarTransaksi } from './dto/langganan.dto';
import { MayarService } from './mayar.service';

@Injectable()
export class LanggananService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mayar: MayarService,
    private readonly kuotaSvc: KuotaService,
  ) {}

  /** Ambil semua paket tersedia */
  async daftarPaket() {
    const paket = await this.prisma.plan.findMany({
      where: { is_active: true },
      orderBy: { price: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        tier: true,
        price: true,
        currency: true,
        billing_cycle: true,
        audit_limit: true,
        negotiation_limit: true,
        features: true,
        mayar_product_id: true,
      },
    });

    return paket.map((p) => ({
      id: p.id,
      nama: p.name,
      deskripsi: p.description,
      tier: p.tier,
      harga: p.price,
      mata_uang: p.currency,
      siklus_tagihan: p.billing_cycle,
      batas_audit: p.audit_limit,
      batas_negosiasi: p.negotiation_limit,
      fitur: p.features,
      mayarProductId: p.mayar_product_id,
    }));
  }

  /**
   * Buat sesi pembayaran Mayar.
   * Memanggil Mayar API v2 untuk mendapat payment link nyata.
   */
  async buatSesiPembayaran(
    penggunaId: string,
    dto: DtoBuatSesiPembayaran,
  ) {
    const paket = await this.prisma.plan.findFirst({
      where: { id: dto.planId, is_active: true },
    });

    if (!paket) {
      throw new NotFoundException('Paket langganan tidak ditemukan');
    }

    // Cek apakah sudah berlangganan aktif
    const langgananAktif = await this.prisma.subscription.findFirst({
      where: {
        user_id: penggunaId,
        status: 'ACTIVE',
        current_period_end: { gt: new Date() },
      },
    });

    if (langgananAktif) {
      throw new BadRequestException(
        'Anda sudah memiliki langganan aktif. Batalkan terlebih dahulu untuk berganti paket.',
      );
    }

    // Buat record transaksi pending terlebih dahulu
    const transaksi = await this.prisma.transaction.create({
      data: {
        user_id: penggunaId,
        plan_id: dto.planId,
        amount: paket.price,
        currency: paket.currency,
        status: 'PENDING',
      },
    });

    // Panggil Mayar API untuk generate payment link
    const hasilMayar = await this.mayar.buatLinkPembayaran({
      name: `Langganan ${paket.name}`,
      description: paket.description ?? `Paket ${paket.tier} KontrakAman`,
      amount: paket.price,
      redirectUrl: this.mayar.urlRedirect,
      expiredAt: this.mayar.buatWaktuKadaluarsa(24),
    });

    // Simpan payment link ke transaksi
    await this.prisma.transaction.update({
      where: { id: transaksi.id },
      data: {
        payment_url: hasilMayar.link,
        mayar_payment_link_id: hasilMayar.id,
      },
    });

    return {
      transaksiId: transaksi.id,
      paymentUrl: hasilMayar.link,
      jumlah: paket.price,
      mata_uang: paket.currency,
      kadaluarsa: this.mayar.buatWaktuKadaluarsa(24),
    };
  }

  /** Ambil langganan aktif pengguna */
  async langgananAktif(penggunaId: string) {
    const langganan = await this.prisma.subscription.findFirst({
      where: {
        user_id: penggunaId,
        status: 'ACTIVE',
        current_period_end: { gt: new Date() },
      },
      include: {
        plan: {
          select: {
            name: true,
            tier: true,
            audit_limit: true,
            negotiation_limit: true,
            features: true,
          },
        },
      },
    });

    if (!langganan) return null;

    return {
      id: langganan.id,
      status: langganan.status,
      paket: langganan.plan.name,
      tier: langganan.plan.tier,
      batasAudit: langganan.plan.audit_limit,
      batasNegosiasi: langganan.plan.negotiation_limit,
      fitur: langganan.plan.features,
      mulaiPada: langganan.current_period_start,
      berakhirPada: langganan.current_period_end,
    };
  }

  /** Batalkan langganan aktif */
  async batalkan(penggunaId: string): Promise<void> {
    const langganan = await this.prisma.subscription.findFirst({
      where: {
        user_id: penggunaId,
        status: 'ACTIVE',
        current_period_end: { gt: new Date() },
      },
    });

    if (!langganan) {
      throw new NotFoundException('Tidak ada langganan aktif yang bisa dibatalkan');
    }

    await this.prisma.subscription.update({
      where: { id: langganan.id },
      data: { status: 'CANCELLED', cancelled_at: new Date() },
    });
  }

  /**
   * Ambil sisa kuota audit & negosiasi pengguna bulan ini (F-BILL-01)
   * Mencakup: terpakai, batas, sisa, dan sumber kuota (override/langganan/default)
   */
  async kuota(penggunaId: string) {
    const [kuotaAudit, kuotaNegosiasi] = await Promise.all([
      this.kuotaSvc.periksa(penggunaId, 'audit'),
      this.kuotaSvc.periksa(penggunaId, 'negosiasi'),
    ]);

    return {
      audit: {
        terpakai: kuotaAudit.terpakai,
        batas: kuotaAudit.batas,
        sisa: kuotaAudit.sisaKuota === Infinity ? null : kuotaAudit.sisaKuota,
        unlimited: kuotaAudit.batas === -1,
      },
      negosiasi: {
        terpakai: kuotaNegosiasi.terpakai,
        batas: kuotaNegosiasi.batas,
        sisa: kuotaNegosiasi.sisaKuota === Infinity ? null : kuotaNegosiasi.sisaKuota,
        unlimited: kuotaNegosiasi.batas === -1,
      },
    };
  }

  /** Detail invoice satu transaksi (F-BILL-03) */
  async invoice(penggunaId: string, transaksiId: string) {
    const transaksi = await this.prisma.transaction.findFirst({
      where: { id: transaksiId, user_id: penggunaId },
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        payment_method: true,
        gateway_transaction_id: true,
        paid_at: true,
        created_at: true,
        plan: {
          select: {
            name: true,
            tier: true,
            billing_cycle: true,
            price: true,
            currency: true,
          },
        },
        user: { select: { name: true, email: true } },
      },
    });

    if (!transaksi) {
      throw new NotFoundException('Transaksi tidak ditemukan');
    }

    // Nomor invoice dari ID transaksi (format: INV-{8 char uppercase})
    const nomorInvoice = `INV-${transaksi.id.slice(-8).toUpperCase()}`;

    return {
      nomorInvoice,
      tanggalInvoice: transaksi.created_at,
      tanggalBayar: transaksi.paid_at,
      status: transaksi.status,
      pelanggan: {
        nama: transaksi.user.name,
        email: transaksi.user.email,
      },
      paket: transaksi.plan
        ? {
            nama: transaksi.plan.name,
            tier: transaksi.plan.tier,
            siklusPenagihan: transaksi.plan.billing_cycle,
          }
        : null,
      pembayaran: {
        jumlah: transaksi.amount,
        matauang: transaksi.currency,
        metode: transaksi.payment_method ?? null,
        gatewayTransaksiId: transaksi.gateway_transaction_id ?? null,
      },
    };
  }

  /** Riwayat transaksi pengguna dengan paginasi */
  async transaksi(penggunaId: string, dto: DtoDaftarTransaksi = {}) {
    const halaman = dto.halaman ?? 1;
    const perHalaman = Math.min(dto.perHalaman ?? 20, 50);
    const skip = (halaman - 1) * perHalaman;

    const [transaksi, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { user_id: penggunaId },
        orderBy: { created_at: 'desc' },
        skip,
        take: perHalaman,
        include: {
          plan: { select: { name: true, tier: true } },
        },
      }),
      this.prisma.transaction.count({ where: { user_id: penggunaId } }),
    ]);

    return {
      data: transaksi.map((t) => ({
        id: t.id,
        jumlah: t.amount,
        mata_uang: t.currency,
        status: t.status,
        namaPaket: t.plan?.name ?? null,
        dibayarPada: t.paid_at,
        dibuatPada: t.created_at,
      })),
      paginasi: {
        halaman,
        perHalaman,
        totalData: total,
        totalHalaman: Math.ceil(total / perHalaman),
      },
    };
  }
}
