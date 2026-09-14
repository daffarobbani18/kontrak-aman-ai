import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// ── Struktur respons sukses standar ──────────────────────────────────────────
export interface ResponsAPI<T> {
  berhasil: true;
  pesan: string;
  data: T;
  paginasi?: {
    halaman: number;
    perHalaman: number;
    totalData: number;
    totalHalaman: number;
  };
}

// ── Tipe data yang bisa dikembalikan controller ───────────────────────────────
export interface DataDenganPesan<T> {
  pesan?: string;
  data: T;
  paginasi?: ResponsAPI<T>['paginasi'];
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T | DataDenganPesan<T>, ResponsAPI<T>>
{
  intercept(
    _ctx: ExecutionContext,
    next: CallHandler<T | DataDenganPesan<T>>,
  ): Observable<ResponsAPI<T>> {
    return next.handle().pipe(
      map((value) => {
        // Controller sudah membungkus dalam { pesan, data, paginasi? }
        if (value !== null && typeof value === 'object' && 'data' in value) {
          const wrapped = value as DataDenganPesan<T>;
          return {
            berhasil: true as const,
            pesan: wrapped.pesan ?? 'Berhasil',
            data: wrapped.data,
            ...(wrapped.paginasi ? { paginasi: wrapped.paginasi } : {}),
          };
        }

        // Controller mengembalikan data langsung (tanpa pembungkus)
        return {
          berhasil: true as const,
          pesan: 'Berhasil',
          data: value as T,
        };
      }),
    );
  }
}
