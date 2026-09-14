import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LanggananService } from './langganan.service';
import { DtoBuatSesiPembayaran, DtoDaftarTransaksi } from './dto/langganan.dto';
import { CurrentUser, PenggunaAktif } from '../../core/decorators/current-user.decorator';
import { Public } from '../../core/decorators/public.decorator';

@ApiTags('Langganan')
@Controller('langganan')
export class LanggananController {
  constructor(private readonly langgananService: LanggananService) {}

  // GET /v1/langganan/paket — publik
  @Public()
  @Get('paket')
  @ApiOperation({ summary: 'Daftar semua paket langganan tersedia' })
  async daftarPaket() {
    const hasil = await this.langgananService.daftarPaket();
    return { pesan: 'Daftar paket berhasil diambil', data: hasil };
  }

  // POST /v1/langganan/buat-sesi-pembayaran
  @Post('buat-sesi-pembayaran')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Buat sesi pembayaran Mayar untuk berlangganan' })
  async buatSesiPembayaran(
    @CurrentUser() pengguna: PenggunaAktif,
    @Body() dto: DtoBuatSesiPembayaran,
  ) {
    const hasil = await this.langgananService.buatSesiPembayaran(
      pengguna.id,
      dto,
    );
    return { pesan: 'Sesi pembayaran berhasil dibuat', data: hasil };
  }

  // GET /v1/langganan/aktif
  @Get('aktif')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Ambil langganan aktif pengguna' })
  async langgananAktif(@CurrentUser() pengguna: PenggunaAktif) {
    const hasil = await this.langgananService.langgananAktif(pengguna.id);
    return {
      pesan: hasil ? 'Langganan aktif ditemukan' : 'Tidak ada langganan aktif',
      data: hasil,
    };
  }

  // POST /v1/langganan/batalkan
  @Post('batalkan')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Batalkan langganan aktif' })
  async batalkan(@CurrentUser() pengguna: PenggunaAktif) {
    await this.langgananService.batalkan(pengguna.id);
    return { pesan: 'Langganan berhasil dibatalkan', data: null };
  }

  // GET /v1/langganan/transaksi
  @Get('transaksi')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Riwayat transaksi pengguna dengan paginasi' })
  async transaksi(
    @CurrentUser() pengguna: PenggunaAktif,
    @Query() query: DtoDaftarTransaksi,
  ) {
    const hasil = await this.langgananService.transaksi(pengguna.id, query);
    return { pesan: 'Riwayat transaksi berhasil diambil', data: hasil };
  }

  // GET /v1/langganan/transaksi/:id/invoice
  @Get('transaksi/:id/invoice')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Detail invoice satu transaksi (F-BILL-03)' })
  async invoice(
    @CurrentUser() pengguna: PenggunaAktif,
    @Param('id') id: string,
  ) {
    const hasil = await this.langgananService.invoice(pengguna.id, id);
    return { pesan: 'Invoice berhasil diambil', data: hasil };
  }

  // GET /v1/langganan/kuota
  @Get('kuota')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Sisa kuota audit & negosiasi pengguna bulan ini (F-BILL-01)' })
  async kuota(@CurrentUser() pengguna: PenggunaAktif) {
    const hasil = await this.langgananService.kuota(pengguna.id);
    return { pesan: 'Informasi kuota berhasil diambil', data: hasil };
  }
}
