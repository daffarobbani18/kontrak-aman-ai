import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.module';
import { DtoDaftarNotifikasi } from './dto/notifikasi.dto';

/** Tipe notifikasi — selaras enum NotificationType di schema.prisma */
export type TipeNotifikasi =
  | 'AUDIT_SELESAI'
  | 'NEGOSIASI_SELESAI'
  | 'DOKUMEN_PURGE'
  | 'LANGGANAN';

@Injectable()
export class NotifikasiService {
  private readonly logger = new Logger(NotifikasiService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Buat notifikasi in-app — dipanggil dari fitur lain (audit, negosiasi, langganan) */
  async buat(data: {
    penggunaId: string;
    tipe: TipeNotifikasi;
    judul: string;
    isi: string;
    tipeEntitas?: string;
    idEntitas?: string;
  }): Promise<void> {
    try {
      await this.prisma.notification.create({
        data: {
          user_id: data.penggunaId,
          type: data.tipe,
          title: data.judul,
          body: data.isi,
          entity_type: data.tipeEntitas ?? null,
          entity_id: data.idEntitas ?? null,
        },
      });
    } catch (err) {
      // Jangan gagalkan alur utama hanya karena notifikasi gagal dibuat
      this.logger.warn(`Gagal buat notifikasi untuk pengguna ${data.penggunaId}: ${String(err)}`);
    }
  }

  /** Daftar notifikasi milik pengguna (cursor pagination) */
  async daftar(penggunaId: string, dto: DtoDaftarNotifikasi) {
    const batas = Math.min(dto.batas ?? 20, 50);

    const notifikasi = await this.prisma.notification.findMany({
      where: { user_id: penggunaId },
      orderBy: { created_at: 'desc' },
      take: batas + 1,
      ...(dto.cursor ? { cursor: { id: dto.cursor }, skip: 1 } : {}),
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        entity_type: true,
        entity_id: true,
        read_at: true,
        created_at: true,
      },
    });

    const adaHalamanBerikut = notifikasi.length > batas;
    const data = adaHalamanBerikut ? notifikasi.slice(0, -1) : notifikasi;

    return {
      data: data.map((n) => ({
        id: n.id,
        tipe: n.type,
        judul: n.title,
        isi: n.body,
        tipeEntitas: n.entity_type,
        idEntitas: n.entity_id,
        telahDibaca: n.read_at !== null,
        dibacaPada: n.read_at,
        dibuatPada: n.created_at,
      })),
      cursorBerikut: adaHalamanBerikut ? data[data.length - 1]?.id : null,
      adaHalamanBerikut,
    };
  }

  /** Jumlah notifikasi belum dibaca — untuk badge di navbar */
  async jumlahBelumDibaca(penggunaId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { user_id: penggunaId, read_at: null },
    });
  }

  /** Tandai satu notifikasi telah dibaca (wajib milik pengguna) */
  async tandaiDibaca(penggunaId: string, id: string) {
    const notifikasi = await this.prisma.notification.findUnique({
      where: { id },
      select: { id: true, user_id: true, read_at: true },
    });

    if (!notifikasi) throw new NotFoundException('Notifikasi tidak ditemukan');
    if (notifikasi.user_id !== penggunaId) throw new ForbiddenException('Akses ditolak');

    const diperbarui = await this.prisma.notification.update({
      where: { id },
      data: { read_at: new Date() },
      select: { id: true, read_at: true },
    });

    return {
      id: diperbarui.id,
      telahDibaca: true,
      dibacaPada: diperbarui.read_at,
    };
  }

  /** Tandai semua notifikasi pengguna telah dibaca */
  async tandaiSemuaDibaca(penggunaId: string) {
    const hasil = await this.prisma.notification.updateMany({
      where: { user_id: penggunaId, read_at: null },
      data: { read_at: new Date() },
    });

    return { jumlahDitandai: hasil.count };
  }
}
