import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'johndoe' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: ['SUPERADMIN', 'ADMIN', 'INSTITUTION_ADMIN', 'INSTITUTION_STAFF', 'CITIZEN'] })
  @IsEnum(['SUPERADMIN', 'ADMIN', 'INSTITUTION_ADMIN', 'INSTITUTION_STAFF', 'CITIZEN'])
  role: string;

  @ApiPropertyOptional()
  @IsOptional()
  name?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  name?: string;
}

export class UpdateUserStatusDto {
  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] })
  @IsEnum(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
  status: string;
}
