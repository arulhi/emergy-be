import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SosLogEntity {
  @ApiProperty({ example: 'sos_001' })
  id: string;

  @ApiPropertyOptional()
  location?: any;

  @ApiPropertyOptional()
  contacted?: string;

  @ApiPropertyOptional()
  profileId?: string;

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z' })
  createdAt: string;
}
