import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ContentItemEntity {
  @ApiProperty({ example: 'ci_001' })
  id: string;

  @ApiProperty({ example: 'Post title' })
  title: string;

  @ApiProperty({ example: 'post' })
  type: string;

  @ApiProperty({ example: 'Budi' })
  author: string;

  @ApiProperty({ example: 'BPBD' })
  institution: string;

  @ApiProperty({ example: 3 })
  reportsCount: number;

  @ApiPropertyOptional()
  aiScore?: any;

  @ApiProperty({ example: 'PENDING' })
  status: string;
}
