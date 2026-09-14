import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { DtoBuatAudit, DtoDaftarAudit, DtoHasilAuditInternal } from './dto/audit.dto';
import { CurrentUser, PenggunaAktif } from '../../core/decorators/current-user.decorator';
import { Public } from '../../core/decorators/public.decorator';
import { InternalApiGuard } from '../../core/guards/internal-api.guard';

@ApiTags('Audit')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  // POST /v1/audit
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Buat permintaan audit kontrak baru' })
  async buat(
    @CurrentUser() pengguna: PenggunaAktif,
    @Body() dto: DtoBuatAudit,
  ) {
    const hasil = await this.auditService.buat(pengguna.id, dto);
    return { pesan: 'Audit berhasil dijadwalkan', data: hasil };
  }

  // GET /v1/audit
  @Get()
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Daftar audit milik pengguna' })
  async daftar(
    @CurrentUser() pengguna: PenggunaAktif,
    @Query() query: DtoDaftarAudit,
  ) {
    const hasil = await this.auditService.daftar(pengguna.id, query);
    return { pesan: 'Daftar audit berhasil diambil', data: hasil };
  }

  // GET /v1/audit/:id
  @Get(':id')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Detail hasil audit' })
  async ambilSatu(
    @CurrentUser() pengguna: PenggunaAktif,
    @Param('id') id: string,
  ) {
    const hasil = await this.auditService.ambilSatu(pengguna.id, id);
    return { pesan: 'Detail audit berhasil diambil', data: hasil };
  }

  // POST /v1/audit/:id/coba-ulang
  @Post(':id/coba-ulang')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Coba ulang audit yang gagal tanpa memotong kuota baru' })
  async cobaUlang(
    @CurrentUser() pengguna: PenggunaAktif,
    @Param('id') id: string,
  ) {
    const hasil = await this.auditService.cobaUlang(pengguna.id, id);
    return { pesan: 'Audit berhasil dijadwalkan ulang', data: hasil };
  }

  // PATCH /v1/audit/:id/tandai-selesai
  @Patch(':id/tandai-selesai')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Tandai audit risiko tinggi sebagai selesai ditindaklanjuti (F-NOTIF-02)' })
  async tandaiSelesai(
    @CurrentUser() pengguna: PenggunaAktif,
    @Param('id') id: string,
  ) {
    const hasil = await this.auditService.tandaiSelesai(pengguna.id, id);
    return { pesan: 'Audit berhasil ditandai selesai ditindaklanjuti', data: hasil };
  }

  // POST /v1/internal/audit/selesai — dipanggil backend-ai
  @Public()
  @UseGuards(InternalApiGuard)
  @Post('internal/selesai')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Internal] Callback hasil audit dari backend-ai' })
  async selesaikanAudit(
    @Body() dto: DtoHasilAuditInternal,
  ) {
    await this.auditService.selesaikanAudit(dto);
    return { pesan: 'Hasil audit berhasil disimpan', data: null };
  }
}
