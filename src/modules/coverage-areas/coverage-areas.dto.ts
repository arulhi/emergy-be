import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateCoverageAreaDto {
  @ApiProperty({ example: 'Jakarta Pusat Coverage' })
  @IsString()
  name: string;

  @ApiProperty({ example: [{ label: 'DKI Jakarta > Jakarta Pusat', provinceId: '31', provinceName: 'DKI Jakarta', cityId: '3171', cityName: 'Jakarta Pusat' }] })
  coverage: object[];

  @ApiPropertyOptional({ enum: ['active', 'inactive'] })
  @IsOptional()
  status?: string;
}

export class UpdateCoverageAreaDto {
  @ApiPropertyOptional()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  coverage?: object[];

  @ApiPropertyOptional({ enum: ['active', 'inactive'] })
  @IsOptional()
  status?: string;
}
