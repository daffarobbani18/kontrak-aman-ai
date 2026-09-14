import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DtoDaftarPenggunaAdmin {
  @ApiPropertyOptional({ description: 'Kata kunci pencarian (nama atau email)' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  halaman?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  perHalaman?: number;
}

export class DtoDaftarAuditLog {
  @ApiPropertyOptional({ description: 'Filter berdasarkan ID pengguna' })
  @IsOptional()
  @IsString()
  penggunaId?: string;

  @ApiPropertyOptional({ description: 'Filter berdasarkan nama aksi (misal: login, buat-audit)' })
  @IsOptional()
  @IsString()
  aksi?: string;

  @ApiPropertyOptional({ description: 'Tanggal mulai filter (ISO 8601)', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  dari?: string;

  @ApiPropertyOptional({ description: 'Tanggal akhir filter (ISO 8601)', example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  sampai?: string;

  @ApiPropertyOptional({ description: 'Cursor pagination — ID audit log terakhir' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Jumlah data per halaman (maks 100)', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  perHalaman?: number;
}

export class DtoStatistikAdmin {
  @ApiPropertyOptional({
    description: 'Tanggal mulai filter (ISO 8601, misal 2024-01-01)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  dari?: string;

  @ApiPropertyOptional({
    description: 'Tanggal akhir filter (ISO 8601, misal 2024-12-31)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  sampai?: string;
}

export class DtoDaftarTransaksiAdmin {
  @ApiPropertyOptional({ description: 'Nomor halaman', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  halaman?: number;

  @ApiPropertyOptional({ description: 'Jumlah data per halaman (maks 100)', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  perHalaman?: number;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan status transaksi (PENDING, PAID, FAILED, EXPIRED, REFUNDED)',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter berdasarkan ID pengguna' })
  @IsOptional()
  @IsString()
  penggunaId?: string;
}

export class DtoPerbaruiKonfigurasi {
  @ApiProperty({ description: 'Nilai konfigurasi baru' })
  @IsString()
  @IsNotEmpty()
  nilai!: string;
}

export class DtoPerbaruiKuotaAdmin {
  @ApiPropertyOptional({ description: 'Override kuota audit (null = hapus override)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  batasAudit?: number;

  @ApiPropertyOptional({ description: 'Override kuota negosiasi (null = hapus override)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  batasNegosiasi?: number;
}

export class DtoBuatPaketAdmin {
  @ApiProperty({ description: 'Nama paket' })
  @IsNotEmpty()
  @IsString()
  nama!: string;

  @ApiPropertyOptional({ description: 'Deskripsi paket' })
  @IsOptional()
  @IsString()
  deskripsi?: string;

  @ApiProperty({ description: 'Tier paket (FREE, BASIC, PRO, ENTERPRISE)' })
  @IsNotEmpty()
  @IsString()
  tier!: string;

  @ApiProperty({ description: 'Harga dalam IDR (satuan terkecil, misal 50000 = Rp50.000)' })
  @IsInt()
  @Min(0)
  harga!: number;

  @ApiPropertyOptional({ default: 'IDR' })
  @IsOptional()
  @IsString()
  mataUang?: string;

  @ApiPropertyOptional({ description: 'Siklus tagihan (MONTHLY, YEARLY, LIFETIME)' })
  @IsOptional()
  @IsString()
  siklusTagihan?: string;

  @ApiProperty({ description: 'Batas jumlah audit per periode (-1 = tidak terbatas)' })
  @IsInt()
  @Min(-1)
  batasAudit!: number;

  @ApiProperty({ description: 'Batas jumlah negosiasi per periode (-1 = tidak terbatas)' })
  @IsInt()
  @Min(-1)
  batasNegosiasi!: number;

  @ApiPropertyOptional({ description: 'ID produk Mayar untuk integrasi pembayaran' })
  @IsOptional()
  @IsString()
  mayarProductId?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  aktif?: boolean;
}

export class DtoPerbaruiPaketAdmin {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nama?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deskripsi?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tier?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  harga?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mataUang?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  siklusTagihan?: string;

  @ApiPropertyOptional({ description: 'Batas audit (-1 = tidak terbatas)' })
  @IsOptional()
  @IsInt()
  @Min(-1)
  batasAudit?: number;

  @ApiPropertyOptional({ description: 'Batas negosiasi (-1 = tidak terbatas)' })
  @IsOptional()
  @IsInt()
  @Min(-1)
  batasNegosiasi?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mayarProductId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  aktif?: boolean;
}
