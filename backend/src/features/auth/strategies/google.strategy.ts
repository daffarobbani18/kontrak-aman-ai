import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

export interface GoogleProfile {
  googleId: string;
  email: string;
  nama: string;
  avatarUrl?: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(cfg: ConfigService) {
    super({
      clientID: cfg.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: cfg.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: cfg.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const email = profile.emails?.[0]?.value;
    const nama = profile.displayName ?? profile.name?.givenName ?? 'Pengguna';
    const avatarUrl = profile.photos?.[0]?.value;

    if (!email) {
      done(new Error('Email tidak ditemukan dari akun Google'), undefined);
      return;
    }

    const googleProfile: GoogleProfile = {
      googleId: profile.id,
      email,
      nama,
      avatarUrl,
    };

    done(null, googleProfile);
  }
}
