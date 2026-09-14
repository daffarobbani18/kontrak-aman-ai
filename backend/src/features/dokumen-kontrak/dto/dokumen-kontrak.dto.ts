import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DtoDaftarDokumen {
  @ApiPropertyOptional({ description: 'Cursor pagination — ID dokumen terakhir' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Jumlah data per halaman', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  batas?: number;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan tingkat risiko audit terakhir',
    enum: ['GREEN', 'YELLOW', 'RED'],
  })
  @IsOptional()
  @IsIn(['GREEN', 'YELLOW', 'RED'])
  risikoLevel?: string;
}
