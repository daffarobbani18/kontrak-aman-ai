import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
    rawBody: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const env = configService.get<string>('NODE_ENV', 'development');

  // Keamanan HTTP headers
  app.use(helmet());

  // Parser cookie — untuk refresh token httpOnly dari browser
  app.use(cookieParser());

  // CORS — dukung beberapa origin dipisah koma via CORS_ORIGINS
  const daftarOrigin = configService
    .get<string>('CORS_ORIGINS', 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: daftarOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Internal-Api-Key'],
  });

  // Versioning URI /v1
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global pipes — validasi & transformasi DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filters & interceptors (sebelum modul features terdaftar)
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger (hanya di non-production)
  if (env !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('KontrakAman AI — API')
      .setDescription(
        'Dokumentasi API platform audit kontrak freelance berbasis AI',
      )
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'JWT',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(port);
  console.log(`🚀 Server berjalan di http://localhost:${port}/v1`);
  if (env !== 'production') {
    console.log(
      `📄 Swagger tersedia di http://localhost:${port}/api/docs`,
    );
  }
}

bootstrap().catch((err: unknown) => {
  console.error('Gagal menjalankan server:', err);
  process.exit(1);
});
