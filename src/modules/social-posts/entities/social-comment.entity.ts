import { ApiProperty } from '@nestjs/swagger';

export class SocialCommentEntity {
  @ApiProperty({ example: 'sc_001' })
  id: string;

  @ApiProperty({ example: 'sp_001' })
  postId: string;

  @ApiProperty({ example: 'Budi' })
  author: string;

  @ApiProperty({ example: 'Terima kasih informasinya' })
  content: string;

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z' })
  createdAt: string;
}
