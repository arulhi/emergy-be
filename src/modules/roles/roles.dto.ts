import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'moderator' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Can moderate content' })
  @IsOptional()
  description?: string;

  @ApiProperty({ example: ['dashboard:view', 'incidents:view', 'incidents:edit'], type: [String] })
  @IsArray()
  permissions: string[];
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'moderator' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  permissions?: string[];
}
