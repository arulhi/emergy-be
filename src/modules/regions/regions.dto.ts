import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class RegionQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  provinceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  cityId?: string;
}
