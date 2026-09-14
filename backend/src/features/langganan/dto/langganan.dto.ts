import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DtoBuatSesiPembayaran {
  @ApiProperty({ description: 'ID paket langganan (plan)' })
  @IsString()
  planId!: string;
}

export class DtoDaftarTransaksi {
  @ApiPropertyOptional({ example: 1, description: 'Nomor halaman (mulai dari 1)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  halaman?: number;

  @ApiPropertyOptional({ example: 20, description: 'Jumlah data per halaman (maks 50)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  perHalaman?: number;
}
