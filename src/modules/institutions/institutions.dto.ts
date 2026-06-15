import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateInstitutionDto {
  @ApiProperty({ example: 'BPBD DKI Jakarta' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Government' })
  @IsString()
  type: string;

  @ApiPropertyOptional({ example: 'info@bpbd.jakarta.go.id' })
  @IsOptional()
  contactEmail?: string;

  @ApiPropertyOptional({ example: '021-12345678' })
  @IsOptional()
  contactPhone?: string;

  @ApiPropertyOptional({ example: 'Jl. Merdeka No.1, Jakarta Pusat' })
  @IsOptional()
  address?: string;
}

export class UpdateInstitutionDto {
  @ApiPropertyOptional()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  address?: string;
}

export class UpdateInstitutionStatusDto {
  @ApiProperty({ enum: ['ACTIVE', 'PENDING', 'REJECTED', 'SUSPENDED'] })
  @IsEnum(['ACTIVE', 'PENDING', 'REJECTED', 'SUSPENDED'])
  status: string;
}

export class UpdateTrustLevelDto {
  @ApiProperty({ enum: ['NONE', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'] })
  @IsEnum(['NONE', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'])
  trustLevel: string;
}

export class AddMemberDto {
  @ApiProperty({ example: 'user_xxx' })
  @IsString()
  userId: string;

  @ApiProperty({ enum: ['INSTITUTION_ADMIN', 'INSTITUTION_STAFF'] })
  @IsEnum(['INSTITUTION_ADMIN', 'INSTITUTION_STAFF'])
  role: string;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: ['INSTITUTION_ADMIN', 'INSTITUTION_STAFF'] })
  @IsEnum(['INSTITUTION_ADMIN', 'INSTITUTION_STAFF'])
  role: string;
}
