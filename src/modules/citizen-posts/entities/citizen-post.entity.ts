import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CitizenPostEntity {
  @ApiProperty({ example: 'cp_001' })
  id: string;

  @ApiProperty({ example: 'Banjir di Jl. Merdeka setinggi 1 meter' })
  caption: string;

  @ApiPropertyOptional()
  media?: any[];

  @ApiProperty({ example: 'flood' })
  category: string;

  @ApiPropertyOptional()
  location?: any;

  @ApiProperty({ example: 'normal' })
  urgency: string;

  @ApiProperty({ example: [] })
  upvotes: string[];

  @ApiProperty({ example: [] })
  urgentVotes: string[];

  @ApiProperty({ example: 'PUBLISHED' })
  status: string;

  @ApiPropertyOptional()
  assignedInstitution?: string;

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z' })
  createdAt: string;
}
