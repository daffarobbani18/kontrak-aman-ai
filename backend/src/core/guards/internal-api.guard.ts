import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * Guard untuk endpoint internal yang hanya boleh dipanggil backend-ai.
 * Validasi header X-Internal-Api-Key terhadap env INTERNAL_API_KEY.
 * Gunakan bersama @Public() agar JwtAuthGuard tidak menghalangi.
 */
@Injectable()
export class InternalApiGuard implements CanActivate {
  constructor(private readonly cfg: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-internal-api-key'] as string | undefined;
    const kunciValid = this.cfg.getOrThrow<string>('INTERNAL_API_KEY');

    if (!apiKey || apiKey !== kunciValid) {
      throw new UnauthorizedException('API key internal tidak valid');
    }

    return true;
  }
}
