import { ApiProperty } from '@nestjs/swagger';

export class CoverageAreaEntity {
  @ApiProperty({ example: 'ca_001' })
  id: string;

  @ApiProperty({ example: 'Jakarta Pusat Coverage' })
  name: string;

  @ApiProperty()
  coverage: any[];

  @ApiProperty({ example: 'active' })
  status: string;

  @ApiProperty({ example: 'inst_001' })
  institutionId: string;

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z' })
  createdAt: string;
}
