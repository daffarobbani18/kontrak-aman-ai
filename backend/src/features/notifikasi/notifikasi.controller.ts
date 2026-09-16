import { Controller, Get, HttpCode, HttpStatus, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotifikasiService } from './notifikasi.service';
import { DtoDaftarNotifikasi } from './dto/notifikasi.dto';
import { CurrentUser, PenggunaAktif } from '../../core/decorators/current-user.decorator';

@ApiTags('Notifikasi')
@ApiBearerAuth('JWT')
@Controller('notifikasi')
export class NotifikasiController {
  constructor(private readonly notifikasiService: NotifikasiService) {}

  // GET /v1/notifikasi
  @Get()
  @ApiOperation({ summary: 'Daftar notifikasi in-app milik pengguna (cursor pagination)' })
  async daftar(
    @CurrentUser() pengguna: PenggunaAktif,
    @Query() query: DtoDaftarNotifikasi,
  ) {
    const hasil = await this.notifikasiService.daftar(pengguna.id, query);
    return { pesan: 'Daftar notifikasi berhasil diambil', data: hasil };
  }

  // PATCH /v1/notifikasi/baca-semua — harus sebelum :id/baca agar tidak bentrok param
  @Patch('baca-semua')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tandai seluruh notifikasi telah dibaca' })
  async tandaiSemuaDibaca(@CurrentUser() pengguna: PenggunaAktif) {
    const hasil = await this.notifikasiService.tandaiSemuaDibaca(pengguna.id);
    return { pesan: 'Semua notifikasi berhasil ditandai dibaca', data: hasil };
  }

  // PATCH /v1/notifikasi/:id/baca
  @Patch(':id/baca')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tandai satu notifikasi telah dibaca' })
  async tandaiDibaca(
    @CurrentUser() pengguna: PenggunaAktif,
    @Param('id') id: string,
  ) {
    const hasil = await this.notifikasiService.tandaiDibaca(pengguna.id, id);
    return { pesan: 'Notifikasi berhasil ditandai dibaca', data: hasil };
  }
}
