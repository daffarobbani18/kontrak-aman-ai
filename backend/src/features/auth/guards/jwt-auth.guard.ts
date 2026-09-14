import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../../core/decorators/public.decorator';
import { Observable } from 'rxjs';

/**
 * JwtAuthGuard — guard global yang memproteksi semua endpoint.
 * Endpoint yang ditandai @Public() akan melewati autentikasi.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    return super.canActivate(context);
  }

  handleRequest<T>(err: Error | null, user: T | false): T {
    if (err || !user) {
      throw new UnauthorizedException(
        err?.message ?? 'Token tidak valid atau sudah kedaluwarsa',
      );
    }
    return user;
  }
}
