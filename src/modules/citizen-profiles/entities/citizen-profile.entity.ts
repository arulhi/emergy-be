import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CitizenProfileEntity {
  @ApiProperty({ example: 'cp_001' })
  id: string;

  @ApiProperty({ example: 'Ahmad Fauzi' })
  name: string;

  @ApiProperty({ example: 'ahmadfauzi' })
  username: string;

  @ApiProperty({ example: 'ahmad@email.com' })
  email: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  avatar?: string;

  @ApiPropertyOptional()
  bio?: string;

  @ApiPropertyOptional({ example: 'DKI Jakarta' })
  province?: string;

  @ApiPropertyOptional({ example: 'Jakarta Pusat' })
  city?: string;

  @ApiProperty({ example: 5 })
  postsCount: number;

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z' })
  createdAt: string;
}
