import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IncidentEntity {
  @ApiProperty({ example: 'inc_001' })
  id: string;

  @ApiProperty({ example: 'flood' })
  type: string;

  @ApiProperty({ example: 'Jl. Merdeka No.45, Jakarta Pusat' })
  location: string;

  @ApiProperty({ example: 'Ani S.' })
  reporter: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ example: 'PENDING' })
  status: string;

  @ApiProperty({ example: 'CITIZEN' })
  source: string;

  @ApiProperty({ example: 'MEDIUM' })
  severity: string;

  @ApiPropertyOptional()
  institutionId?: string;

  @ApiPropertyOptional()
  assignedToId?: string;

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z' })
  createdAt: string;
}
