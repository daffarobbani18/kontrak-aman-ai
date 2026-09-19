/// <reference types="multer" />
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../shared/prisma/prisma.module';
import { StorageService } from '../../shared/storage/storage.module';
import { EmailService } from '../../shared/email/email.module';
import { DtoDaftarDokumen } from './dto/dokumen-kontrak.dto';
import { ConfigService } from '@nestjs/config';

const TIPE_FILE_DIIZINKAN = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const UKURAN_MAKS_BYTES = 10 * 1024 * 1024; // 10 MB
const HARI_NOTIF_SEBELUM_PURGE = 7;

@Injectable()
export class DokumenKontrakService {
  private readonly logger = new Logger(DokumenKontrakService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly email: EmailService,
    private readonly cfg: ConfigService,
  ) {}

  /** Upload dokumen kontrak baru */
  async upload(
    penggunaId: string,
    file: Express.Multer.File & { buffer: Buffer; size: number; mimetype: string; originalname: string },
  ) {
    // Validasi tipe file
    if (!TIPE_FILE_DIIZINKAN.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipe file tidak didukung. Gunakan PDF, JPEG, PNG, atau WebP.',
      );
    }

    // Validasi ukuran
    if (file.size > UKURAN_MAKS_BYTES) {
      throw new BadRequestException('Ukuran file maksimal 10 MB');
    }

    // Generate kunci unik di Supabase S3
    const ekstensi = file.originalname.split('.').pop() ?? 'bin';
    const kunci = `dokumen/${penggunaId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ekstensi}`;

    const { url } = await this.storage.upload({
      kunci,
      konten: file.buffer,
      tipeKonten: file.mimetype,
      ukuran: file.size,
    });

    // Buat record di database
    const dokumen = await this.prisma.contractDocument.create({
      data: {
        user_id: penggunaId,
        file_name: file.originalname,
        file_key: kunci,
        file_url: url,
        file_size: file.size,
        mime_type: file.mimetype,
        status: 'UPLOADED',
        // Auto-purge 90 hari dari sekarang
        scheduled_purge_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });

    return this.formatDokumen(dokumen);
  }

  /** Daftar dokumen milik pengguna (cursor pagination + filter risiko) */
  async daftar(penggunaId: string, dto: DtoDaftarDokumen) {
    const batas = Math.min(dto.batas ?? 20, 50);

    const filter: any = { user_id: penggunaId, deleted_at: null };
    
    // Jika filter risikoLevel aktif, join ke audit untuk filter
    if (dto.risikoLevel) {
      filter.audits = {
        some: {
          status: 'COMPLETED',
          overall_risk_level: dto.risikoLevel,
        },
      };
    }

    const dokumen = await this.prisma.contractDocument.findMany({
      where: filter,
      orderBy: { created_at: 'desc' },
      take: batas + 1,
      ...(dto.cursor ? { cursor: { id: dto.cursor }, skip: 1 } : {}),
      select: {
        id: true,
        file_name: true,
        file_size: true,
        mime_type: true,
        status: true,
        created_at: true,
        audits: {
          orderBy: { created_at: 'desc' },
          take: 1,
          select: {
            id: true,
            status: true,
            overall_risk_level: true,
            risk_score: true,
          }
        }
      },
    });

    const adaHalamanBerikut = dokumen.length > batas;
    const dataRow = adaHalamanBerikut ? dokumen.slice(0, -1) : dokumen;
    
    const data = dataRow.map((dok) => {
      const auditLatest = dok.audits[0];
      let skorMapped = null;
      if (auditLatest?.overall_risk_level) {
        if (auditLatest.overall_risk_level === 'RED') skorMapped = 'merah';
        else if (auditLatest.overall_risk_level === 'YELLOW') skorMapped = 'kuning';
        else if (auditLatest.overall_risk_level === 'GREEN') skorMapped = 'hijau';
      }
      
      return {
        id: dok.id,
        file_name: dok.file_name,
        file_size: dok.file_size,
        mime_type: dok.mime_type,
        status: auditLatest?.status ?? dok.status,
        created_at: dok.created_at,
        audit_id: auditLatest?.id ?? null,
        skor_risiko: skorMapped,
      };
    });

    const cursorBerikut = adaHalamanBerikut ? data[data.length - 1]?.id : null;

    return { data, cursorBerikut, adaHalamanBerikut };
  }

  /** Ambil detail satu dokumen (dengan presigned URL) */
  async ambilSatu(penggunaId: string, id: string) {
    const dokumen = await this.prisma.contractDocument.findFirst({
      where: { id, deleted_at: null },
    });

    if (!dokumen) {
      throw new NotFoundException('Dokumen tidak ditemukan');
    }

    if (dokumen.user_id !== penggunaId) {
      throw new ForbiddenException('Akses ditolak');
    }

    // Presigned URL valid 1 jam
    const urlSementara = await this.storage.buatUrlSementara(dokumen.file_key, 3600);

    return {
      ...this.formatDokumen(dokumen),
      urlUnduh: urlSementara,
    };
  }

  /**
   * Upload revisi kontrak — buat dokumen baru dengan parent_document_id (F-DOC-05)
   * Setelah upload, buat audit baru secara otomatis untuk dokumen revisi.
   */
  async uploadRevisi(
    penggunaId: string,
    parentId: string,
    file: Express.Multer.File & { buffer: Buffer; size: number; mimetype: string; originalname: string },
  ) {
    // Validasi dokumen induk milik pengguna
    const dokumenInduk = await this.prisma.contractDocument.findFirst({
      where: { id: parentId, user_id: penggunaId, deleted_at: null },
    });
    if (!dokumenInduk) throw new NotFoundException('Dokumen induk tidak ditemukan');

    // Validasi tipe file
    if (!TIPE_FILE_DIIZINKAN.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipe file tidak didukung. Gunakan PDF, JPEG, PNG, atau WebP.',
      );
    }

    // Validasi ukuran
    if (file.size > UKURAN_MAKS_BYTES) {
      throw new BadRequestException('Ukuran file maksimal 10 MB');
    }

    // Upload ke storage
    const ekstensi = file.originalname.split('.').pop() ?? 'bin';
    const kunci = `dokumen/${penggunaId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ekstensi}`;

    const { url } = await this.storage.upload({
      kunci,
      konten: file.buffer,
      tipeKonten: file.mimetype,
      ukuran: file.size,
    });

    // Buat record dokumen revisi dengan referensi ke induk
    const dokumenRevisi = await this.prisma.contractDocument.create({
      data: {
        user_id: penggunaId,
        file_name: file.originalname,
        file_key: kunci,
        file_url: url,
        file_size: file.size,
        mime_type: file.mimetype,
        status: 'UPLOADED',
        parent_document_id: parentId,
        scheduled_purge_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });

    this.logger.log(
      `Revisi dokumen ${dokumenRevisi.id} diunggah oleh pengguna ${penggunaId}, induk: ${parentId}`,
    );

    return this.formatDokumen(dokumenRevisi);
  }

  /**
   * Riwayat revisi dokumen — daftar dokumen turunan (F-DOC-05).
   * Revisi tersimpan sebagai dokumen baru dengan parent_document_id.
   */
  async riwayatRevisi(penggunaId: string, id: string) {
    // Verifikasi dokumen induk milik pengguna
    const dokumenInduk = await this.prisma.contractDocument.findFirst({
      where: { id, user_id: penggunaId, deleted_at: null },
      select: { id: true },
    });
    if (!dokumenInduk) throw new NotFoundException('Dokumen tidak ditemukan');

    const revisi = await this.prisma.contractDocument.findMany({
      where: { parent_document_id: id, user_id: penggunaId, deleted_at: null },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        file_name: true,
        file_size: true,
        mime_type: true,
        status: true,
        parent_document_id: true,
        created_at: true,
      },
    });

    return revisi.map((dok) => ({
      id: dok.id,
      namaFile: dok.file_name,
      ukuranFile: dok.file_size,
      tipeFile: dok.mime_type,
      status: dok.status,
      idDokumenInduk: dok.parent_document_id,
      dibuatPada: dok.created_at,
    }));
  }

  /** Hapus dokumen (soft delete + hapus dari storage) */
  async hapus(penggunaId: string, id: string): Promise<void> {
    const dokumen = await this.prisma.contractDocument.findFirst({
      where: { id, deleted_at: null },
    });

    if (!dokumen) {
      throw new NotFoundException('Dokumen tidak ditemukan');
    }

    if (dokumen.user_id !== penggunaId) {
      throw new ForbiddenException('Akses ditolak');
    }

    // Hapus dari storage dan soft delete
    await Promise.all([
      this.storage.hapus(dokumen.file_key),
      this.prisma.contractDocument.update({
        where: { id },
        data: { deleted_at: new Date() },
      }),
    ]);
  }

  /** Cron (jam 1 dini hari): kirim notifikasi 7 hari sebelum purge (F-PRIV-02) */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async kirimNotifikasiPurge(): Promise<void> {
    const batasNotif = new Date(
      Date.now() + HARI_NOTIF_SEBELUM_PURGE * 24 * 60 * 60 * 1000,
    );

    const dokumen = await this.prisma.contractDocument.findMany({
      where: {
        deleted_at: null,
        purge_notif_sent_at: null,
        scheduled_purge_at: { lte: batasNotif, gt: new Date() },
      },
      select: {
        id: true,
        file_name: true,
        scheduled_purge_at: true,
        user: { select: { email: true, name: true, notif_email_audit: true } },
      },
    });

    if (dokumen.length === 0) return;

    const frontendUrl = this.cfg.get<string>('FRONTEND_URL', 'http://localhost:3000');

    await Promise.allSettled(
      dokumen.map(async (dok) => {
        try {
          if (dok.user.notif_email_audit) {
            await this.email.kirim({
              ke: dok.user.email,
              subjek: 'Pengingat: Dokumen Kontrak Akan Segera Dihapus — KontrakAman AI',
              html: `
                <h2>Halo, ${dok.user.name}!</h2>
                <p>Dokumen kontrak <strong>${dok.file_name}</strong> akan dihapus otomatis pada
                <strong>${dok.scheduled_purge_at?.toLocaleDateString('id-ID')}</strong>.</p>
                <p>Jika Anda ingin menyimpannya, silakan unduh terlebih dahulu melalui aplikasi.</p>
                <p><a href="${frontendUrl}/dokumen" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Buka Dokumen Saya</a></p>
              `,
            });
          }

          await this.prisma.contractDocument.update({
            where: { id: dok.id },
            data: { purge_notif_sent_at: new Date() },
          });
        } catch (err) {
          this.logger.error(`Gagal kirim notif purge ${dok.id}: ${String(err)}`);
        }
      }),
    );

    this.logger.log(`Terkirim ${dokumen.length} notifikasi purge dokumen`);
  }

  /**
   * Cron (jam 09:00): kirim email pengingat ke pengguna dengan audit risiko MERAH
   * yang belum membuat negosiasi sama sekali (F-NOTIF-02)
   */
  @Cron('0 9 * * *')
  async cronPengingatAuditBerisiko(): Promise<void> {
    const frontendUrl = this.cfg.get<string>('FRONTEND_URL', 'http://localhost:3000');

    // Ambil audit COMPLETED dengan risk level RED yang belum punya negosiasi
    // dan belum ditandai selesai ditindaklanjuti (F-NOTIF-02)
    const auditBerisiko = await this.prisma.audit.findMany({
      where: {
        status: 'COMPLETED',
        overall_risk_level: 'RED',
        followed_up_at: null,
        negotiations: { none: {} },
      },
      select: {
        id: true,
        created_at: true,
        user: {
          select: {
            email: true,
            name: true,
            notif_email_pengingat: true,
          },
        },
        document: { select: { file_name: true } },
      },
    });

    if (auditBerisiko.length === 0) return;

    let terkirim = 0;
    await Promise.allSettled(
      auditBerisiko.map(async (audit) => {
        try {
          if (!audit.user.notif_email_pengingat) return;

          await this.email.kirim({
            ke: audit.user.email,
            subjek: '⚠️ Tindak Lanjut Diperlukan: Kontrak Anda Berisiko Tinggi — KontrakAman AI',
            html: `
              <h2>Halo, ${audit.user.name}!</h2>
              <p>Hasil audit kontrak <strong>${audit.document?.file_name ?? audit.id}</strong>
              menunjukkan <strong style="color:#dc2626;">risiko tinggi (MERAH)</strong>.</p>
              <p>Kami menyarankan Anda segera membuat draf negosiasi untuk melindungi kepentingan Anda
              sebelum menandatangani kontrak ini.</p>
              <p>
                <a href="${frontendUrl}/audit/${audit.id}"
                   style="background:#dc2626;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
                  Lihat Hasil Audit &amp; Buat Negosiasi
                </a>
              </p>
              <p style="font-size:12px;color:#6b7280;">
                Hasil audit ini bukan nasihat hukum final. Untuk kontrak bernilai besar atau kompleks,
                konsultasikan dengan profesional hukum.
              </p>
            `,
          });
          terkirim++;
        } catch (err) {
          this.logger.error(`Gagal kirim pengingat audit ${audit.id}: ${String(err)}`);
        }
      }),
    );

    this.logger.log(`Terkirim ${terkirim} pengingat audit risiko tinggi`);
  }

  /** Cron (jam 2 dini hari): hapus dokumen yang sudah melewati scheduledPurgeAt */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async hapusOtomatisDokumenKadaluwarsa(): Promise<void> {
    const dokumenKadaluwarsa = await this.prisma.contractDocument.findMany({
      where: {
        scheduled_purge_at: { lte: new Date() },
        deleted_at: null,
      },
      select: { id: true, file_key: true },
    });

    if (dokumenKadaluwarsa.length === 0) return;

    this.logger.log(
      `Menghapus ${dokumenKadaluwarsa.length} dokumen yang sudah kedaluwarsa`,
    );

    await Promise.allSettled(
      dokumenKadaluwarsa.map(async (dok) => {
        try {
          await this.storage.hapus(dok.file_key);
          await this.prisma.contractDocument.update({
            where: { id: dok.id },
            data: { deleted_at: new Date() },
          });
        } catch (err) {
          this.logger.error(`Gagal hapus dokumen ${dok.id}: ${String(err)}`);
        }
      }),
    );
  }

  /**
   * Cron (jam 3 dini hari): hapus permanen dokumen yang sudah soft-deleted
   * lebih dari HARI_RETENSI_SOFT_DELETE hari (F-PRIV-02)
   */
  @Cron('0 3 * * *')
  async hapusPermanenDokumenSoftDeleted(): Promise<void> {
    const hariRetensi = this.cfg.get<number>('SOFT_DELETE_RETENTION_DAYS', 30);
    const batasHapus = new Date(
      Date.now() - hariRetensi * 24 * 60 * 60 * 1000,
    );

    const dokumenKadaluwarsa = await this.prisma.contractDocument.findMany({
      where: {
        deleted_at: { lte: batasHapus },
        // Pastikan sudah soft-deleted (bukan scheduled purge biasa)
        scheduled_purge_at: null,
      },
      select: { id: true, file_key: true },
    });

    if (dokumenKadaluwarsa.length === 0) return;

    this.logger.log(
      `Menghapus permanen ${dokumenKadaluwarsa.length} dokumen soft-deleted > ${hariRetensi} hari`,
    );

    await Promise.allSettled(
      dokumenKadaluwarsa.map(async (dok) => {
        try {
          // Hapus dari S3
          await this.storage.hapus(dok.file_key);
          // Hapus record dari DB
          await this.prisma.contractDocument.delete({ where: { id: dok.id } });
        } catch (err) {
          this.logger.error(`Gagal hapus permanen dokumen ${dok.id}: ${String(err)}`);
        }
      }),
    );
  }

  private formatDokumen(dok: {
    id: string;
    file_name: string;
    file_key: string;
    file_url: string;
    file_size: number;
    mime_type: string;
    status: string;
    created_at: Date;
  }) {
    return {
      id: dok.id,
      namaFile: dok.file_name,
      kunciFile: dok.file_key,
      urlFile: dok.file_url,
      ukuranFile: dok.file_size,
      tipeFile: dok.mime_type,
      status: dok.status,
      dibuatPada: dok.created_at,
    };
  }
}
