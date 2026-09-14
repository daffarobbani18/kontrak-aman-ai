import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../shared/prisma/prisma.module';
import { EmailService } from '../../shared/email/email.module';
import { AuditLogService } from '../../shared/audit-log/audit-log.module';
import { DtoDaftar, DtoMasuk, DtoResetKataSandi } from './dto/auth.dto';
import { GoogleProfile } from './strategies/google.strategy';
import { JwtPayload } from './strategies/jwt.strategy';

const BCRYPT_ROUNDS = 12;
const DURASI_EMAIL_TOKEN_JAM = 24;
const DURASI_RESET_TOKEN_JAM = 1;

export interface HasilToken {
  accessToken: string;
  refreshToken: string;
}

export interface HasilDaftar {
  id: string;
  email: string;
  nama: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly cfg: ConfigService,
    private readonly email: EmailService,
    private readonly auditLog: AuditLogService,
  ) {}

  // ── Daftar ──────────────────────────────────────────────────────────────────
  async daftar(dto: DtoDaftar): Promise<HasilDaftar> {
    const sudahAda = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });
    if (sudahAda) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const hashKataSandi = await bcrypt.hash(dto.kataSandi, BCRYPT_ROUNDS);
    const tokenVerifikasi = crypto.randomBytes(32).toString('hex');
    const kedaluwarsa = new Date(
      Date.now() + DURASI_EMAIL_TOKEN_JAM * 60 * 60 * 1000,
    );

    const pengguna = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          name: dto.nama,
          password_hash: hashKataSandi,
          role: 'USER',
          email_verified: false,
        },
      });

      await tx.emailToken.create({
        data: {
          user_id: user.id,
          token_hash: crypto
            .createHash('sha256')
            .update(tokenVerifikasi)
            .digest('hex'),
          type: 'EMAIL_VERIFICATION',
          expires_at: kedaluwarsa,
        },
      });

      return user;
    });

    // Kirim email verifikasi
    const frontendUrl = this.cfg.get<string>('FRONTEND_URL', 'http://localhost:3001');
    const tautanVerifikasi = `${frontendUrl}/verifikasi-email?token=${tokenVerifikasi}`;
    await this.email.kirim({
      ke: pengguna.email,
      subjek: 'Verifikasi Email — KontrakAman AI',
      html: this.email.htmlVerifikasiEmail({
        nama: pengguna.name,
        tautanVerifikasi,
      }),
    });

    // Catat registrasi di audit log
    await this.auditLog.catat({
      penggunaId: pengguna.id,
      aksi: 'daftar',
      entitas: 'pengguna',
      entitasId: pengguna.id,
    }).catch((err: unknown) =>
      console.warn(`Gagal catat audit log daftar: ${String(err)}`),
    );

    return { id: pengguna.id, email: pengguna.email, nama: pengguna.name };
  }

  // ── Verifikasi email ─────────────────────────────────────────────────────────
  async verifikasiEmail(token: string): Promise<void> {
    const hashToken = crypto.createHash('sha256').update(token).digest('hex');

    const emailToken = await this.prisma.emailToken.findFirst({
      where: {
        token_hash: hashToken,
        type: 'EMAIL_VERIFICATION',
        used_at: null,
        expires_at: { gt: new Date() },
      },
    });

    if (!emailToken) {
      throw new BadRequestException('Token verifikasi tidak valid atau sudah kedaluwarsa');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: emailToken.user_id },
        data: { email_verified: true },
      }),
      this.prisma.emailToken.update({
        where: { id: emailToken.id },
        data: { used_at: new Date() },
      }),
    ]);
  }

  // ── Masuk (login) ────────────────────────────────────────────────────────────
  async masuk(dto: DtoMasuk): Promise<HasilToken> {
    const pengguna = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        role: true,
        password_hash: true,
        email_verified: true,
        deleted_at: true,
      },
    });

    if (!pengguna || pengguna.deleted_at !== null) {
      throw new UnauthorizedException('Email atau kata sandi tidak valid');
    }

    if (!pengguna.password_hash) {
      throw new UnauthorizedException(
        'Akun ini menggunakan login Google. Silakan masuk dengan Google.',
      );
    }

    const kataSandiValid = await bcrypt.compare(
      dto.kataSandi,
      pengguna.password_hash,
    );
    if (!kataSandiValid) {
      throw new UnauthorizedException('Email atau kata sandi tidak valid');
    }

    if (!pengguna.email_verified) {
      throw new UnauthorizedException(
        'Email belum diverifikasi. Periksa kotak masuk Anda.',
      );
    }

    const token = await this.buatToken(pengguna.id, pengguna.email, pengguna.role);

    // Catat login di audit log
    await this.auditLog.catat({
      penggunaId: pengguna.id,
      aksi: 'login',
      entitas: 'pengguna',
      entitasId: pengguna.id,
    }).catch((err: unknown) =>
      console.warn(`Gagal catat audit log login: ${String(err)}`),
    );

    return token;
  }

  // ── Login via Google ─────────────────────────────────────────────────────────
  async masukDenganGoogle(profile: GoogleProfile): Promise<HasilToken> {
    // Cek apakah akun OAuth sudah ada
    const oauthAda = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_provider_account_id: {
          provider: 'GOOGLE',
          provider_account_id: profile.googleId,
        },
      },
      include: { user: true },
    });

    if (oauthAda) {
      const { user } = oauthAda;
      if (user.deleted_at !== null) {
        throw new UnauthorizedException('Akun telah dihapus');
      }
      return this.buatToken(user.id, user.email, user.role);
    }

    // Cek apakah email sudah terdaftar (akun lokal)
    let pengguna = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (!pengguna) {
      // Buat akun baru
      pengguna = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.nama,
          avatar_url: profile.avatarUrl ?? null,
          role: 'USER',
          email_verified: true, // Google sudah verifikasi
        },
      });
    }

    // Hubungkan OAuth account
    await this.prisma.oAuthAccount.create({
      data: {
        user_id: pengguna.id,
        provider: 'GOOGLE',
        provider_account_id: profile.googleId,
      },
    });

    return this.buatToken(pengguna.id, pengguna.email, pengguna.role);
  }

  // ── Refresh token ────────────────────────────────────────────────────────────
  async refreshToken(rawToken: string): Promise<HasilToken> {
    const hashToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const tokenRecord = await this.prisma.refreshToken.findFirst({
      where: {
        token_hash: hashToken,
        revoked_at: null,
        expires_at: { gt: new Date() },
      },
      include: {
        user: {
          select: { id: true, email: true, role: true, deleted_at: true },
        },
      },
    });

    if (!tokenRecord || tokenRecord.user.deleted_at !== null) {
      throw new UnauthorizedException('Refresh token tidak valid atau sudah kedaluwarsa');
    }

    // Rotasi: cabut token lama, buat yang baru
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revoked_at: new Date() },
    });

    return this.buatToken(
      tokenRecord.user.id,
      tokenRecord.user.email,
      tokenRecord.user.role,
    );
  }

  // ── Keluar ───────────────────────────────────────────────────────────────────
  async keluar(penggunaId: string): Promise<void> {
    // Cabut semua refresh token aktif pengguna
    await this.prisma.refreshToken.updateMany({
      where: { user_id: penggunaId, revoked_at: null },
      data: { revoked_at: new Date() },
    });
  }

  // ── Lupa kata sandi ──────────────────────────────────────────────────────────
  async lupaKataSandi(email: string): Promise<void> {
    const pengguna = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, deleted_at: true },
    });

    // Selalu respons sukses untuk mencegah user enumeration
    if (!pengguna || pengguna.deleted_at !== null) return;

    const tokenReset = crypto.randomBytes(32).toString('hex');
    const kedaluwarsa = new Date(
      Date.now() + DURASI_RESET_TOKEN_JAM * 60 * 60 * 1000,
    );

    await this.prisma.emailToken.create({
      data: {
        user_id: pengguna.id,
        token_hash: crypto
          .createHash('sha256')
          .update(tokenReset)
          .digest('hex'),
        type: 'PASSWORD_RESET',
        expires_at: kedaluwarsa,
      },
    });

    const frontendUrl = this.cfg.get<string>('FRONTEND_URL', 'http://localhost:3001');
    const tautanReset = `${frontendUrl}/reset-kata-sandi?token=${tokenReset}`;
    await this.email.kirim({
      ke: email,
      subjek: 'Reset Kata Sandi — KontrakAman AI',
      html: this.email.htmlResetKataSandi({ nama: pengguna.name, tautanReset }),
    });
  }

  // ── Reset kata sandi ─────────────────────────────────────────────────────────
  async resetKataSandi(dto: DtoResetKataSandi): Promise<void> {
    const hashToken = crypto
      .createHash('sha256')
      .update(dto.token)
      .digest('hex');

    const tokenRecord = await this.prisma.emailToken.findFirst({
      where: {
        token_hash: hashToken,
        type: 'PASSWORD_RESET',
        used_at: null,
        expires_at: { gt: new Date() },
      },
    });

    if (!tokenRecord) {
      throw new BadRequestException('Token reset tidak valid atau sudah kedaluwarsa');
    }

    const hashKataSandi = await bcrypt.hash(dto.kataSandiBaru, BCRYPT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: tokenRecord.user_id },
        data: { password_hash: hashKataSandi },
      }),
      this.prisma.emailToken.update({
        where: { id: tokenRecord.id },
        data: { used_at: new Date() },
      }),
      // Cabut semua refresh token (paksa login ulang)
      this.prisma.refreshToken.updateMany({
        where: { user_id: tokenRecord.user_id, revoked_at: null },
        data: { revoked_at: new Date() },
      }),
    ]);
  }

  // ── Kirim ulang verifikasi email ────────────────────────────────────────────
  async kirimUlangVerifikasi(email: string): Promise<void> {
    const pengguna = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email_verified: true, deleted_at: true },
    });

    // Jangan bocorkan apakah email terdaftar atau tidak
    if (!pengguna || pengguna.deleted_at !== null) return;

    if (pengguna.email_verified) {
      throw new BadRequestException('Email sudah diverifikasi');
    }

    // Invalidasi semua token verifikasi lama
    await this.prisma.emailToken.updateMany({
      where: {
        user_id: pengguna.id,
        type: 'EMAIL_VERIFICATION',
        used_at: null,
      },
      data: { used_at: new Date() },
    });

    // Buat token baru
    const tokenVerifikasi = crypto.randomBytes(32).toString('hex');
    const kedaluwarsa = new Date(
      Date.now() + DURASI_EMAIL_TOKEN_JAM * 60 * 60 * 1000,
    );

    await this.prisma.emailToken.create({
      data: {
        user_id: pengguna.id,
        token_hash: crypto
          .createHash('sha256')
          .update(tokenVerifikasi)
          .digest('hex'),
        type: 'EMAIL_VERIFICATION',
        expires_at: kedaluwarsa,
      },
    });

    const frontendUrl = this.cfg.get<string>('FRONTEND_URL', 'http://localhost:3001');
    const tautanVerifikasi = `${frontendUrl}/verifikasi-email?token=${tokenVerifikasi}`;
    await this.email.kirim({
      ke: email,
      subjek: 'Verifikasi Email — KontrakAman AI',
      html: this.email.htmlVerifikasiEmail({
        nama: pengguna.name,
        tautanVerifikasi,
      }),
    });
  }

  // ── Cron: bersihkan token email kedaluwarsa ────────────────────────────────
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async bersihkanTokenKedaluwarsa(): Promise<void> {
    const sekarang = new Date();
    const hasil = await this.prisma.emailToken.deleteMany({
      where: { expires_at: { lt: sekarang } },
    });
    this.logger.log(
      `Pembersihan token kedaluwarsa: ${hasil.count} token dihapus.`,
    );
  }

  // ── Helper: buat access + refresh token ─────────────────────────────────────
  private async buatToken(
    userId: string,
    email: string,
    peran: string,
  ): Promise<HasilToken> {
    const payload: JwtPayload = { sub: userId, email, peran };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.cfg.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.cfg.get<string>('JWT_ACCESS_EXPIRES_IN', '15m') as string,
    } as Parameters<typeof this.jwtService.sign>[1]);

    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const hashRefresh = crypto
      .createHash('sha256')
      .update(rawRefreshToken)
      .digest('hex');

    const durasiRefreshHari = 7;
    const kedaluwarsa = new Date(
      Date.now() + durasiRefreshHari * 24 * 60 * 60 * 1000,
    );

    await this.prisma.refreshToken.create({
      data: {
        user_id: userId,
        token_hash: hashRefresh,
        expires_at: kedaluwarsa,
      },
    });

    return { accessToken, refreshToken: rawRefreshToken };
  }
}
