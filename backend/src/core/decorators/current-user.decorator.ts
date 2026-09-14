import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/** Tipe pengguna yang disimpan di request setelah autentikasi JWT */
export interface PenggunaAktif {
  id: string;
  email: string;
  peran: string;
}

/** Ambil pengguna yang sedang login dari request */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): PenggunaAktif => {
    const request = ctx.switchToHttp().getRequest<Request & { user: PenggunaAktif }>();
    return request.user;
  },
);
