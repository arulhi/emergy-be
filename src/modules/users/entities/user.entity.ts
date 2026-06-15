import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({ example: 'user_001' })
  id: string;

  @ApiProperty({ example: 'emilys' })
  username: string;

  @ApiProperty({ example: 'emilys@example.com' })
  email: string;

  @ApiPropertyOptional({ example: 'Emily Johnson' })
  name?: string;

  @ApiProperty({ example: 'SUPERADMIN' })
  role: string;

  @ApiProperty({ example: 'ACTIVE' })
  status: string;

  @ApiPropertyOptional()
  institutionId?: string;

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z' })
  updatedAt: string;
}
