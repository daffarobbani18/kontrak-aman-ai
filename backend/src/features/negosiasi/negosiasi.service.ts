import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.module';
import { KuotaService } from '../../shared/kuota/kuota.module';
import { EmailService } from '../../shared/email/email.module';
import { AuditLogService } from '../../shared/audit-log/audit-log.module';
import { Prisma } from '@prisma/client';
import { ANTRIAN_DRAF_NEGOSIASI } from '../../shared/queue/queue.module';
import {
  DtoBuatNegosiasi,
  DtoDaftarNegosiasi,
  DtoHasilNegosiasiInternal,
} from './dto/negosiasi.dto';

@Injectable()
export class NegosiasiService {
  private readonly logger = new Logger(NegosiasiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly kuota: KuotaService,
    private readonly email: EmailService,
    private readonly cfg: ConfigService,
    private readonly auditLog: AuditLogService,
    @InjectQueue(ANTRIAN_DRAF_NEGOSIASI)
    private readonly antrianNegosiasi: Queue,
  ) {}

  /** Buat permintaan negosiasi baru */
  async buat(penggunaId: string, dto: DtoBuatNegosiasi) {
    // Verifikasi audit milik pengguna dan sudah selesai
    const audit = await this.prisma.audit.findFirst({
      where: { id: dto.auditId, user_id: penggunaId, status: 'COMPLETED' },
      include: {
        clauses: { select: { id: true, title: true, risk_level: true } },
        document: { select: { file_key: true, mime_type: true } },
      },
    });

    if (!audit) {
      throw new NotFoundException(
        'Audit tidak ditemukan atau belum selesai diproses',
      );
    }

    // Cek kuota negosiasi
    const statusKuota = await this.kuota.periksa(penggunaId, 'negosiasi');
    if (!statusKuota.diizinkan) {
      throw new ForbiddenException(
        statusKuota.pesan ?? 'Kuota negosiasi bulan ini telah habis',
      );
    }

    // Buat record negosiasi
    const negosiasi = await this.prisma.negotiation.create({
      data: {
        user_id: penggunaId,
        audit_id: dto.auditId,
        status: 'PENDING',
      },
    });

    // Enqueue ke BullMQ
    await this.antrianNegosiasi.add(
      'proses-negosiasi',
      {
        negosiasiId: negosiasi.id,
        auditId: dto.auditId,
        penggunaId,
        fileKey: audit.document.file_key,
        mimeType: audit.document.mime_type,
        instruksiTambahan: dto.instruksiTambahan ?? null,
        klausulBerisiko: audit.clauses
          .filter((k) => k.risk_level !== 'LOW')
          .map((k) => ({ id: k.id, judul: k.title, risiko: k.risk_level })),
      },
      { jobId: `negosiasi-${negosiasi.id}` },
    );

    this.logger.log(`Negosiasi ${negosiasi.id} ditambahkan ke antrian`);

    // Catat permintaan negosiasi di audit log
    await this.auditLog.catat({
      penggunaId,
      aksi: 'buat-negosiasi',
      entitas: 'negosiasi',
      entitasId: negosiasi.id,
      detailBaru: { auditId: dto.auditId },
    }).catch((err: unknown) =>
      this.logger.warn(`Gagal catat audit log buat-negosiasi: ${String(err)}`),
    );

    return { id: negosiasi.id, status: negosiasi.status, dibuatPada: negosiasi.created_at };
  }

  /** Daftar negosiasi milik pengguna */
  async daftar(penggunaId: string, dto: DtoDaftarNegosiasi) {
    const batas = Math.min(dto.batas ?? 20, 50);

    const negosiasi = await this.prisma.negotiation.findMany({
      where: { user_id: penggunaId },
      orderBy: { created_at: 'desc' },
      take: batas + 1,
      ...(dto.cursor ? { cursor: { id: dto.cursor }, skip: 1 } : {}),
      select: {
        id: true,
        status: true,
        summary: true,
        created_at: true,
        completed_at: true,
        audit: { select: { id: true } },
      },
    });

    const adaHalamanBerikut = negosiasi.length > batas;
    const data = adaHalamanBerikut ? negosiasi.slice(0, -1) : negosiasi;

    return {
      data: data.map((n) => ({
        id: n.id,
        status: n.status,
        ringkasan: n.summary,
        auditId: n.audit.id,
        dibuatPada: n.created_at,
        selesaiPada: n.completed_at,
      })),
      cursorBerikut: adaHalamanBerikut ? data[data.length - 1]?.id : null,
      adaHalamanBerikut,
    };
  }

  /** Detail satu negosiasi — include klausul audit terkait (F-NEGO-02) */
  async ambilSatu(penggunaId: string, id: string) {
    const negosiasi = await this.prisma.negotiation.findUnique({
      where: { id },
      include: {
        audit: {
          select: {
            id: true,
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
        },
      },
    });

    if (!negosiasi) throw new NotFoundException('Negosiasi tidak ditemukan');
    if (negosiasi.user_id !== penggunaId)
      throw new ForbiddenException('Akses ditolak');

    return {
      id: negosiasi.id,
      status: negosiasi.status,
      ringkasan: negosiasi.summary,
      drafDokumen: negosiasi.draft_document,
      drafDiedit: negosiasi.edited_draft,
      isDiedit: negosiasi.is_edited,
      poinPerubahan: negosiasi.change_points,
      auditId: negosiasi.audit.id,
      klausul: negosiasi.audit.clauses.map((k) => ({
        id: k.id,
        judul: k.title,
        levelRisiko: k.risk_level,
        penjelasan: k.explanation,
        rekomendasi: k.recommendation,
      })),
      dibuatPada: negosiasi.created_at,
      selesaiPada: negosiasi.completed_at,
      // F-EDU-01: Disclaimer wajib tampil di setiap tampilan draf negosiasi
      disclaimer:
        'Draf negosiasi ini bukan nasihat hukum final dan tidak menggantikan konsultasi dengan profesional hukum.',
    };
  }

  /** Ambil draf final — edited_draft jika ada, fallback ke draft_document (F-NEGO-02) */
  async ambilDrafFinal(penggunaId: string, id: string) {
    const negosiasi = await this.prisma.negotiation.findUnique({
      where: { id },
      select: {
        id: true,
        user_id: true,
        status: true,
        draft_document: true,
        edited_draft: true,
        is_edited: true,
        completed_at: true,
        updated_at: true,
      },
    });

    if (!negosiasi) throw new NotFoundException('Negosiasi tidak ditemukan');
    if (negosiasi.user_id !== penggunaId)
      throw new ForbiddenException('Akses ditolak');
    if (negosiasi.status !== 'COMPLETED')
      throw new ForbiddenException('Draf belum tersedia — negosiasi belum selesai');

    const drafFinal = negosiasi.edited_draft ?? negosiasi.draft_document;

    return {
      id: negosiasi.id,
      draf: drafFinal,
      isDiedit: negosiasi.is_edited,
      selesaiPada: negosiasi.completed_at,
      diperbarui: negosiasi.updated_at,
      // F-EDU-01: Disclaimer wajib tampil di setiap ekspor/tampilan draf negosiasi
      disclaimer:
        'Draf negosiasi ini bukan nasihat hukum final dan tidak menggantikan konsultasi dengan profesional hukum.',
    };
  }

  /** Ekspor draf final sebagai plain text dengan disclaimer (F-NEGO-03) */
  async eksporTeks(penggunaId: string, id: string): Promise<string> {
    const negosiasi = await this.prisma.negotiation.findUnique({
      where: { id },
      select: {
        id: true,
        user_id: true,
        status: true,
        draft_document: true,
        edited_draft: true,
        is_edited: true,
        completed_at: true,
      },
    });

    if (!negosiasi) throw new NotFoundException('Negosiasi tidak ditemukan');
    if (negosiasi.user_id !== penggunaId)
      throw new ForbiddenException('Akses ditolak');
    if (negosiasi.status !== 'COMPLETED')
      throw new ForbiddenException('Draf belum tersedia — negosiasi belum selesai');

    const drafFinal = negosiasi.edited_draft ?? negosiasi.draft_document ?? '';
    const tanggal = negosiasi.completed_at
      ? new Date(negosiasi.completed_at).toLocaleDateString('id-ID', {
          day: '2-digit', month: 'long', year: 'numeric',
        })
      : new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

    // F-EDU-01: Disclaimer wajib disertakan di setiap ekspor draf negosiasi
    const disclaimer = [
      '================================================================',
      'DISCLAIMER PENTING — BACA SEBELUM MENGGUNAKAN',
      '================================================================',
      'Draf negosiasi ini dibuat oleh sistem AI KontrakAman sebagai alat',
      'bantu edukasi dan analisis risiko. Dokumen ini BUKAN nasihat hukum',
      'final dan tidak menggantikan konsultasi dengan profesional hukum',
      'yang berlisensi. Untuk kontrak bernilai tinggi atau kompleks,',
      'sangat disarankan untuk berkonsultasi dengan advokat.',
      '================================================================',
      `Diekspor pada: ${tanggal}`,
      `ID Negosiasi: ${negosiasi.id}`,
      `Sumber draf: ${negosiasi.is_edited ? 'Draf yang telah diedit secara manual' : 'Draf yang dihasilkan AI'}`,
      '================================================================',
      '',
    ].join('\n');

    return `${disclaimer}\n${drafFinal}`;
  }

  /** Edit manual draf negosiasi (F-NEGO-02) */
  async editDraf(penggunaId: string, id: string, drafBaru: string) {
    const negosiasi = await this.prisma.negotiation.findUnique({
      where: { id },
    });

    if (!negosiasi) throw new NotFoundException('Negosiasi tidak ditemukan');
    if (negosiasi.user_id !== penggunaId)
      throw new ForbiddenException('Akses ditolak');
    if (negosiasi.status !== 'COMPLETED')
      throw new ForbiddenException(
        'Draf hanya bisa diedit setelah negosiasi selesai',
      );

    const diperbarui = await this.prisma.negotiation.update({
      where: { id },
      data: { edited_draft: drafBaru, is_edited: true },
    });

    return {
      id: diperbarui.id,
      drafDiedit: diperbarui.edited_draft,
      isDiedit: diperbarui.is_edited,
    };
  }

  /** Coba ulang negosiasi yang gagal — rollback kuota lalu re-enqueue */
  async cobaUlang(penggunaId: string, negosiasiId: string) {
    const negosiasi = await this.prisma.negotiation.findUnique({
      where: { id: negosiasiId },
      include: {
        audit: {
          select: {
            id: true,
            clauses: { select: { id: true, title: true, risk_level: true } },
            document: { select: { file_key: true, mime_type: true } },
          },
        },
      },
    });

    if (!negosiasi) throw new NotFoundException('Negosiasi tidak ditemukan');
    if (negosiasi.user_id !== penggunaId)
      throw new ForbiddenException('Akses ditolak');
    if (negosiasi.status !== 'FAILED')
      throw new BadRequestException(
        'Hanya negosiasi dengan status FAILED yang dapat dicoba ulang',
      );

    // Rollback kuota agar tidak terpotong dua kali
    await this.kuota.rollbackKuota(penggunaId, 'negosiasi');

    // Reset ke PENDING dan bersihkan hasil gagal sebelumnya
    await this.prisma.negotiation.update({
      where: { id: negosiasiId },
      data: {
        status: 'PENDING',
        summary: null,
        draft_document: null,
        edited_draft: null,
        is_edited: false,
        change_points: Prisma.JsonNull,
        error_message: null,
        completed_at: null,
      },
    });

    // Re-enqueue dengan jobId baru agar tidak bentrok dengan job lama
    await this.antrianNegosiasi.add(
      'proses-negosiasi',
      {
        negosiasiId,
        auditId: negosiasi.audit.id,
        penggunaId,
        fileKey: negosiasi.audit.document.file_key,
        mimeType: negosiasi.audit.document.mime_type,
        instruksiTambahan: null,
        klausulBerisiko: negosiasi.audit.clauses
          .filter((k) => k.risk_level !== 'LOW')
          .map((k) => ({ id: k.id, judul: k.title, risiko: k.risk_level })),
      },
      { jobId: `negosiasi-retry-${negosiasiId}-${Date.now()}` },
    );

    this.logger.log(`Negosiasi ${negosiasiId} di-retry oleh pengguna ${penggunaId}`);

    await this.auditLog.catat({
      penggunaId,
      aksi: 'retry-negosiasi',
      entitas: 'negosiasi',
      entitasId: negosiasiId,
    }).catch((err: unknown) =>
      this.logger.warn(`Gagal catat audit log retry-negosiasi: ${String(err)}`),
    );

    return { id: negosiasiId, status: 'PENDING' };
  }

  /** Callback internal dari backend-ai — divalidasi oleh InternalApiGuard */
  async selesaikanNegosiasi(dto: DtoHasilNegosiasiInternal): Promise<void> {
    const negosiasi = await this.prisma.negotiation.findUnique({
      where: { id: dto.negosiasiId },
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

    if (!negosiasi) throw new NotFoundException('Negosiasi tidak ditemukan');

    await this.prisma.$transaction(async (tx) => {
      await tx.negotiation.update({
        where: { id: dto.negosiasiId },
        data: {
          status: dto.status === 'COMPLETED' ? 'COMPLETED' : 'FAILED',
          summary: dto.ringkasan ?? null,
          draft_document: dto.drafDokumen ?? null,
          change_points: dto.poinPerubahan
            ? JSON.parse(JSON.stringify(dto.poinPerubahan))
            : undefined,
          completed_at: new Date(),
          error_message: dto.pesanError ?? null,
        },
      });

      // Potong kuota HANYA jika berhasil
      if (dto.status === 'COMPLETED') {
        await this.kuota.tambahPemakaian(negosiasi.user_id, 'negosiasi');
      }
    });

    // Kirim notifikasi email jika pengguna mengaktifkannya dan negosiasi berhasil
    if (dto.status === 'COMPLETED' && negosiasi.user.notif_email_audit) {
      const urlFrontend = this.cfg.get<string>(
        'FRONTEND_URL',
        'http://localhost:3001',
      );
      try {
        await this.email.kirim({
          ke: negosiasi.user.email,
          subjek: 'Draf Negosiasi Kontrak Anda Telah Selesai — KontrakAman AI',
          html: this.email.htmlNegosiasiSelesai({
            nama: negosiasi.user.name ?? 'Pengguna',
            tautanHasil: `${urlFrontend}/negosiasi/${dto.negosiasiId}`,
          }),
        });
      } catch (err) {
        // Jangan gagalkan request utama jika email error
        this.logger.warn(
          `Gagal kirim email notifikasi negosiasi ${dto.negosiasiId}: ${String(err)}`,
        );
      }
    }
  }
}
