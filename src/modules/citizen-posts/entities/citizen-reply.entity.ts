import { ApiProperty } from '@nestjs/swagger';

export class CitizenReplyEntity {
  @ApiProperty({ example: 'cr_001' })
  id: string;

  @ApiProperty({ example: 'Sama-sama' })
  content: string;

  @ApiProperty({ example: 'cc_001' })
  commentId: string;

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z' })
  createdAt: string;
}
