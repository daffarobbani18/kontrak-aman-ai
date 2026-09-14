import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { WebhookService, PayloadWebhookMayar } from './webhook.service';
import { Public } from '../../core/decorators/public.decorator';

@ApiTags('Webhook')
@SkipThrottle() // Mayar dapat mengirim burst events — lewati rate limiting
@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  // POST /v1/webhook/mayar
  @Public()
  @Post('mayar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Terima webhook event dari Mayar payment gateway' })
  async webhookMayar(
    @Headers('x-mayar-signature') signature: string,
    @Body() payload: PayloadWebhookMayar,
    @Req() req: Request,
  ) {
    // rawBody tersedia via NestJS body parser middleware
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody ?? Buffer.from(JSON.stringify(payload));
    await this.webhookService.prosesWebhookMayar(signature ?? '', rawBody, payload);
    return { pesan: 'Webhook diterima', data: null };
  }
}
