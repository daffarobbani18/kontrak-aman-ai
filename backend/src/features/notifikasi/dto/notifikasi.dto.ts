import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/** DTO query daftar notifikasi */
export class DtoDaftarNotifikasi {
  @ApiPropertyOptional({ description: 'Cursor pagination — ID notifikasi terakhir' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Jumlah data per halaman', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  batas?: number;
}
