import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { PenggunaAktif } from '../../../core/decorators/current-user.decorator';

/** Guard yang hanya mengizinkan pengguna dengan peran ADMIN */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: PenggunaAktif }>();

    if (request.user?.peran !== 'ADMIN') {
      throw new ForbiddenException('Akses hanya untuk administrator');
    }

    return true;
  }
}
