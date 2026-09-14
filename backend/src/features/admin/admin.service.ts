import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../../shared/audit-log/audit-log.module';
import { $Enums } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.module';
import {
  DtoBuatPaketAdmin,
  DtoDaftarAuditLog,
  DtoDaftarPenggunaAdmin,
  DtoDaftarTransaksiAdmin,
  DtoPerbaruiKonfigurasi,
  DtoPerbaruiKuotaAdmin,
  DtoPerbaruiPaketAdmin,
  DtoStatistikAdmin,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  /** Daftar semua pengguna dengan pencarian & paginasi */
  async daftarPengguna(dto: DtoDaftarPenggunaAdmin) {
    const halaman = dto.halaman ?? 1;
    const perHalaman = Math.min(dto.perHalaman ?? 20, 100);
    const skip = (halaman - 1) * perHalaman;

    const where = dto.q
      ? {
          OR: [
            { name: { contains: dto.q, mode: 'insensitive' as const } },
            { email: { contains: dto.q, mode: 'insensitive' as const } },
          ],
          deleted_at: null,
        }
      : { deleted_at: null };

    const [pengguna, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: perHalaman,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          email_verified: true,
          created_at: true,
          subscriptions: {
            where: { status: 'ACTIVE' },
            select: { plan: { select: { name: true, tier: true } } },
            take: 1,
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: pengguna.map((p) => ({
        id: p.id,
        email: p.email,
        nama: p.name,
        peran: p.role,
        emailTerverifikasi: p.email_verified,
        dibuatPada: p.created_at,
        langganan: p.subscriptions[0]?.plan
          ? {
              paket: p.subscriptions[0].plan.name,
              tier: p.subscriptions[0].plan.tier,
            }
          : null,
      })),
      paginasi: {
        halaman,
        perHalaman,
        totalData: total,
        totalHalaman: Math.ceil(total / perHalaman),
      },
    };
  }

  /** Detail satu pengguna */
  async detailPengguna(id: string) {
    const pengguna = await this.prisma.user.findFirst({
      where: { id, deleted_at: null },
      include: {
        subscriptions: {
          include: { plan: true },
          orderBy: { created_at: 'desc' },
          take: 3,
        },
        usage_counters: {
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
          take: 3,
        },
        quota_overrides: {
          where: {
            OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
          },
        },
      },
    });

    if (!pengguna) throw new NotFoundException('Pengguna tidak ditemukan');

    return {
      id: pengguna.id,
      email: pengguna.email,
      nama: pengguna.name,
      peran: pengguna.role,
      emailTerverifikasi: pengguna.email_verified,
      dibuatPada: pengguna.created_at,
      langganan: pengguna.subscriptions.map((s) => ({
        id: s.id,
        paket: s.plan.name,
        status: s.status,
        mulaiPada: s.current_period_start,
        berakhirPada: s.current_period_end,
      })),
      pemakaian: pengguna.usage_counters.map((u) => ({
        bulan: u.month,
        tahun: u.year,
        audit: u.audit_count,
        negosiasi: u.negotiation_count,
      })),
      overrideKuota: pengguna.quota_overrides.map((o) => ({
        tipe: o.quota_type,
        batas: o.limit_value,
        berakhirPada: o.expires_at,
      })),
    };
  }

  /** Statistik global platform dengan filter tanggal opsional */
  async statistik(dto?: DtoStatistikAdmin) {
    const sekarang = new Date();
    const bulanIni = new Date(sekarang.getFullYear(), sekarang.getMonth(), 1);

    // Bangun filter rentang tanggal dari query params
    const filterTanggal =
      dto?.dari || dto?.sampai
        ? {
            ...(dto.dari && { gte: new Date(dto.dari) }),
            ...(dto.sampai && { lte: new Date(dto.sampai) }),
          }
        : undefined;

    const [
      totalPengguna,
      penggunaBaru,
      totalAudit,
      auditBulanIni,
      auditDifilter,
      langgananAktif,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deleted_at: null } }),
      this.prisma.user.count({
        where: { deleted_at: null, created_at: { gte: bulanIni } },
      }),
      this.prisma.audit.count(),
      this.prisma.audit.count({ where: { created_at: { gte: bulanIni } } }),
      filterTanggal
        ? this.prisma.audit.count({ where: { created_at: filterTanggal } })
        : Promise.resolve(undefined),
      this.prisma.subscription.count({
        where: { status: 'ACTIVE', current_period_end: { gt: sekarang } },
      }),
    ]);

    return {
      totalPengguna,
      penggunaBaru,
      totalAudit,
      auditBulanIni,
      ...(filterTanggal !== undefined && { auditDifilter }),
      langgananAktif,
      ...(filterTanggal !== undefined && {
        filter: {
          dari: dto?.dari ?? null,
          sampai: dto?.sampai ?? null,
        },
      }),
    };
  }

  /** Set override kuota untuk pengguna */
  async perbaruiKuota(
    penggunaId: string,
    dto: DtoPerbaruiKuotaAdmin,
  ): Promise<void> {
    const pengguna = await this.prisma.user.findFirst({
      where: { id: penggunaId, deleted_at: null },
    });
    if (!pengguna) throw new NotFoundException('Pengguna tidak ditemukan');

    const tipeKuota: Array<{ tipe: 'AUDIT' | 'NEGOTIATION'; batas?: number }> =
      [
        { tipe: 'AUDIT', batas: dto.batasAudit },
        { tipe: 'NEGOTIATION', batas: dto.batasNegosiasi },
      ];

    await Promise.all(
      tipeKuota
        .filter((k) => k.batas !== undefined)
        .map((k) =>
          this.prisma.quotaOverride.upsert({
            where: {
              user_id_quota_type: {
                user_id: penggunaId,
                quota_type: k.tipe,
              },
            },
            create: {
              user_id: penggunaId,
              quota_type: k.tipe,
              limit_value: k.batas!,
            },
            update: { limit_value: k.batas! },
          }),
        ),
    );
  }

  /** Daftar audit log dengan filter & cursor pagination */
  async daftarAuditLog(dto: DtoDaftarAuditLog) {
    const perHalaman = Math.min(dto.perHalaman ?? 20, 100);

    const where: Record<string, unknown> = {};
    if (dto.penggunaId) where['user_id'] = dto.penggunaId;
    if (dto.aksi) where['action'] = { contains: dto.aksi, mode: 'insensitive' };
    if (dto.dari || dto.sampai) {
      where['created_at'] = {
        ...(dto.dari && { gte: new Date(dto.dari) }),
        ...(dto.sampai && { lte: new Date(dto.sampai) }),
      };
    }

    const log = await this.prisma.auditLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: perHalaman + 1,
      ...(dto.cursor ? { cursor: { id: dto.cursor }, skip: 1 } : {}),
      select: {
        id: true,
        user_id: true,
        action: true,
        entity: true,
        entity_id: true,
        ip_address: true,
        created_at: true,
        user: { select: { email: true, name: true } },
      },
    });

    const adaHalamanBerikut = log.length > perHalaman;
    const data = adaHalamanBerikut ? log.slice(0, perHalaman) : log;

    return {
      data: data.map((l) => ({
        id: l.id,
        penggunaId: l.user_id,
        emailPengguna: l.user?.email ?? null,
        namaPengguna: l.user?.name ?? null,
        aksi: l.action,
        entitas: l.entity,
        entitasId: l.entity_id,
        ipAddress: l.ip_address,
        dibuatPada: l.created_at,
      })),
      cursorBerikut: adaHalamanBerikut ? data[data.length - 1]?.id : null,
      adaHalamanBerikut,
    };
  }

  /** Daftar semua quota override milik satu pengguna */
  async daftarKuotaOverride(penggunaId: string) {
    const pengguna = await this.prisma.user.findFirst({
      where: { id: penggunaId, deleted_at: null },
    });
    if (!pengguna) throw new NotFoundException('Pengguna tidak ditemukan');

    const overrides = await this.prisma.quotaOverride.findMany({
      where: { user_id: penggunaId },
      orderBy: { created_at: 'desc' },
    });

    return overrides.map((o) => ({
      id: o.id,
      tipe: o.quota_type,
      batas: o.limit_value,
      berakhirPada: o.expires_at,
      dibuatPada: o.created_at,
    }));
  }

  /** Daftar semua transaksi dengan paginasi & filter opsional */
  async daftarTransaksi(dto: DtoDaftarTransaksiAdmin) {
    const halaman = dto.halaman ?? 1;
    const perHalaman = Math.min(dto.perHalaman ?? 20, 100);
    const skip = (halaman - 1) * perHalaman;

    const where: Record<string, unknown> = {};
    if (dto.penggunaId) where['user_id'] = dto.penggunaId;
    if (dto.status) where['status'] = dto.status;

    const [transaksi, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: perHalaman,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          user_id: true,
          amount: true,
          currency: true,
          status: true,
          payment_method: true,
          paid_at: true,
          created_at: true,
          user: { select: { email: true, name: true } },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: transaksi.map((t) => ({
        id: t.id,
        penggunaId: t.user_id,
        emailPengguna: t.user?.email ?? null,
        namaPengguna: t.user?.name ?? null,
        jumlah: t.amount,
        mataUang: t.currency,
        status: t.status,
        metodePembayaran: t.payment_method,
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

  // ── Suspend / Aktifkan Pengguna ──────────────────────────────────────────

  /** Suspend pengguna — blokir akses tanpa menghapus data (F-ADMIN) */
  async suspendPengguna(id: string): Promise<void> {
    const pengguna = await this.prisma.user.findFirst({
      where: { id, deleted_at: null },
    });
    if (!pengguna) throw new NotFoundException('Pengguna tidak ditemukan');
    if (pengguna.is_suspended) throw new BadRequestException('Pengguna sudah dalam status tersuspensi');

    await this.prisma.user.update({
      where: { id },
      data: { is_suspended: true, suspended_at: new Date() },
    });

    await this.auditLog
      .catat({
        penggunaId: id,
        aksi: 'suspend-pengguna',
        entitas: 'pengguna',
        entitasId: id,
      })
      .catch((err: unknown) =>
        this.logger.warn(`Gagal catat audit log suspend-pengguna: ${String(err)}`),
      );

    this.logger.log(`Pengguna ${id} berhasil disuspend`);
  }

  /** Aktifkan kembali pengguna yang tersuspensi */
  async aktifkanPengguna(id: string): Promise<void> {
    const pengguna = await this.prisma.user.findFirst({
      where: { id, deleted_at: null },
    });
    if (!pengguna) throw new NotFoundException('Pengguna tidak ditemukan');
    if (!pengguna.is_suspended) throw new BadRequestException('Pengguna tidak dalam status tersuspensi');

    await this.prisma.user.update({
      where: { id },
      data: { is_suspended: false, suspended_at: null },
    });

    await this.auditLog
      .catat({
        penggunaId: id,
        aksi: 'aktifkan-pengguna',
        entitas: 'pengguna',
        entitasId: id,
      })
      .catch((err: unknown) =>
        this.logger.warn(`Gagal catat audit log aktifkan-pengguna: ${String(err)}`),
      );

    this.logger.log(`Pengguna ${id} berhasil diaktifkan kembali`);
  }

  // ── Nonaktifkan Pengguna ───────────────────────────────────────────────────

  /** Nonaktifkan pengguna (soft delete via deleted_at) */
  async nonaktifkanPengguna(id: string): Promise<void> {
    const pengguna = await this.prisma.user.findFirst({
      where: { id, deleted_at: null },
    });
    if (!pengguna) throw new NotFoundException('Pengguna tidak ditemukan');

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: { deleted_at: new Date() },
      });
      // Batalkan semua langganan aktif
      await tx.subscription.updateMany({
        where: { user_id: id, status: 'ACTIVE' },
        data: { status: 'CANCELLED', cancelled_at: new Date() },
      });
    });

    await this.auditLog
      .catat({
        penggunaId: id,
        aksi: 'nonaktifkan-pengguna',
        entitas: 'pengguna',
        entitasId: id,
      })
      .catch((err: unknown) =>
        this.logger.warn(
          `Gagal catat audit log nonaktifkan-pengguna: ${String(err)}`,
        ),
      );
  }

  // ── Konfigurasi Sistem ─────────────────────────────────────────────────────

  /** Daftar semua konfigurasi sistem */
  async daftarKonfigurasi() {
    const configs = await this.prisma.systemConfig.findMany({
      orderBy: { key: 'asc' },
    });
    return configs.map((c) => ({
      id: c.id,
      kunci: c.key,
      nilai: c.value,
      deskripsi: c.description,
      dibuatPada: c.created_at,
      diperbaruiPada: c.updated_at,
    }));
  }

  /** Ambil satu konfigurasi berdasarkan key */
  async ambilKonfigurasi(key: string) {
    const config = await this.prisma.systemConfig.findUnique({
      where: { key },
    });
    if (!config)
      throw new NotFoundException(`Konfigurasi '${key}' tidak ditemukan`);
    return {
      id: config.id,
      kunci: config.key,
      nilai: config.value,
      deskripsi: config.description,
      dibuatPada: config.created_at,
      diperbaruiPada: config.updated_at,
    };
  }

  /** Perbarui (upsert) nilai konfigurasi sistem */
  async perbaruiKonfigurasi(key: string, dto: DtoPerbaruiKonfigurasi) {
    const config = await this.prisma.systemConfig.upsert({
      where: { key },
      update: { value: dto.nilai },
      create: { key, value: dto.nilai },
    });
    return {
      id: config.id,
      kunci: config.key,
      nilai: config.value,
      deskripsi: config.description,
      diperbaruiPada: config.updated_at,
    };
  }

  // ── Manajemen Paket ────────────────────────────────────────────────────────────────────────────────

  /** Daftar semua paket termasuk nonaktif */
  async daftarPaket() {
    const paket = await this.prisma.plan.findMany({
      orderBy: { price: 'asc' },
    });
    return paket.map((p) => this.formatPaket(p));
  }

  /** Detail satu paket */
  async detailPaket(id: string) {
    const paket = await this.prisma.plan.findUnique({ where: { id } });
    if (!paket) throw new NotFoundException('Paket tidak ditemukan');
    return this.formatPaket(paket);
  }

  /** Buat paket baru */
  async buatPaket(dto: DtoBuatPaketAdmin) {
    const paket = await this.prisma.plan.create({
      data: {
        name: dto.nama,
        description: dto.deskripsi,
        tier: dto.tier as $Enums.SubscriptionTier,
        price: dto.harga,
        currency: dto.mataUang ?? 'IDR',
        billing_cycle: (dto.siklusTagihan ?? 'MONTHLY') as $Enums.BillingCycle,
        audit_limit: dto.batasAudit,
        negotiation_limit: dto.batasNegosiasi,
        mayar_product_id: dto.mayarProductId,
        is_active: dto.aktif ?? true,
      },
    });
    return this.formatPaket(paket);
  }

  /** Perbarui paket yang ada */
  async perbaruiPaket(id: string, dto: DtoPerbaruiPaketAdmin) {
    const ada = await this.prisma.plan.findUnique({ where: { id } });
    if (!ada) throw new NotFoundException('Paket tidak ditemukan');

    const paket = await this.prisma.plan.update({
      where: { id },
      data: {
        ...(dto.nama !== undefined && { name: dto.nama }),
        ...(dto.deskripsi !== undefined && { description: dto.deskripsi }),
        ...(dto.tier !== undefined && { tier: dto.tier as $Enums.SubscriptionTier }),
        ...(dto.harga !== undefined && { price: dto.harga }),
        ...(dto.mataUang !== undefined && { currency: dto.mataUang }),
        ...(dto.siklusTagihan !== undefined && { billing_cycle: dto.siklusTagihan as $Enums.BillingCycle }),
        ...(dto.batasAudit !== undefined && { audit_limit: dto.batasAudit }),
        ...(dto.batasNegosiasi !== undefined && { negotiation_limit: dto.batasNegosiasi }),
        ...(dto.mayarProductId !== undefined && { mayar_product_id: dto.mayarProductId }),
        ...(dto.aktif !== undefined && { is_active: dto.aktif }),
      },
    });
    return this.formatPaket(paket);
  }

  /** Nonaktifkan paket (soft delete via is_active = false) */
  async hapusPaket(id: string): Promise<void> {
    const ada = await this.prisma.plan.findUnique({ where: { id } });
    if (!ada) throw new NotFoundException('Paket tidak ditemukan');
    await this.prisma.plan.update({
      where: { id },
      data: { is_active: false },
    });
  }

  private formatPaket(p: {
    id: string;
    name: string;
    description: string | null;
    tier: string;
    price: number;
    currency: string;
    billing_cycle: string;
    audit_limit: number;
    negotiation_limit: number;
    mayar_product_id: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }) {
    return {
      id: p.id,
      nama: p.name,
      deskripsi: p.description,
      tier: p.tier,
      harga: p.price,
      mataUang: p.currency,
      siklusTagihan: p.billing_cycle,
      batasAudit: p.audit_limit,
      batasNegosiasi: p.negotiation_limit,
      mayarProductId: p.mayar_product_id,
      aktif: p.is_active,
      dibuatPada: p.created_at,
      diperbaruiPada: p.updated_at,
    };
  }
}
