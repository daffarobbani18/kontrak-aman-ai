import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../shared/prisma/prisma.module';
import { StorageService } from '../../shared/storage/storage.module';
import { DtoPerbaruiProfil, DtoPreferensiNotifikasi } from './dto/pengguna.dto';
import { DtoUbahKataSandi } from '../auth/dto/auth.dto';
import { KuotaService } from '../../shared/kuota/kuota.module';
import { AuditLogService } from '../../shared/audit-log/audit-log.module';
import { EmailService } from '../../shared/email/email.module';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class PenggunaService {
  private readonly logger = new Logger(PenggunaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly kuota: KuotaService,
    private readonly storage: StorageService,
    private readonly auditLog: AuditLogService,
    private readonly email: EmailService,
  ) {}

  /** Ringkasan dashboard pengguna (F-DASH-01) */
  async dashboard(penggunaId: string) {
    const [
      totalAudit,
      totalNegosiasi,
      distribusiRisiko,
      auditTerbaru,
      negosiasiTerbaru,
      kuotaAudit,
      kuotaNegosiasi,
    ] = await Promise.all([
      // Total audit
      this.prisma.audit.count({ where: { user_id: penggunaId } }),
      // Total negosiasi
      this.prisma.negotiation.count({ where: { user_id: penggunaId } }),
      // Distribusi risiko
      this.prisma.audit.groupBy({
        by: ['overall_risk_level'],
        where: { user_id: penggunaId, status: 'COMPLETED', overall_risk_level: { not: null } },
        _count: { overall_risk_level: true },
      }),
      // 5 audit terbaru
      this.prisma.audit.findMany({
        where: { user_id: penggunaId },
        orderBy: { created_at: 'desc' },
        take: 5,
        select: {
          id: true,
          status: true,
          overall_risk_level: true,
          created_at: true,
          document: { select: { file_name: true } },
        },
      }),
      // 3 negosiasi terbaru
      this.prisma.negotiation.findMany({
        where: { user_id: penggunaId },
        orderBy: { created_at: 'desc' },
        take: 3,
        select: {
          id: true,
          status: true,
          created_at: true,
          audit: { select: { id: true } },
        },
      }),
      // Kuota audit bulan ini
      this.kuota.periksa(penggunaId, 'audit'),
      // Kuota negosiasi bulan ini
      this.kuota.periksa(penggunaId, 'negosiasi'),
    ]);

    // Susun distribusi risiko ke map GREEN/YELLOW/RED
    const risikoMap: Record<string, number> = { GREEN: 0, YELLOW: 0, RED: 0 };
    for (const grup of distribusiRisiko) {
      if (grup.overall_risk_level) {
        risikoMap[grup.overall_risk_level] = grup._count.overall_risk_level;
      }
    }

    return {
      totalAudit,
      totalNegosiasi,
      distribusiRisiko: risikoMap,
      kuota: {
        audit: {
          terpakai: kuotaAudit.terpakai,
          batas: kuotaAudit.batas,
          sisaKuota: kuotaAudit.sisaKuota,
        },
        negosiasi: {
          terpakai: kuotaNegosiasi.terpakai,
          batas: kuotaNegosiasi.batas,
          sisaKuota: kuotaNegosiasi.sisaKuota,
        },
      },
      auditTerbaru: auditTerbaru.map((a) => ({
        id: a.id,
        status: a.status,
        levelRisiko: a.overall_risk_level,
        namaFile: a.document.file_name,
        dibuatPada: a.created_at,
      })),
      negosiasiTerbaru: negosiasiTerbaru.map((n) => ({
        id: n.id,
        status: n.status,
        auditId: n.audit.id,
        dibuatPada: n.created_at,
      })),
    };
  }

  /** Ambil profil lengkap + info kuota pengguna */
  async ambilProfil(penggunaId: string) {
    const pengguna = await this.prisma.user.findUnique({
      where: { id: penggunaId, deleted_at: null },
      select: {
        id: true,
        email: true,
        name: true,
        avatar_url: true,
        role: true,
        profesi: true,
        email_verified: true,
        consent_privacy_at: true,
        notif_email_audit: true,
        notif_email_pengingat: true,
        created_at: true,
        subscriptions: {
          where: { status: 'ACTIVE', current_period_end: { gt: new Date() } },
          select: {
            status: true,
            current_period_end: true,
            plan: { select: { name: true, tier: true } },
          },
          take: 1,
        },
      },
    });

    if (!pengguna) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    // Ambil kuota bulan ini
    const [kuotaAudit, kuotaNegosiasi] = await Promise.all([
      this.kuota.periksa(penggunaId, 'audit'),
      this.kuota.periksa(penggunaId, 'negosiasi'),
    ]);

    const langgananAktif = pengguna.subscriptions[0] ?? null;
    const tierLangganan = langgananAktif?.plan.tier;
    const tier = tierLangganan === 'PRO' ? 'pro' : tierLangganan === 'BUSINESS' ? 'bisnis' : 'gratis';

    return {
      id: pengguna.id,
      email: pengguna.email,
      nama_lengkap: pengguna.name, // disesuaikan dengan api.md dan DataProfilPengguna
      avatar_url: pengguna.avatar_url,
      peran: pengguna.role,
      profesi: pengguna.profesi,
      email_terverifikasi: pengguna.email_verified,
      tier, // ditambahkan untuk memenuhi ekspektasi DataProfilPengguna
      onboarding_selesai: !!pengguna.profesi, // asumsi F-PROF-01
      consent_privasi_pada: pengguna.consent_privacy_at,
      preferensi_notifikasi: {
        email_audit: pengguna.notif_email_audit,
        email_pengingat: pengguna.notif_email_pengingat,
      },
      dibuat_pada: pengguna.created_at,
      langganan: langgananAktif
        ? {
            paket: langgananAktif.plan.name,
            tier: langgananAktif.plan.tier,
            status: langgananAktif.status,
            berakhir_pada: langgananAktif.current_period_end,
          }
        : null,
      kuota: {
        audit: {
          terpakai: kuotaAudit.terpakai,
          batas: kuotaAudit.batas,
          sisa_kuota: kuotaAudit.sisaKuota,
        },
        negosiasi: {
          terpakai: kuotaNegosiasi.terpakai,
          batas: kuotaNegosiasi.batas,
          sisa_kuota: kuotaNegosiasi.sisaKuota,
        },
      },
    };
  }

  /** Upload foto avatar ke S3 dan simpan URL (F-PROF-02) */
  async uploadAvatar(
    penggunaId: string,
    file: Express.Multer.File,
  ): Promise<{ avatarUrl: string }> {
    const TIPE_DIIZINKAN = ['image/jpeg', 'image/png'];
    const UKURAN_MAKS = 2 * 1024 * 1024; // 2 MB

    if (!TIPE_DIIZINKAN.includes(file.mimetype)) {
      throw new BadRequestException(
        'Format file tidak didukung. Gunakan JPEG atau PNG.',
      );
    }
    if (file.size > UKURAN_MAKS) {
      throw new BadRequestException(
        'Ukuran file terlalu besar. Maksimal 2 MB.',
      );
    }

    // Ambil avatar lama untuk dihapus dari S3
    const pengguna = await this.prisma.user.findUnique({
      where: { id: penggunaId },
      select: { avatar_url: true },
    });

    // Tentukan key baru di S3
    const ekstensi = file.mimetype === 'image/png' ? 'png' : 'jpg';
    const kunciFile = `avatars/${penggunaId}/${Date.now()}.${ekstensi}`;

    // Upload ke S3
    const hasil = await this.storage.upload({
      kunci: kunciFile,
      konten: file.buffer,
      tipeKonten: file.mimetype,
      ukuran: file.size,
    });

    // Hapus avatar lama dari S3 jika ada dan bukan URL eksternal
    if (pengguna?.avatar_url) {
      try {
        const urlLama = new URL(pengguna.avatar_url);
        const kunciLama = urlLama.pathname.replace(/^\//, '');
        if (kunciLama.startsWith('avatars/')) {
          await this.storage.hapus(kunciLama);
        }
      } catch {
        // Abaikan jika URL tidak valid atau gagal hapus
        this.logger.warn(`Gagal hapus avatar lama pengguna ${penggunaId}`);
      }
    }

    // Simpan URL baru ke database
    await this.prisma.user.update({
      where: { id: penggunaId },
      data: { avatar_url: hasil.url },
    });

    return { avatarUrl: hasil.url };
  }

  /** Perbarui nama dan/atau avatar URL */
  async perbaruiProfil(penggunaId: string, dto: DtoPerbaruiProfil) {
    const pengguna = await this.prisma.user.update({
      where: { id: penggunaId },
      data: {
        ...(dto.nama ? { name: dto.nama } : {}),
        ...(dto.avatarUrl !== undefined ? { avatar_url: dto.avatarUrl } : {}),
        ...(dto.profesi !== undefined ? { profesi: dto.profesi } : {}),
      },
      select: { id: true, email: true, name: true, avatar_url: true, profesi: true },
    });

    return {
      id: pengguna.id,
      email: pengguna.email,
      nama: pengguna.name,
      avatarUrl: pengguna.avatar_url,
      profesi: pengguna.profesi,
    };
  }

  /** Ubah kata sandi (memerlukan kata sandi lama) */
  async ubahKataSandi(penggunaId: string, dto: DtoUbahKataSandi): Promise<void> {
    const pengguna = await this.prisma.user.findUnique({
      where: { id: penggunaId },
      select: { password_hash: true },
    });

    if (!pengguna?.password_hash) {
      throw new BadRequestException(
        'Akun ini menggunakan login Google dan tidak memiliki kata sandi',
      );
    }

    const valid = await bcrypt.compare(dto.kataSandiLama, pengguna.password_hash);
    if (!valid) {
      throw new BadRequestException('Kata sandi lama tidak valid');
    }

    const hashBaru = await bcrypt.hash(dto.kataSandiBaru, BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: penggunaId },
      data: { password_hash: hashBaru },
    });
  }

  /** Perbarui preferensi notifikasi (F-PROF-03) */
  async perbaruiPreferensiNotifikasi(
    penggunaId: string,
    dto: DtoPreferensiNotifikasi,
  ) {
    const diperbarui = await this.prisma.user.update({
      where: { id: penggunaId },
      data: {
        ...(dto.notifEmailAudit !== undefined
          ? { notif_email_audit: dto.notifEmailAudit }
          : {}),
        ...(dto.notifEmailPengingat !== undefined
          ? { notif_email_pengingat: dto.notifEmailPengingat }
          : {}),
      },
      select: { notif_email_audit: true, notif_email_pengingat: true },
    });
    return {
      notifEmailAudit: diperbarui.notif_email_audit,
      notifEmailPengingat: diperbarui.notif_email_pengingat,
    };
  }

  /** Catat persetujuan kebijakan privasi (F-PRIV-01) */
  async setujuPrivasi(penggunaId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: penggunaId },
      data: { consent_privacy_at: new Date() },
    });
  }

  /** Ekspor seluruh data pribadi pengguna sebagai JSON (F-PRIV-03) */
  async eksporData(penggunaId: string) {
    const [
      profil,
      audits,
      negosiasi,
      dokumen,
      transaksi,
      kuotaAudit,
      kuotaNegosiasi,
    ] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: penggunaId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar_url: true,
          profesi: true,
          role: true,
          email_verified: true,
          consent_privacy_at: true,
          notif_email_audit: true,
          notif_email_pengingat: true,
          created_at: true,
        },
      }),
      this.prisma.audit.findMany({
        where: { user_id: penggunaId },
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          status: true,
          risk_score: true,
          overall_risk_level: true,
          summary: true,
          created_at: true,
          completed_at: true,
          clauses: {
            select: {
              id: true,
              title: true,
              risk_level: true,
              explanation: true,
              recommendation: true,
            },
          },
        },
      }),
      this.prisma.negotiation.findMany({
        where: { user_id: penggunaId },
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          status: true,
          summary: true,
          created_at: true,
          completed_at: true,
        },
      }),
      this.prisma.contractDocument.findMany({
        where: { user_id: penggunaId, deleted_at: null },
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          file_name: true,
          file_size: true,
          mime_type: true,
          status: true,
          created_at: true,
        },
      }),
      this.prisma.transaction.findMany({
        where: { user_id: penggunaId },
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          paid_at: true,
          created_at: true,
        },
      }),
      this.kuota.periksa(penggunaId, 'audit'),
      this.kuota.periksa(penggunaId, 'negosiasi'),
    ]);

    const data = {
      dieksprorPada: new Date().toISOString(),
      profil,
      kuotaBulanIni: {
        audit: { terpakai: kuotaAudit.terpakai, batas: kuotaAudit.batas },
        negosiasi: { terpakai: kuotaNegosiasi.terpakai, batas: kuotaNegosiasi.batas },
      },
      dokumen,
      audits,
      negosiasi,
      transaksi,
    };

    // Kirim email notifikasi ekspor (fire-and-forget)
    if (profil?.email) {
      this.email
        .kirim({
          ke: profil.email,
          subjek: 'Ekspor Data Pribadi — KontrakAman AI',
          html: this.email.htmlEksporData({ nama: profil.name ?? 'Pengguna' }),
        })
        .catch((err: unknown) =>
          this.logger.warn(`Gagal kirim email ekspor data: ${String(err)}`),
        );
    }

    await this.auditLog.catat({
      penggunaId,
      aksi: 'ekspor-data',
      entitas: 'pengguna',
      entitasId: penggunaId,
    }).catch((err: unknown) =>
      this.logger.warn(`Gagal catat audit log ekspor-data: ${String(err)}`),
    );

    return data;
  }

  /** Hapus akun secara permanen — hapus S3, batalkan langganan, hard delete (F-PRIV-04) */
  async hapusAkun(penggunaId: string, kataSandi: string): Promise<void> {
    // 0. Verifikasi kata sandi sebelum hapus (konfirmasi identitas)
    const pengguna = await this.prisma.user.findUnique({
      where: { id: penggunaId },
      select: { password_hash: true },
    });

    if (!pengguna?.password_hash) {
      // Akun OAuth tanpa password — tidak bisa dikonfirmasi via kata sandi
      throw new BadRequestException(
        'Akun ini menggunakan login sosial (Google) dan tidak memiliki kata sandi',
      );
    }

    const kataSandiValid = await bcrypt.compare(kataSandi, pengguna.password_hash);
    if (!kataSandiValid) {
      throw new UnauthorizedException('Kata sandi tidak valid');
    }

    // 1. Ambil semua file S3 milik pengguna
    const dokumen = await this.prisma.contractDocument.findMany({
      where: { user_id: penggunaId, deleted_at: null },
      select: { file_key: true },
    });

    // 2. Hapus file S3 secara paralel (best-effort, error tidak menghentikan proses)
    await Promise.allSettled(
      dokumen.map((d) =>
        this.storage.hapus(d.file_key).catch((err: unknown) =>
          this.logger.warn(`Gagal hapus S3 ${d.file_key}: ${String(err)}`),
        ),
      ),
    );

    // 3. Hard delete semua data pengguna via cascade
    //    Prisma onDelete: Cascade pada semua relasi user sehingga
    //    cukup hapus user — semua record terkait ikut terhapus
    await this.prisma.user.delete({
      where: { id: penggunaId },
    });

    // Catat di audit log sebelum data pengguna hilang
    await this.auditLog.catat({
      penggunaId,
      aksi: 'hapus-akun',
      entitas: 'pengguna',
      entitasId: penggunaId,
    }).catch((err: unknown) =>
      this.logger.warn(`Gagal catat audit log hapus akun: ${String(err)}`),
    );

    this.logger.log(`Akun pengguna ${penggunaId} telah dihapus permanen`);
  }
}
