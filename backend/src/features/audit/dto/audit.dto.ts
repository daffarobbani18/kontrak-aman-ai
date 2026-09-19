import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DtoBuatAudit {
  @ApiProperty({ description: 'ID dokumen kontrak yang sudah diupload' })
  @IsString()
  dokumenId!: string;
}

export class DtoDaftarAudit {
  @ApiPropertyOptional({ description: 'Cursor — ID audit terakhir' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ default: 20, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  batas?: number;
}

export class DtoHasilAuditInternal {
  @IsString()
  auditId!: string;

  @IsString()
  status!: string;

  @IsOptional()
  hasilJson?: Record<string, unknown>;

  @IsOptional()
  ringkasan?: string;

  @IsOptional()
  skorRisiko?: number;

  @IsOptional()
  tingkatRisikoKeseluruhan?: string;

  @IsOptional()
  klausul?: Array<{
    judul: string;
    isi: string;
    tingkatRisiko: string;
    penjelasan: string;
    rekomendasi?: string;
  }>;

  @IsOptional()
  pesanError?: string;
}
