import { ApiProperty } from '@nestjs/swagger';

export class HoaxReportEntity {
  @ApiProperty({ example: 'hr_001' })
  id: string;

  @ApiProperty({ example: 'cp_001' })
  postId: string;

  @ApiProperty({ example: 'Informasi tidak benar' })
  reason: string;

  @ApiProperty({ example: 'user_001' })
  reportedBy: string;

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z' })
  createdAt: string;
}
