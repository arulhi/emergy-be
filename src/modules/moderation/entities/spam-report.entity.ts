import { ApiProperty } from '@nestjs/swagger';

export class SpamReportEntity {
  @ApiProperty({ example: 'sr_001' })
  id: string;

  @ApiProperty({ example: 'Spam post' })
  contentTitle: string;

  @ApiProperty({ example: 'post' })
  contentType: string;

  @ApiProperty({ example: 'user_001' })
  reporter: string;

  @ApiProperty({ example: 'Duplicate content' })
  reason: string;

  @ApiProperty({ example: false })
  isBulk: boolean;

  @ApiProperty({ example: 'pending' })
  status: string;
}
