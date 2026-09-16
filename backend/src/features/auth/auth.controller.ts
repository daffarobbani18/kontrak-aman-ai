import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import {
  DtoDaftar,
  DtoMasuk,
  DtoRefreshToken,
  DtoLupaKataSandi,
  DtoResetKataSandi,
  DtoKirimUlangVerifikasi,
} from './dto/auth.dto';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../core/decorators/public.decorator';
import { CurrentUser, PenggunaAktif } from '../../core/decorators/current-user.decorator';
import { GoogleProfile } from './strategies/google.strategy';

@ApiTags('Autentikasi')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cfg: ConfigService,
  ) {}

  // ── Daftar ──────────────────────────────────────────────────────────────────
  @Public()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('daftar')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Daftar akun baru' })
  async daftar(@Body() dto: DtoDaftar) {
    const hasil = await this.authService.daftar(dto);
    return {
      pesan: 'Pendaftaran berhasil. Silakan cek email untuk verifikasi.',
      data: hasil,
    };
  }

  // ── Kirim ulang verifikasi email ─────────────────────────────────────────────
  @Public()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('kirim-ulang-verifikasi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kirim ulang email verifikasi' })
  async kirimUlangVerifikasi(@Body() dto: DtoKirimUlangVerifikasi) {
    await this.authService.kirimUlangVerifikasi(dto.email);
    return {
      pesan: 'Jika email terdaftar dan belum diverifikasi, email verifikasi telah dikirim ulang.',
      data: null,
    };
  }

  // ── Verifikasi email ─────────────────────────────────────────────────────────
  @Public()
  @Get('verifikasi-email')
  @ApiOperation({ summary: 'Verifikasi email dengan token' })
  async verifikasiEmail(@Query('token') token: string) {
    await this.authService.verifikasiEmail(token);
    return { pesan: 'Email berhasil diverifikasi', data: null };
  }

  // ── Masuk ────────────────────────────────────────────────────────────────
  @Public()
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('masuk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login dengan email & kata sandi' })
  async masuk(
    @Body() dto: DtoMasuk,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.masuk(dto);
    // Refresh token juga dikirim via httpOnly cookie — jangan disimpan di localStorage
    this.aturCookieRefresh(res, token.refresh_token);
    return { pesan: 'Login berhasil', data: token };
  }

  // ── Google OAuth ─────────────────────────────────────────────────────────────
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Redirect ke Google OAuth' })
  googleLogin(): void {
    // Passport menangani redirect, method ini tidak dipanggil secara langsung
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Callback Google OAuth' })
  async googleCallback(
    @Req() req: Request & { user: GoogleProfile },
    @Res() res: Response,
  ): Promise<void> {
    const token = await this.authService.masukDenganGoogle(req.user);
    const frontendUrl = this.cfg.get<string>('FRONTEND_URL', 'http://localhost:3000');
    // Refresh token juga disetel sebagai httpOnly cookie
    this.aturCookieRefresh(res, token.refreshToken);
    // Redirect ke frontend dengan token di fragment (#) agar tidak masuk server log / browser history
    res.redirect(
      `${frontendUrl}/auth/callback#accessToken=${token.accessToken}&refreshToken=${token.refreshToken}`,
    );
  }

  // ── Refresh token ─────────────────────────────────────────────────────────────
  @Public()
  @Post('perbarui-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Perbarui access token menggunakan refresh token (cookie httpOnly atau body)' })
  async perbaruiToken(
    @Body() dto: DtoRefreshToken,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Ambil refresh token dari body, fallback ke cookie httpOnly
    const refreshToken = dto.refreshToken ?? req.cookies?.['refresh_token'];
    if (!refreshToken) {
      throw new BadRequestException('Refresh token tidak ditemukan');
    }
    const token = await this.authService.refreshToken(refreshToken);
    // Rotasi cookie dengan refresh token baru
    this.aturCookieRefresh(res, token.refresh_token);
    return { pesan: 'Token berhasil diperbarui', data: token };
  }

  // ── Keluar ────────────────────────────────────────────────────────────────────
  @Post('keluar')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Logout dan cabut semua refresh token' })
  async keluar(
    @CurrentUser() pengguna: PenggunaAktif,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.keluar(pengguna.id);
    // Hapus cookie refresh token saat logout
    this.hapusCookieRefresh(res);
    return { pesan: 'Berhasil keluar', data: null };
  }

  // ── Lupa kata sandi ───────────────────────────────────────────────────────────
  @Public()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('lupa-kata-sandi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kirim email reset kata sandi' })
  async lupaKataSandi(@Body() dto: DtoLupaKataSandi) {
    await this.authService.lupaKataSandi(dto.email);
    return {
      pesan: 'Jika email terdaftar, link reset kata sandi telah dikirim.',
      data: null,
    };
  }

  // ── Reset kata sandi ──────────────────────────────────────────────────────────
  @Public()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('reset-kata-sandi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset kata sandi dengan token' })
  async resetKataSandi(
    @Body() dto: DtoResetKataSandi,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.resetKataSandi(dto);
    // Semua refresh token dicabut oleh service — hapus cookie juga
    this.hapusCookieRefresh(res);
    return { pesan: 'Kata sandi berhasil diubah', data: null };
  }

  // ── Helper cookie refresh token (httpOnly) ────────────────────────────────
  private aturCookieRefresh(res: Response, refreshToken: string): void {
    const secure = this.cfg.get<string>('NODE_ENV', 'development') === 'production';
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/v1/auth', // hanya dikirim ke endpoint auth
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari — selaras JWT_REFRESH_EXPIRES_IN
    });
  }

  private hapusCookieRefresh(res: Response): void {
    res.clearCookie('refresh_token', { path: '/v1/auth' });
  }
}
