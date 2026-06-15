import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoleEntity {
  @ApiProperty({ example: 'role_001' })
  id: string;

  @ApiProperty({ example: 'moderator' })
  name: string;

  @ApiPropertyOptional({ example: 'Can moderate content' })
  description?: string;

  @ApiProperty({ example: ['dashboard:view', 'incidents:view'] })
  permissions: string[];

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z' })
  updatedAt: string;
}
