import { SetMetadata } from '@nestjs/common';

/** Tandai endpoint sebagai publik — melewati JwtAuthGuard global */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
