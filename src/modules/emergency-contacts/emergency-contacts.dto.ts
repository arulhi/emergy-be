import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateEmergencyContactDto {
  @ApiProperty({ example: 'Polres Jakarta Pusat' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ['police', 'hospital', 'fire', 'sar', 'pln', 'bnpb', 'bpbd'] })
  @IsEnum(['police', 'hospital', 'fire', 'sar', 'pln', 'bnpb', 'bpbd'])
  type: string;

  @ApiProperty({ example: '021-12345678' })
  @IsString()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Jakarta Pusat' })
  @IsOptional()
  city?: string;
}

export class UpdateEmergencyContactDto {
  @ApiPropertyOptional()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  city?: string;
}
