import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InstitutionEntity {
  @ApiProperty({ example: 'inst_001' })
  id: string;

  @ApiProperty({ example: 'BPBD DKI Jakarta' })
  name: string;

  @ApiProperty({ example: 'Government' })
  type: string;

  @ApiProperty({ example: 'ACTIVE' })
  status: string;

  @ApiProperty({ example: 'SILVER' })
  trustLevel: string;

  @ApiProperty({ example: 10 })
  membersCount: number;

  @ApiProperty({ example: 50 })
  verifiedReports: number;

  @ApiPropertyOptional()
  contactEmail?: string;

  @ApiPropertyOptional()
  contactPhone?: string;

  @ApiPropertyOptional()
  address?: string;

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z' })
  createdAt: string;
}
