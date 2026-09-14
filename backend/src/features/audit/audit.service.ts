import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.module';
import { KuotaService } from '../../shared/kuota/kuota.module';
import { EmailService } from '../../shared/email/email.module';
import { ANTRIAN_AUDIT_KONTRAK } from '../../shared/queue/queue.module';
import {
  DtoBuatAudit,
  DtoDaftarAudit,
  DtoHasilAuditInternal,
} from './dto/audit.dto';
import { ConfigService } from '@nestjs/config';
import { AuditLogService } from '../../shared/audit-log/audit-log.module';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly kuota: KuotaService,
    private readonly email: EmailService,
    private readonly cfg: ConfigService,
    private readonly auditLog: AuditLogService,
    @InjectQueue(ANTRIAN_AUDIT_KONTRAK)
    private readonly antrianAudit: Queue,
  ) {}

  /** Buat permintaan audit baru — cek kuota lalu enqueue */
  async buat(penggunaId: string, dto: DtoBuatAudit) {
    // Verifikasi dokumen milik pengguna
    const dokumen = await this.prisma.contractDocument.findFirst({
      where: { id: dto.dokumenId, user_id: penggunaId, deleted_at: null },
    });
    if (!dokumen) {
      throw new NotFoundException('Dokumen tidak ditemukan');
    }

    // Cek kuota
    const statusKuota = await this.kuota.periksa(penggunaId, 'audit');
    if (!statusKuota.diizinkan) {
      throw new ForbiddenException(
        statusKuota.pesan ?? 'Kuota audit bulan ini telah habis',
      );
    }

    // Buat record audit dengan status PENDING
    const audit = await this.prisma.audit.create({
      data: {
        user_id: penggunaId,
        document_id: dto.dokumenId,
        status: 'PENDING',
      },
    });

    // Enqueue ke BullMQ
    await this.antrianAudit.add(
      'proses-audit',
      {
        auditId: audit.id,
        dokumenId: dto.dokumenId,
        penggunaId,
        fileKey: dokumen.file_key,
        mimeType: dokumen.mime_type,
      },
      { jobId: `audit-${audit.id}` },
    );

    this.logger.log(`Audit ${audit.id} ditambahkan ke antrian`);

    // Catat permintaan audit di audit log
    await this.auditLog.catat({
      penggunaId,
      aksi: 'buat-audit',
      entitas: 'audit',
      entitasId: audit.id,
      detailBaru: { dokumenId: dto.dokumenId },
    }).catch((err: unknown) =>
      this.logger.warn(`Gagal catat audit log buat-audit: ${String(err)}`),
    );

    return this.formatAudit(audit);
  }

  /** Daftar audit milik pengguna (cursor pagination) */
  async daftar(penggunaId: string, dto: DtoDaftarAudit) {
    const batas = Math.min(dto.batas ?? 20, 50);

    const audits = await this.prisma.audit.findMany({
      where: { user_id: penggunaId },
      orderBy: { created_at: 'desc' },
      take: batas + 1,
      ...(dto.cursor ? { cursor: { id: dto.cursor }, skip: 1 } : {}),
      select: {
        id: true,
        status: true,
        risk_score: true,
        summary: true,
        created_at: true,
        completed_at: true,
        document: { select: { file_name: true } },
      },
    });

    const adaHalamanBerikut = audits.length > batas;
    const data = adaHalamanBerikut ? audits.slice(0, -1) : audits;

    return {
      data: data.map((a) => ({
        id: a.id,
        status: a.status,
        skorRisiko: a.risk_score,
        ringkasan: a.summary,
        namaFile: a.document.file_name,
        dibuatPada: a.created_at,
        selesaiPada: a.completed_at,
      })),
      cursorBerikut: adaHalamanBerikut ? data[data.length - 1]?.id : null,
      adaHalamanBerikut,
    };
  }

  /** Detail satu audit */
  async ambilSatu(penggunaId: string, id: string) {
    const audit = await this.prisma.audit.findUnique({
      where: { id },
      include: {
        clauses: true,
        document: { select: { file_name: true } },
      },
    });

    if (!audit) throw new NotFoundException('Audit tidak ditemukan');
    if (audit.user_id !== penggunaId)
      throw new ForbiddenException('Akses ditolak');

    return {
      id: audit.id,
      status: audit.status,
      skorRisiko: audit.risk_score,
      tingkatRisikoKeseluruhan: audit.overall_risk_level,
      rekomendasiProfesional: audit.overall_risk_level === 'RED',
      // F-EDU-01: Disclaimer wajib tampil di setiap hasil audit, tidak dapat dinonaktifkan
      disclaimer:
        'Hasil audit ini bukan nasihat hukum final. Gunakan sebagai panduan awal, bukan sebagai pengganti konsultasi dengan profesional hukum.',
      // F-EDU-03: Rekomendasi konsultasi profesional muncul bersamaan dengan skor risiko Merah
      rekomendasiKonsultasi:
        audit.overall_risk_level === 'RED'
          ? 'Kontrak ini memiliki risiko tinggi. Kami sangat menyarankan Anda berkonsultasi dengan pengacara atau konsultan hukum sebelum menandatangani.'
          : null,
      ringkasan: audit.summary,
      hasilJson: audit.result_json,
      namaFile: audit.document.file_name,
      dibuatPada: audit.created_at,
      selesaiPada: audit.completed_at,
      klausul: audit.clauses.map((k) => ({
        id: k.id,
        judul: k.title,
        isi: k.content,
        tingkatRisiko: k.risk_level,
        penjelasan: k.explanation,
        rekomendasi: k.recommendation,
      })),
    };
  }

  /**
   * Callback internal dari backend-ai setelah audit selesai.
   * Dipanggil via POST /v1/internal/audit/selesai — divalidasi oleh InternalApiGuard.
   */
  async selesaikanAudit(dto: DtoHasilAuditInternal): Promise<void> {
    const audit = await this.prisma.audit.findUnique({
      where: { id: dto.auditId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            notif_email_audit: true,
          },
        },
      },
    });

    if (!audit) throw new NotFoundException('Audit tidak ditemukan');

    await this.prisma.$transaction(async (tx) => {
      // Update status audit
      await tx.audit.update({
        where: { id: dto.auditId },
        data: {
          status: dto.status === 'COMPLETED' ? 'COMPLETED' : 'FAILED',
          risk_score: dto.skorRisiko ?? null,
          overall_risk_level: dto.tingkatRisikoKeseluruhan ?? null,
          summary: dto.ringkasan ?? null,
          result_json: dto.hasilJson
            ? (dto.hasilJson as unknown as import('@prisma/client').Prisma.InputJsonValue)
            : undefined,
          completed_at: new Date(),
          error_message: dto.pesanError ?? null,
        },
      });

      // Simpan klausul jika ada
      if (dto.klausul && dto.klausul.length > 0) {
        await tx.clause.createMany({
          data: dto.klausul.map((k) => ({
            audit_id: dto.auditId,
            title: k.judul,
            content: k.isi,
            risk_level: k.tingkatRisiko,
            explanation: k.penjelasan,
            recommendation: k.rekomendasi ?? null,
          })),
        });
      }

      // Potong kuota HANYA jika berhasil — tidak dipotong saat gagal
      if (dto.status === 'COMPLETED') {
        await this.kuota.tambahPemakaian(audit.user_id, 'audit');
      }
    });

    // Kirim notifikasi email jika berhasil DAN pengguna mengaktifkan notifikasi
    if (dto.status === 'COMPLETED' && audit.user.notif_email_audit) {
      const frontendUrl = this.cfg.get<string>(
        'FRONTEND_URL',
        'http://localhost:3001',
      );
      const tautanHasil = `${frontendUrl}/audit/${dto.auditId}`;
      this.email
        .kirim({
          ke: audit.user.email,
          subjek: 'Hasil Audit Kontrak — KontrakAman AI',
          html: this.email.htmlAuditSelesai({
            nama: audit.user.name,
            namaKontrak: dto.auditId,
            tautanHasil,
          }),
        })
        .catch((err) =>
          this.logger.error(`Gagal kirim email audit: ${String(err)}`),
        );
    }
  }

  /**
   * Coba ulang audit yang gagal tanpa memotong kuota baru (F-AUDIT-01).
   * Kuota sudah terpotong saat pertama kali buat(), jadi retry gratis.
   */
  async cobaUlang(penggunaId: string, auditId: string) {
    const audit = await this.prisma.audit.findUnique({
      where: { id: auditId },
      include: { document: { select: { file_key: true, mime_type: true, id: true } } },
    });

    if (!audit) throw new NotFoundException('Audit tidak ditemukan');
    if (audit.user_id !== penggunaId) throw new ForbiddenException('Akses ditolak');
    if (audit.status !== 'FAILED') {
      throw new BadRequestException(
        `Audit tidak dapat diulang karena statusnya bukan FAILED (status saat ini: ${audit.status})`,
      );
    }

    // Rollback kuota yang dipotong saat buat() agar retry tidak ganda
    await this.kuota.rollbackKuota(penggunaId, 'audit');

    // Reset audit ke PENDING dan bersihkan hasil sebelumnya
    await this.prisma.$transaction(async (tx) => {
      await tx.audit.update({
        where: { id: auditId },
        data: {
          status: 'PENDING',
          risk_score: null,
          overall_risk_level: null,
          summary: null,
          result_json: Prisma.DbNull,
          error_message: null,
          completed_at: null,
        },
      });
      // Hapus klausul lama agar tidak duplikat saat retry selesai
      await tx.clause.deleteMany({ where: { audit_id: auditId } });
    });

    // Re-enqueue dengan jobId baru (timestamp) agar tidak bertabrakan dengan job lama
    await this.antrianAudit.add(
      'proses-audit',
      {
        auditId,
        dokumenId: audit.document.id,
        penggunaId,
        fileKey: audit.document.file_key,
        mimeType: audit.document.mime_type,
      },
      { jobId: `audit-retry-${auditId}-${Date.now()}` },
    );

    this.logger.log(`Audit ${auditId} di-retry oleh pengguna ${penggunaId}`);

    await this.auditLog.catat({
      penggunaId,
      aksi: 'retry-audit',
      entitas: 'audit',
      entitasId: auditId,
    }).catch((err: unknown) =>
      this.logger.warn(`Gagal catat audit log retry-audit: ${String(err)}`),
    );

    return this.formatAudit({ ...audit, status: 'PENDING', created_at: audit.created_at });
  }

  /**
   * Tandai audit sebagai selesai ditindaklanjuti (F-NOTIF-02)
   * Hanya pemilik audit yang boleh menandai.
   */
  async tandaiSelesai(penggunaId: string, auditId: string) {
    const audit = await this.prisma.audit.findUnique({
      where: { id: auditId },
      select: { id: true, user_id: true, status: true, followed_up_at: true },
    });

    if (!audit) throw new NotFoundException('Audit tidak ditemukan');
    if (audit.user_id !== penggunaId) throw new ForbiddenException('Akses ditolak');
    if (audit.status !== 'COMPLETED') {
      throw new BadRequestException('Hanya audit yang sudah selesai dapat ditandai');
    }

    const diperbarui = await this.prisma.audit.update({
      where: { id: auditId },
      data: { followed_up_at: new Date() },
      select: { id: true, status: true, followed_up_at: true },
    });

    this.logger.log(`Audit ${auditId} ditandai selesai ditindaklanjuti oleh pengguna ${penggunaId}`);

    return {
      id: diperbarui.id,
      status: diperbarui.status,
      ditindaklanjutiPada: diperbarui.followed_up_at,
    };
  }

  private formatAudit(audit: {
    id: string;
    status: string;
    created_at: Date;
  }) {
    return { id: audit.id, status: audit.status, dibuatPada: audit.created_at };
  }
}
