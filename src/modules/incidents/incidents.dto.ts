import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateIncidentDto {
  @ApiProperty({ example: 'Banjir di Jakarta Timur' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'Jl. Raya Bogor Km 10, Jakarta Timur' })
  @IsString()
  location: string;

  @ApiProperty({ example: 'Ani S.' })
  @IsString()
  reporter: string;

  @ApiPropertyOptional({ example: 'Banjir setinggi 1 meter...' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @IsOptional()
  severity?: string;

  @ApiPropertyOptional({ enum: ['ADMIN', 'SOCIAL', 'HOTLINE', 'CITIZEN'] })
  @IsOptional()
  source?: string;
}

export class UpdateIncidentDto {
  @ApiPropertyOptional()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @IsOptional()
  severity?: string;
}

export class UpdateIncidentStatusDto {
  @ApiProperty({ enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'HOAX'] })
  @IsEnum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'HOAX'])
  status: string;
}

export class AssignIncidentDto {
  @ApiPropertyOptional({ example: 'inst_001' })
  @IsOptional()
  institutionId?: string;

  @ApiPropertyOptional({ example: 'user_xxx' })
  @IsOptional()
  assignedToId?: string;
}
