import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateCitizenProfileDto {
  @ApiPropertyOptional({ example: 'Ahmad Fauzi' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Perkenalkan saya warga Jakarta...' })
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ example: '0812-3456-7890' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'DKI Jakarta' })
  @IsOptional()
  province?: string;

  @ApiPropertyOptional({ example: 'Jakarta Pusat' })
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Gambir' })
  @IsOptional()
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  avatar?: string;
}
