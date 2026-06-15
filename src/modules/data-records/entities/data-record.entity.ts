import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DataRecordEntity {
  @ApiProperty({ example: 'dr_001' })
  id: string;

  @ApiProperty({ example: 'Monthly Report' })
  title: string;

  @ApiProperty({ example: 'report' })
  type: string;

  @ApiPropertyOptional()
  content?: any;

  @ApiProperty({ example: 'active' })
  status: string;

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z' })
  createdAt: string;
}
