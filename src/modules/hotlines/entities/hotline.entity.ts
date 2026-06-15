import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HotlineEntity {
  @ApiProperty({ example: 'hot_001' })
  id: string;

  @ApiProperty({ example: 'Emergency Call Center' })
  name: string;

  @ApiProperty({ example: '112' })
  number: string;

  @ApiPropertyOptional()
  type?: string;

  @ApiPropertyOptional()
  serviceType?: string;

  @ApiPropertyOptional({ example: '24/7' })
  operatingHours?: string;

  @ApiProperty({ example: 'active' })
  status: string;
}
