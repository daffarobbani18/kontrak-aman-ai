import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DtoPerbaruiProfil {
  @ApiPropertyOptional({ example: 'Budi Santoso' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nama?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.png' })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'desainer' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  profesi?: string;
}

export class DtoPreferensiNotifikasi {
  @ApiPropertyOptional({ description: 'Notifikasi email saat audit selesai' })
  @IsOptional()
  @IsBoolean()
  notifEmailAudit?: boolean;

  @ApiPropertyOptional({ description: 'Notifikasi email pengingat tindak lanjut' })
  @IsOptional()
  @IsBoolean()
  notifEmailPengingat?: boolean;
}

export class DtoHapusAkun {
  @ApiProperty({ example: 'KataSandi@ku123', description: 'Konfirmasi kata sandi sebelum menghapus akun' })
  @IsString()
  @IsNotEmpty()
  kataSandi!: string;
}
