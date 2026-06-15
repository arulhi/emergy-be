import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmergencyContactEntity {
  @ApiProperty({ example: 'ec_001' })
  id: string;

  @ApiProperty({ example: 'Polres Jakarta Pusat' })
  name: string;

  @ApiProperty({ example: 'police' })
  type: string;

  @ApiProperty({ example: '021-12345678' })
  phone: string;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Jakarta Pusat' })
  city?: string;
}
