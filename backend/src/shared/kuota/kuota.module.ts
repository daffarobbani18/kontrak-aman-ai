import { Global, Injectable, Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';

export interface StatusKuota {
  diizinkan: boolean;
  terpakai: number;
  batas: number;
  sisaKuota: number;
  pesan?: string;
}

export type JenisKuota = 'audit' | 'negosiasi';

@Injectable()
export class KuotaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Periksa apakah pengguna masih dalam batas kuota.
   * Urutan prioritas: QuotaOverride > Langganan aktif > SystemConfig default.
   */
  async periksa(
    penggunaId: string,
    jenis: JenisKuota,
  ): Promise<StatusKuota> {
    const bulanIni = this.bulanIni();

    // 1. Ambil pemakaian bulan ini
    const pemakaian = await this.prisma.usageCounter.findUnique({
      where: {
        user_id_month_year: {
          user_id: penggunaId,
          month: bulanIni.bulan,
          year: bulanIni.tahun,
        },
      },
    });

    const terpakai =
      jenis === 'audit'
        ? (pemakaian?.audit_count ?? 0)
        : (pemakaian?.negotiation_count ?? 0);

    // 2. Cek override khusus pengguna
    const override = await this.prisma.quotaOverride.findFirst({
      where: {
        user_id: penggunaId,
        quota_type: jenis === 'audit' ? 'AUDIT' : 'NEGOTIATION',
        OR: [
          { expires_at: null },
          { expires_at: { gt: new Date() } },
        ],
      },
    });

    if (override) {
      const batas = override.limit_value;
      const sisaKuota = Math.max(0, batas - terpakai);
      return {
        diizinkan: terpakai < batas,
        terpakai,
        batas,
        sisaKuota,
        pesan: sisaKuota === 0 ? 'Kuota override telah habis' : undefined,
      };
    }

    // 3. Cek langganan aktif
    const langganan = await this.prisma.subscription.findFirst({
      where: {
        user_id: penggunaId,
        status: 'ACTIVE',
        current_period_end: { gt: new Date() },
      },
      include: { plan: true },
    });

    if (langganan) {
      const batas =
        jenis === 'audit'
          ? langganan.plan.audit_limit
          : langganan.plan.negotiation_limit;

      // -1 berarti unlimited
      if (batas === -1) {
        return { diizinkan: true, terpakai, batas: -1, sisaKuota: Infinity };
      }

      const sisaKuota = Math.max(0, batas - terpakai);
      return {
        diizinkan: terpakai < batas,
        terpakai,
        batas,
        sisaKuota,
        pesan:
          sisaKuota === 0
            ? `Kuota ${jenis} bulan ini telah habis. Upgrade paket untuk melanjutkan.`
            : undefined,
      };
    }

    // 4. Fallback ke SystemConfig (pengguna tanpa langganan = tier gratis)
    const konfigKunci =
      jenis === 'audit'
        ? 'FREE_TIER_AUDIT_LIMIT'
        : 'FREE_TIER_NEGOTIATION_LIMIT';

    const konfig = await this.prisma.systemConfig.findUnique({
      where: { key: konfigKunci },
    });

    const batasDefault = konfig ? Number(konfig.value) : 3;
    const sisaKuota = Math.max(0, batasDefault - terpakai);

    return {
      diizinkan: terpakai < batasDefault,
      terpakai,
      batas: batasDefault,
      sisaKuota,
      pesan:
        sisaKuota === 0
          ? `Kuota ${jenis} gratis bulan ini telah habis. Berlangganan untuk kuota lebih banyak.`
          : undefined,
    };
  }

  /**
   * Kurangi 1 dari penghitung pemakaian bulan ini (min 0).
   * Dipanggil saat audit/negosiasi gagal dan pengguna melakukan retry
   * agar kuota tidak terpotong ganda.
   */
  async rollbackKuota(
    penggunaId: string,
    jenis: JenisKuota,
  ): Promise<void> {
    const { bulan, tahun } = this.bulanIni();

    const pemakaian = await this.prisma.usageCounter.findUnique({
      where: {
        user_id_month_year: { user_id: penggunaId, month: bulan, year: tahun },
      },
    });
    if (!pemakaian) return; // belum ada counter, tidak perlu rollback

    if (jenis === 'audit' && pemakaian.audit_count > 0) {
      await this.prisma.usageCounter.update({
        where: {
          user_id_month_year: { user_id: penggunaId, month: bulan, year: tahun },
        },
        data: { audit_count: { decrement: 1 } },
      });
    } else if (jenis === 'negosiasi' && pemakaian.negotiation_count > 0) {
      await this.prisma.usageCounter.update({
        where: {
          user_id_month_year: { user_id: penggunaId, month: bulan, year: tahun },
        },
        data: { negotiation_count: { decrement: 1 } },
      });
    }
  }

  /**
   * Tambahkan 1 ke penghitung pemakaian bulan ini.
   * Dipanggil SETELAH pekerjaan berhasil diantrekan.
   */
  async tambahPemakaian(
    penggunaId: string,
    jenis: JenisKuota,
  ): Promise<void> {
    const { bulan, tahun } = this.bulanIni();

    await this.prisma.usageCounter.upsert({
      where: {
        user_id_month_year: {
          user_id: penggunaId,
          month: bulan,
          year: tahun,
        },
      },
      create: {
        user_id: penggunaId,
        month: bulan,
        year: tahun,
        audit_count: jenis === 'audit' ? 1 : 0,
        negotiation_count: jenis === 'negosiasi' ? 1 : 0,
      },
      update:
        jenis === 'audit'
          ? { audit_count: { increment: 1 } }
          : { negotiation_count: { increment: 1 } },
    });
  }

  private bulanIni(): { bulan: number; tahun: number } {
    const sekarang = new Date();
    return { bulan: sekarang.getMonth() + 1, tahun: sekarang.getFullYear() };
  }
}

@Global()
@Module({
  providers: [KuotaService],
  exports: [KuotaService],
})
export class KuotaModule {}
