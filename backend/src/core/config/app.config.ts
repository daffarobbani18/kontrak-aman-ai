import { registerAs } from '@nestjs/config';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl, Min, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

// ── Enum environment ─────────────────────────────────────────────────────────
export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

// ── Class validasi (digunakan juga sebagai tipe AppConfig) ───────────────────
export class AppConfig {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @IsInt()
  @Min(1)
  PORT: number = 3000;

  // Database
  @IsString()
  DATABASE_URL!: string;

  // Redis
  @IsString()
  REDIS_HOST: string = '127.0.0.1';

  @IsInt()
  @Min(1)
  REDIS_PORT: number = 6379;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  // JWT
  @IsString()
  JWT_ACCESS_SECRET!: string;

  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  JWT_ACCESS_EXPIRES_IN: string = '15m';

  @IsString()
  JWT_REFRESH_EXPIRES_IN: string = '7d';

  // OAuth Google
  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_ID?: string;

  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_SECRET?: string;

  @IsString()
  @IsOptional()
  GOOGLE_CALLBACK_URL?: string;

  // Supabase S3
  @IsString()
  SUPABASE_S3_ENDPOINT!: string;

  @IsString()
  SUPABASE_S3_BUCKET!: string;

  @IsString()
  SUPABASE_S3_ACCESS_KEY!: string;

  @IsString()
  SUPABASE_S3_SECRET_KEY!: string;

  @IsString()
  SUPABASE_S3_REGION: string = 'ap-southeast-1';

  // Email SMTP
  @IsString()
  SMTP_HOST!: string;

  @IsInt()
  @Min(1)
  SMTP_PORT: number = 587;

  @IsString()
  SMTP_USER!: string;

  @IsString()
  SMTP_PASS!: string;

  @IsString()
  SMTP_FROM: string = 'KontrakAman AI <noreply@kontrakaman.id>';

  // Groq
  @IsString()
  GROQ_API_KEY!: string;

  @IsString()
  GROQ_BASE_URL: string = 'https://api.groq.com/openai/v1';

  // Mayar webhook
  @IsString()
  MAYAR_WEBHOOK_SECRET!: string;

  // Internal API key (backend-api ↔ backend-ai)
  @IsString()
  INTERNAL_API_KEY!: string;

  // CORS
  @IsString()
  @IsOptional()
  CORS_ORIGIN?: string;

  // Throttler
  @IsInt()
  @Min(1)
  @IsOptional()
  THROTTLE_TTL?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  THROTTLE_LIMIT?: number;

  // URL frontend (untuk link email)
  @IsString()
  FRONTEND_URL: string = 'http://localhost:3001';
}

// ── Factory config NestJS ─────────────────────────────────────────────────────
export const appConfig = registerAs('app', (): AppConfig => {
  const config = plainToInstance(AppConfig, process.env, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(config, { skipMissingProperties: false });

  if (errors.length > 0) {
    const pesan = errors
      .map((e) => Object.values(e.constraints ?? {}).join(', '))
      .join('; ');
    throw new Error(`Validasi konfigurasi gagal: ${pesan}`);
  }

  return config;
});
