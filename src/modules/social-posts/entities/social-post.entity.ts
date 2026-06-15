import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SocialPostEntity {
  @ApiProperty({ example: 'sp_001' })
  id: string;

  @ApiProperty({ example: 'BPBD DKI Jakarta' })
  author: string;

  @ApiProperty({ example: 'Peringatan dini: Hujan lebat...' })
  caption: string;

  @ApiPropertyOptional()
  media?: any[];

  @ApiProperty({ example: 'WARNING' })
  type: string;

  @ApiProperty({ example: [] })
  likes: string[];

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z' })
  createdAt: string;
}
