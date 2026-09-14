import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../shared/prisma/prisma.module';
import { PenggunaAktif } from '../../../core/decorators/current-user.decorator';

export interface JwtPayload {
  sub: string;
  email: string;
  peran: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    cfg: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: cfg.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<PenggunaAktif> {
    const pengguna = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, deleted_at: true, is_suspended: true },
    });

    if (!pengguna || pengguna.deleted_at !== null) {
      throw new UnauthorizedException('Sesi tidak valid atau akun telah dihapus');
    }

    if (pengguna.is_suspended) {
      throw new UnauthorizedException('Akun Anda telah disuspend. Hubungi administrator untuk informasi lebih lanjut.');
    }

    return {
      id: pengguna.id,
      email: pengguna.email,
      peran: pengguna.role,
    };
  }
}
