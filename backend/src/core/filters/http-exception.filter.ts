import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

// ── Struktur respons error standar ───────────────────────────────────────────
interface ResponsKesalahan {
  berhasil: false;
  pesan: string;
  kesalahan: {
    kode: string;
    detail?: unknown;
  };
  timestamp: string;
  path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusKode = HttpStatus.INTERNAL_SERVER_ERROR;
    let pesan = 'Terjadi kesalahan internal pada server';
    let kodeKesalahan = 'KESALAHAN_SERVER';
    let detail: unknown = undefined;

    if (exception instanceof HttpException) {
      statusKode = exception.getStatus();
      const responseBody = exception.getResponse();

      if (typeof responseBody === 'string') {
        pesan = responseBody;
      } else if (typeof responseBody === 'object' && responseBody !== null) {
        const body = responseBody as Record<string, unknown>;
        pesan =
          typeof body['message'] === 'string'
            ? body['message']
            : Array.isArray(body['message'])
              ? (body['message'] as string[]).join('; ')
              : pesan;
        detail = Array.isArray(body['message']) ? body['message'] : undefined;
      }

      kodeKesalahan = this.petakanKodeKesalahan(statusKode);
    } else if (exception instanceof Error) {
      this.logger.error(
        `Kesalahan tidak tertangani: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error('Kesalahan tidak dikenal', String(exception));
    }

    const respons: ResponsKesalahan = {
      berhasil: false,
      pesan,
      kesalahan: {
        kode: kodeKesalahan,
        ...(detail !== undefined ? { detail } : {}),
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(statusKode).json(respons);
  }

  private petakanKodeKesalahan(status: number): string {
    const peta: Record<number, string> = {
      400: 'PERMINTAAN_TIDAK_VALID',
      401: 'TIDAK_TERAUTENTIKASI',
      403: 'TIDAK_DIIZINKAN',
      404: 'TIDAK_DITEMUKAN',
      409: 'KONFLIK_DATA',
      422: 'ENTITAS_TIDAK_DAPAT_DIPROSES',
      429: 'TERLALU_BANYAK_PERMINTAAN',
      500: 'KESALAHAN_SERVER',
      503: 'LAYANAN_TIDAK_TERSEDIA',
    };
    return peta[status] ?? 'KESALAHAN_SERVER';
  }
}
