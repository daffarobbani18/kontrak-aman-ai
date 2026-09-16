import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DtoDaftar {
  @ApiProperty({ example: 'Budi Santoso' })
  @IsString()
  @MaxLength(100)
  nama!: string;

  @ApiProperty({ example: 'budi@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'KataSandi@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  kataSandi!: string;
}

export class DtoMasuk {
  @ApiProperty({ example: 'budi@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'KataSandi@123' })
  @IsString()
  kataSandi!: string;
}

export class DtoRefreshToken {
  /** Opsional — kalau kosong, backend pakai cookie refresh_token (httpOnly) */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class DtoLupaKataSandi {
  @ApiProperty({ example: 'budi@example.com' })
  @IsEmail()
  email!: string;
}

export class DtoResetKataSandi {
  @ApiProperty()
  @IsString()
  token!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  kataSandiBaru!: string;
}

export class DtoKirimUlangVerifikasi {
  @ApiProperty({ example: 'budi@example.com' })
  @IsEmail()
  email!: string;
}

export class DtoUbahKataSandi {
  @ApiProperty()
  @IsString()
  kataSandiLama!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  kataSandiBaru!: string;
}
