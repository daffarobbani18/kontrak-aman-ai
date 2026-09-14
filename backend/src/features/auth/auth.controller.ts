import {
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

  // ── Masuk ────────────────────────────────────────────────────────────────────
  @Public()
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('masuk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login dengan email & kata sandi' })
  async masuk(@Body() dto: DtoMasuk) {
    const token = await this.authService.masuk(dto);
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
    const frontendUrl = this.cfg.get<string>('FRONTEND_URL', 'http://localhost:3001');
    // Redirect ke frontend dengan token di fragment (#) agar tidak masuk server log / browser history
    res.redirect(
      `${frontendUrl}/auth/callback#accessToken=${token.accessToken}&refreshToken=${token.refreshToken}`,
    );
  }

  // ── Refresh token ─────────────────────────────────────────────────────────────
  @Public()
  @Post('perbarui-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Perbarui access token menggunakan refresh token' })
  async perbaruiToken(@Body() dto: DtoRefreshToken) {
    const token = await this.authService.refreshToken(dto.refreshToken);
    return { pesan: 'Token berhasil diperbarui', data: token };
  }

  // ── Keluar ────────────────────────────────────────────────────────────────────
  @Post('keluar')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Logout dan cabut semua refresh token' })
  async keluar(@CurrentUser() pengguna: PenggunaAktif) {
    await this.authService.keluar(pengguna.id);
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
  async resetKataSandi(@Body() dto: DtoResetKataSandi) {
    await this.authService.resetKataSandi(dto);
    return { pesan: 'Kata sandi berhasil diubah', data: null };
  }
}
