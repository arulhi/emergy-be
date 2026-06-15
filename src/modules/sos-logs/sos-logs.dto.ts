import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateSosLogDto {
  @ApiProperty({ example: { lat: -6.1865, lng: 106.8345, address: 'Jakarta Pusat' } })
  location: object;

  @ApiPropertyOptional({ example: '112' })
  @IsOptional()
  contacted?: string;
}
