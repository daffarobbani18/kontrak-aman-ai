import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NegosiasiService } from './negosiasi.service';
import {
  DtoBuatNegosiasi,
  DtoDaftarNegosiasi,
  DtoEditDrafNegosiasi,
  DtoHasilNegosiasiInternal,
} from './dto/negosiasi.dto';
import { CurrentUser, PenggunaAktif } from '../../core/decorators/current-user.decorator';
import { Public } from '../../core/decorators/public.decorator';
import { InternalApiGuard } from '../../core/guards/internal-api.guard';

@ApiTags('Negosiasi')
@Controller('negosiasi')
export class NegosiasiController {
  constructor(private readonly negosiasiService: NegosiasiService) {}

  // POST /v1/negosiasi
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Buat permintaan draf negosiasi kontrak' })
  async buat(
    @CurrentUser() pengguna: PenggunaAktif,
    @Body() dto: DtoBuatNegosiasi,
  ) {
    const hasil = await this.negosiasiService.buat(pengguna.id, dto);
    return { pesan: 'Negosiasi berhasil dijadwalkan', data: hasil };
  }

  // GET /v1/negosiasi
  @Get()
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Daftar negosiasi milik pengguna' })
  async daftar(
    @CurrentUser() pengguna: PenggunaAktif,
    @Query() query: DtoDaftarNegosiasi,
  ) {
    const hasil = await this.negosiasiService.daftar(pengguna.id, query);
    return { pesan: 'Daftar negosiasi berhasil diambil', data: hasil };
  }

  // GET /v1/negosiasi/:id
  @Get(':id')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Detail hasil negosiasi' })
  async ambilSatu(
    @CurrentUser() pengguna: PenggunaAktif,
    @Param('id') id: string,
  ) {
    const hasil = await this.negosiasiService.ambilSatu(pengguna.id, id);
    return { pesan: 'Detail negosiasi berhasil diambil', data: hasil };
  }

  // GET /v1/negosiasi/:id/draf-final — ambil draf final (edited fallback ke generated)
  @Get(':id/draf-final')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Ambil draf final negosiasi — edited_draft jika ada, fallback ke draft_document',
  })
  async ambilDrafFinal(
    @CurrentUser() pengguna: PenggunaAktif,
    @Param('id') id: string,
  ) {
    const hasil = await this.negosiasiService.ambilDrafFinal(pengguna.id, id);
    return { pesan: 'Draf final berhasil diambil', data: hasil };
  }

  // GET /v1/negosiasi/:id/ekspor-teks — ekspor draf sebagai plain text (F-NEGO-03)
  @Get(':id/ekspor-teks')
  @ApiBearerAuth('JWT')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @ApiOperation({ summary: 'Ekspor draf negosiasi sebagai file teks dengan disclaimer (F-NEGO-03)' })
  async eksporTeks(
    @CurrentUser() pengguna: PenggunaAktif,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const teks = await this.negosiasiService.eksporTeks(pengguna.id, id);
    res.setHeader('Content-Disposition', `attachment; filename="draf-negosiasi-${id}.txt"`);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(teks);
  }

  // PATCH /v1/negosiasi/:id/draf — edit manual draf negosiasi
  @Patch(':id/draf')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Edit manual draf negosiasi yang sudah selesai' })
  async editDraf(
    @CurrentUser() pengguna: PenggunaAktif,
    @Param('id') id: string,
    @Body() dto: DtoEditDrafNegosiasi,
  ) {
    const hasil = await this.negosiasiService.editDraf(pengguna.id, id, dto.draf);
    return { pesan: 'Draf negosiasi berhasil diperbarui', data: hasil };
  }

  // POST /v1/negosiasi/:id/coba-ulang
  @Post(':id/coba-ulang')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Coba ulang negosiasi yang gagal (status FAILED)' })
  async cobaUlang(
    @CurrentUser() pengguna: PenggunaAktif,
    @Param('id') id: string,
  ) {
    const hasil = await this.negosiasiService.cobaUlang(pengguna.id, id);
    return { pesan: 'Negosiasi berhasil dijadwalkan ulang', data: hasil };
  }

  // POST /v1/negosiasi/internal/selesai — dipanggil backend-ai
  @Public()
  @UseGuards(InternalApiGuard)
  @Post('internal/selesai')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Internal] Callback hasil negosiasi dari backend-ai' })
  async selesaikanNegosiasi(
    @Body() dto: DtoHasilNegosiasiInternal,
  ) {
    await this.negosiasiService.selesaikanNegosiasi(dto);
    return { pesan: 'Hasil negosiasi berhasil disimpan', data: null };
  }
}
