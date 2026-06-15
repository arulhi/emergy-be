import { ApiProperty } from '@nestjs/swagger';

export class CitizenCommentEntity {
  @ApiProperty({ example: 'cc_001' })
  id: string;

  @ApiProperty({ example: 'Terima kasih informasinya' })
  content: string;

  @ApiProperty({ example: 'cp_001' })
  postId: string;

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z' })
  createdAt: string;
}
