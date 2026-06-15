import { ApiProperty } from '@nestjs/swagger';

export class SocialReplyEntity {
  @ApiProperty({ example: 'sr_001' })
  id: string;

  @ApiProperty({ example: 'sc_001' })
  commentId: string;

  @ApiProperty({ example: 'BPBD DKI Jakarta' })
  author: string;

  @ApiProperty({ example: 'Sama-sama, tetap waspada' })
  content: string;

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z' })
  createdAt: string;
}
