import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@emergy.my.id', description: 'Username or email' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterCitizenDto {
  @ApiProperty({ example: 'Ahmad Fauzi' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'ahmadfauzi' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'ahmad@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: '0812-3456-7890' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'DKI Jakarta' })
  @IsOptional()
  province?: string;

  @ApiPropertyOptional({ example: 'Jakarta Pusat' })
  @IsOptional()
  city?: string;
}

export class RegisterInstitutionDto {
  @ApiProperty({ example: 'BPBD Jakarta' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Government' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'admin@bpbd.jakarta.go.id' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: '021-12345678' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Jl. Merdeka No.1, Jakarta Pusat' })
  @IsOptional()
  address?: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  @IsString()
  refreshToken: string;
}
