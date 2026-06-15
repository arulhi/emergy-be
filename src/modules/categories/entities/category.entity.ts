import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryEntity {
  @ApiProperty({ example: 'cat_001' })
  id: string;

  @ApiProperty({ example: 'Natural Disasters' })
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ example: 0 })
  sortOrder: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional()
  parentId?: string;

  @ApiPropertyOptional({ type: [CategoryEntity] })
  children?: any[];
}
