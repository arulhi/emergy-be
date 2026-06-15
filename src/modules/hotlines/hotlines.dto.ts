import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateHotlineDto {
  @ApiProperty({ example: 'Emergency Call Center' })
  @IsString()
  name: string;

  @ApiProperty({ example: '112' })
  @IsString()
  number: string;

  @ApiPropertyOptional({ enum: ['POLICE', 'HOSPITAL', 'FIRE', 'SAR', 'PLN', 'BNPB', 'BPBD', 'EMERGENCY', 'FLOOD', 'MEDICAL', 'INFORMATION', 'OTHER'] })
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ example: 'Emergency' })
  @IsOptional()
  serviceType?: string;

  @ApiPropertyOptional({ example: '24/7' })
  @IsOptional()
  operatingHours?: string;
}

export class UpdateHotlineDto {
  @ApiPropertyOptional()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  serviceType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  operatingHours?: string;

  @ApiPropertyOptional()
  @IsOptional()
  status?: string;
}
