import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DtoBuatNegosiasi {
  @ApiProperty({ description: 'ID audit yang sudah selesai' })
  @IsString()
  auditId!: string;

  @ApiPropertyOptional({ description: 'Instruksi tambahan untuk negosiasi' })
  @IsOptional()
  @IsString()
  instruksiTambahan?: string;
}

export class DtoDaftarNegosiasi {
  @ApiPropertyOptional({ description: 'Cursor — ID negosiasi terakhir' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  batas?: number;
}

export class DtoEditDrafNegosiasi {
  @ApiProperty({ description: 'Konten draf negosiasi yang sudah diedit' })
  @IsString()
  @IsNotEmpty()
  draf!: string;
}

export class DtoHasilNegosiasiInternal {
  @IsString()
  negosiasiId!: string;

  @IsString()
  status!: string;

  @IsOptional()
  drafDokumen?: string;

  @IsOptional()
  ringkasan?: string;

  @IsOptional()
  poinPerubahan?: Array<{
    klausulAsli: string;
    klausulBaru: string;
    alasan: string;
  }>;

  @IsOptional()
  pesanError?: string;
}
