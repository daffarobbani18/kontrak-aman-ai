import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PenggunaService } from './pengguna.service';
import { DtoPerbaruiProfil, DtoPreferensiNotifikasi, DtoHapusAkun } from './dto/pengguna.dto';
import { DtoUbahKataSandi } from '../auth/dto/auth.dto';
import { CurrentUser, PenggunaAktif } from '../../core/decorators/current-user.decorator';

@ApiTags('Pengguna')
@ApiBearerAuth('JWT')
@Controller('pengguna')
export class PenggunaController {
  constructor(private readonly penggunaService: PenggunaService) {}

  // GET /v1/pengguna/saya/ekspor-data
  @Get('saya/ekspor-data')
  @ApiOperation({ summary: 'Ekspor seluruh data pribadi pengguna sebagai JSON (F-PRIV-03)' })
  async eksporData(@CurrentUser() pengguna: PenggunaAktif) {
    const data = await this.penggunaService.eksporData(pengguna.id);
    return { pesan: 'Data pribadi berhasil diekspor', data };
  }

  // GET /v1/pengguna/saya/dashboard
  @Get('saya/dashboard')
  @ApiOperation({ summary: 'Ringkasan dashboard pengguna: statistik, kuota, dan aktivitas terbaru' })
  async dashboard(@CurrentUser() pengguna: PenggunaAktif) {
    const data = await this.penggunaService.dashboard(pengguna.id);
    return { pesan: 'Dashboard berhasil diambil', data };
  }

  // GET /v1/pengguna/saya
  @Get('saya')
  @ApiOperation({ summary: 'Ambil profil dan kuota pengguna yang sedang login' })
  async ambilProfil(@CurrentUser() pengguna: PenggunaAktif) {
    const profil = await this.penggunaService.ambilProfil(pengguna.id);
    return { pesan: 'Profil berhasil diambil', data: profil };
  }

  // POST /v1/pengguna/saya/avatar
  @Post('saya/avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload foto avatar pengguna ke S3 (maks 2MB, JPEG/PNG)' })
  async uploadAvatar(
    @CurrentUser() pengguna: PenggunaAktif,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const hasil = await this.penggunaService.uploadAvatar(pengguna.id, file);
    return { pesan: 'Avatar berhasil diperbarui', data: hasil };
  }

  // PATCH /v1/pengguna/saya
  @Patch('saya')
  @ApiOperation({ summary: 'Perbarui nama atau avatar pengguna' })
  async perbaruiProfil(
    @CurrentUser() pengguna: PenggunaAktif,
    @Body() dto: DtoPerbaruiProfil,
  ) {
    const hasil = await this.penggunaService.perbaruiProfil(pengguna.id, dto);
    return { pesan: 'Profil berhasil diperbarui', data: hasil };
  }

  // POST /v1/pengguna/ubah-kata-sandi
  @Post('ubah-kata-sandi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ubah kata sandi (memerlukan kata sandi lama)' })
  async ubahKataSandi(
    @CurrentUser() pengguna: PenggunaAktif,
    @Body() dto: DtoUbahKataSandi,
  ) {
    await this.penggunaService.ubahKataSandi(pengguna.id, dto);
    return { pesan: 'Kata sandi berhasil diubah', data: null };
  }

  // POST /v1/pengguna/saya/setuju-privasi
  @Post('saya/setuju-privasi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Catat persetujuan kebijakan privasi pengguna' })
  async setujuPrivasi(@CurrentUser() pengguna: PenggunaAktif) {
    await this.penggunaService.setujuPrivasi(pengguna.id);
    return { pesan: 'Persetujuan privasi berhasil dicatat', data: null };
  }

  // PATCH /v1/pengguna/saya/preferensi-notifikasi
  @Patch('saya/preferensi-notifikasi')
  @ApiOperation({ summary: 'Perbarui preferensi notifikasi email pengguna' })
  async perbaruiPreferensiNotifikasi(
    @CurrentUser() pengguna: PenggunaAktif,
    @Body() dto: DtoPreferensiNotifikasi,
  ) {
    const hasil = await this.penggunaService.perbaruiPreferensiNotifikasi(
      pengguna.id,
      dto,
    );
    return { pesan: 'Preferensi notifikasi berhasil diperbarui', data: hasil };
  }

  // DELETE /v1/pengguna/saya
  @Delete('saya')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus akun secara permanen beserta seluruh data (konfirmasi kata sandi diperlukan)' })
  async hapusAkun(
    @CurrentUser() pengguna: PenggunaAktif,
    @Body() dto: DtoHapusAkun,
  ) {
    await this.penggunaService.hapusAkun(pengguna.id, dto.kataSandi);
    return { pesan: 'Akun berhasil dihapus secara permanen', data: null };
  }
}
