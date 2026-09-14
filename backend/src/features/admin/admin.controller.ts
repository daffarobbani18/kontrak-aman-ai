import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminGuard } from './guards/admin.guard';
import {
  DtoBuatPaketAdmin,
  DtoDaftarAuditLog,
  DtoDaftarPenggunaAdmin,
  DtoDaftarTransaksiAdmin,
  DtoPerbaruiKonfigurasi,
  DtoPerbaruiKuotaAdmin,
  DtoPerbaruiPaketAdmin,
  DtoStatistikAdmin,
} from './dto/admin.dto';

@ApiTags('Admin')
@ApiBearerAuth('JWT')
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── Manajemen Pengguna ────────────────────────────────────────────────────

  // GET /v1/admin/pengguna
  @Get('pengguna')
  @ApiOperation({ summary: '[Admin] Daftar semua pengguna dengan pencarian' })
  async daftarPengguna(@Query() query: DtoDaftarPenggunaAdmin) {
    const hasil = await this.adminService.daftarPengguna(query);
    return {
      pesan: 'Daftar pengguna berhasil diambil',
      data: hasil.data,
      paginasi: hasil.paginasi,
    };
  }

  // GET /v1/admin/pengguna/:id
  @Get('pengguna/:id')
  @ApiOperation({ summary: '[Admin] Detail pengguna beserta langganan & kuota' })
  async detailPengguna(@Param('id') id: string) {
    const hasil = await this.adminService.detailPengguna(id);
    return { pesan: 'Detail pengguna berhasil diambil', data: hasil };
  }

  // PATCH /v1/admin/pengguna/:id/suspend
  @Patch('pengguna/:id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Suspend pengguna — blokir akses tanpa menghapus data' })
  async suspendPengguna(@Param('id') id: string) {
    await this.adminService.suspendPengguna(id);
    return { pesan: 'Pengguna berhasil disuspend', data: null };
  }

  // PATCH /v1/admin/pengguna/:id/aktifkan
  @Patch('pengguna/:id/aktifkan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Aktifkan kembali pengguna yang tersuspensi' })
  async aktifkanPengguna(@Param('id') id: string) {
    await this.adminService.aktifkanPengguna(id);
    return { pesan: 'Pengguna berhasil diaktifkan kembali', data: null };
  }

  // DELETE /v1/admin/pengguna/:id
  @Delete('pengguna/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Nonaktifkan pengguna (soft delete via deleted_at)' })
  async nonaktifkanPengguna(@Param('id') id: string) {
    await this.adminService.nonaktifkanPengguna(id);
    return { pesan: 'Pengguna berhasil dinonaktifkan', data: null };
  }

  // GET /v1/admin/pengguna/:id/kuota-override
  @Get('pengguna/:id/kuota-override')
  @ApiOperation({ summary: '[Admin] Daftar semua quota override milik satu pengguna' })
  async daftarKuotaOverride(@Param('id') id: string) {
    const hasil = await this.adminService.daftarKuotaOverride(id);
    return { pesan: 'Daftar kuota override berhasil diambil', data: hasil };
  }

  // PATCH /v1/admin/pengguna/:id/kuota
  @Patch('pengguna/:id/kuota')
  @ApiOperation({ summary: '[Admin] Perbarui override kuota pengguna' })
  async perbaruiKuota(
    @Param('id') id: string,
    @Body() dto: DtoPerbaruiKuotaAdmin,
  ) {
    await this.adminService.perbaruiKuota(id, dto);
    return { pesan: 'Kuota pengguna berhasil diperbarui', data: null };
  }

  // ── Statistik & Audit Log ─────────────────────────────────────────────────

  // GET /v1/admin/statistik
  @Get('statistik')
  @ApiOperation({
    summary: '[Admin] Statistik global platform',
    description: 'Filter opsional dengan query ?dari=2024-01-01&sampai=2024-12-31',
  })
  async statistik(@Query() query: DtoStatistikAdmin) {
    const hasil = await this.adminService.statistik(query);
    return { pesan: 'Statistik berhasil diambil', data: hasil };
  }

  // GET /v1/admin/audit-logs
  @Get('audit-logs')
  @ApiOperation({
    summary: '[Admin] Daftar audit log dengan filter penggunaId, aksi, dan rentang tanggal',
  })
  async daftarAuditLog(@Query() query: DtoDaftarAuditLog) {
    const hasil = await this.adminService.daftarAuditLog(query);
    return {
      pesan: 'Audit log berhasil diambil',
      data: hasil.data,
      cursorBerikut: hasil.cursorBerikut,
      adaHalamanBerikut: hasil.adaHalamanBerikut,
    };
  }

  // ── Transaksi ─────────────────────────────────────────────────────────────

  // GET /v1/admin/transaksi
  @Get('transaksi')
  @ApiOperation({
    summary: '[Admin] Daftar semua transaksi dengan filter & paginasi',
    description: 'Filter opsional: ?penggunaId=xxx&status=PAID',
  })
  async daftarTransaksi(@Query() query: DtoDaftarTransaksiAdmin) {
    const hasil = await this.adminService.daftarTransaksi(query);
    return {
      pesan: 'Daftar transaksi berhasil diambil',
      data: hasil.data,
      paginasi: hasil.paginasi,
    };
  }

  // ── Konfigurasi Sistem ────────────────────────────────────────────────────

  // GET /v1/admin/konfigurasi
  @Get('konfigurasi')
  @ApiOperation({ summary: '[Admin] Daftar semua konfigurasi sistem' })
  async daftarKonfigurasi() {
    const hasil = await this.adminService.daftarKonfigurasi();
    return { pesan: 'Daftar konfigurasi berhasil diambil', data: hasil };
  }

  // GET /v1/admin/konfigurasi/:key
  @Get('konfigurasi/:key')
  @ApiOperation({ summary: '[Admin] Ambil satu konfigurasi berdasarkan key' })
  async ambilKonfigurasi(@Param('key') key: string) {
    const hasil = await this.adminService.ambilKonfigurasi(key);
    return { pesan: 'Konfigurasi berhasil diambil', data: hasil };
  }

  // PUT /v1/admin/konfigurasi/:key
  @Put('konfigurasi/:key')
  @ApiOperation({ summary: '[Admin] Perbarui (upsert) nilai konfigurasi sistem' })
  async perbaruiKonfigurasi(
    @Param('key') key: string,
    @Body() dto: DtoPerbaruiKonfigurasi,
  ) {
    const hasil = await this.adminService.perbaruiKonfigurasi(key, dto);
    return { pesan: 'Konfigurasi berhasil diperbarui', data: hasil };
  }

  // ── Manajemen Paket ───────────────────────────────────────────────────────

  // GET /v1/admin/paket
  @Get('paket')
  @ApiOperation({ summary: '[Admin] Daftar semua paket (termasuk nonaktif)' })
  async daftarPaket() {
    const hasil = await this.adminService.daftarPaket();
    return { pesan: 'Daftar paket berhasil diambil', data: hasil };
  }

  // GET /v1/admin/paket/:id
  @Get('paket/:id')
  @ApiOperation({ summary: '[Admin] Detail paket' })
  async detailPaket(@Param('id') id: string) {
    const hasil = await this.adminService.detailPaket(id);
    return { pesan: 'Detail paket berhasil diambil', data: hasil };
  }

  // POST /v1/admin/paket
  @Post('paket')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Admin] Buat paket baru' })
  async buatPaket(@Body() dto: DtoBuatPaketAdmin) {
    const hasil = await this.adminService.buatPaket(dto);
    return { pesan: 'Paket berhasil dibuat', data: hasil };
  }

  // PATCH /v1/admin/paket/:id
  @Patch('paket/:id')
  @ApiOperation({ summary: '[Admin] Perbarui paket' })
  async perbaruiPaket(
    @Param('id') id: string,
    @Body() dto: DtoPerbaruiPaketAdmin,
  ) {
    const hasil = await this.adminService.perbaruiPaket(id, dto);
    return { pesan: 'Paket berhasil diperbarui', data: hasil };
  }

  // DELETE /v1/admin/paket/:id
  @Delete('paket/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Nonaktifkan paket (soft delete)' })
  async hapusPaket(@Param('id') id: string) {
    await this.adminService.hapusPaket(id);
    return { pesan: 'Paket berhasil dinonaktifkan', data: null };
  }
}
