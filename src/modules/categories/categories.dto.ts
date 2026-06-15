import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Natural Disasters' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ example: 'cat_001' })
  @IsOptional()
  parentId?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  isActive?: boolean;
}
