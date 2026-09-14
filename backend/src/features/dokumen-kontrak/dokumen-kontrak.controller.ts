/// <reference types="multer" />
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DokumenKontrakService } from './dokumen-kontrak.service';
import { DtoDaftarDokumen } from './dto/dokumen-kontrak.dto';
import { CurrentUser, PenggunaAktif } from '../../core/decorators/current-user.decorator';

@ApiTags('Dokumen Kontrak')
@ApiBearerAuth('JWT')
@Controller('dokumen-kontrak')
export class DokumenKontrakController {
  constructor(private readonly dokumenService: DokumenKontrakService) {}

  // POST /v1/dokumen-kontrak/upload
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', { storage: undefined })) // memori buffer
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload dokumen kontrak (PDF/gambar, maks 10MB)' })
  async upload(
    @CurrentUser() pengguna: PenggunaAktif,
    @UploadedFile() file: Express.Multer.File & { buffer: Buffer; size: number; mimetype: string; originalname: string },
  ) {
    const hasil = await this.dokumenService.upload(pengguna.id, file);
    return { pesan: 'Dokumen berhasil diunggah', data: hasil };
  }

  // GET /v1/dokumen-kontrak
  @Get()
  @ApiOperation({ summary: 'Daftar dokumen milik pengguna (cursor pagination)' })
  async daftar(
    @CurrentUser() pengguna: PenggunaAktif,
    @Query() query: DtoDaftarDokumen,
  ) {
    const hasil = await this.dokumenService.daftar(pengguna.id, query);
    return { pesan: 'Daftar dokumen berhasil diambil', data: hasil };
  }

  // GET /v1/dokumen-kontrak/:id
  @Get(':id')
  @ApiOperation({ summary: 'Detail dokumen dengan presigned download URL' })
  async ambilSatu(
    @CurrentUser() pengguna: PenggunaAktif,
    @Param('id') id: string,
  ) {
    const hasil = await this.dokumenService.ambilSatu(pengguna.id, id);
    return { pesan: 'Detail dokumen berhasil diambil', data: hasil };
  }

  // POST /v1/dokumen-kontrak/:id/revisi
  @Post(':id/revisi')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', { storage: undefined }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload revisi dokumen kontrak — buat versi baru dengan referensi ke induk (F-DOC-05)' })
  async uploadRevisi(
    @CurrentUser() pengguna: PenggunaAktif,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File & { buffer: Buffer; size: number; mimetype: string; originalname: string },
  ) {
    const hasil = await this.dokumenService.uploadRevisi(pengguna.id, id, file);
    return { pesan: 'Revisi dokumen berhasil diunggah', data: hasil };
  }

  // DELETE /v1/dokumen-kontrak/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus dokumen (soft delete + hapus dari storage)' })
  async hapus(
    @CurrentUser() pengguna: PenggunaAktif,
    @Param('id') id: string,
  ) {
    await this.dokumenService.hapus(pengguna.id, id);
    return { pesan: 'Dokumen berhasil dihapus', data: null };
  }
}
