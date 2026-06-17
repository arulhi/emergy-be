import { ApiProperty, ApiPropertyOptional, ApiResponseProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, MinLength, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class InstitutionEmergencyContactItem {
  @ApiProperty({ example: 'Polres Jakarta Pusat' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'police', default: 'OTHER' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ example: '021-12345678' })
  @IsString()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;
}

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  regionId?: string;

  @ApiPropertyOptional({ description: 'Frontend sends as selectedProvince' })
  @IsOptional()
  @IsString()
  selectedProvince?: string;

  @ApiPropertyOptional({ description: 'Frontend sends as selectedCity' })
  @IsOptional()
  @IsString()
  selectedCity?: string;

  @ApiPropertyOptional({ description: 'Frontend sends as selectedDistrict' })
  @IsOptional()
  @IsString()
  selectedDistrict?: string;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'PENDING', 'REJECTED', 'SUSPENDED'], description: 'Institution status' })
  @IsOptional()
  @IsEnum(['ACTIVE', 'PENDING', 'REJECTED', 'SUSPENDED'])
  status?: string;

  @ApiPropertyOptional({ type: [InstitutionEmergencyContactItem], description: 'Emergency contacts to create' })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => InstitutionEmergencyContactItem)
  emergencyContacts?: InstitutionEmergencyContactItem[];
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  regionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  selectedProvince?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  selectedCity?: string;

  @ApiPropertyOptional({ description: 'Frontend sends as selectedDistrict' })
  @IsOptional()
  @IsString()
  selectedDistrict?: string;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'PENDING', 'REJECTED', 'SUSPENDED'], description: 'Institution status' })
  @IsOptional()
  @IsEnum(['ACTIVE', 'PENDING', 'REJECTED', 'SUSPENDED'])
  status?: string;

  @ApiPropertyOptional({ type: [InstitutionEmergencyContactItem], description: 'Emergency contacts to replace existing' })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => InstitutionEmergencyContactItem)
  emergencyContacts?: InstitutionEmergencyContactItem[];
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'newPassword123' })
  @IsString()
  @MinLength(6)
  newPassword: string;
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

// ----- Response DTOs untuk Swagger -----

export class InstitutionResponseDto {
  @ApiProperty({ example: 'clx...' })
  id: string;

  @ApiProperty({ example: 'Damkar KBB' })
  name: string;

  @ApiProperty({ example: 'Firefighter' })
  type: string;

  @ApiProperty({ example: 'ACTIVE' })
  status: string;

  @ApiPropertyOptional({ example: 'damkar@kbb.id' })
  contactEmail?: string;

  @ApiPropertyOptional({ example: '0213456789' })
  contactPhone?: string;

  @ApiPropertyOptional({ example: 'Kotabaru parahyangan' })
  address?: string;

  @ApiPropertyOptional({ example: '32' })
  province?: string;

  @ApiPropertyOptional({ example: '3217' })
  city?: string;

  @ApiPropertyOptional()
  district?: string;

  @ApiPropertyOptional({ example: '3217090' })
  regionId?: string;

  @ApiProperty({ example: 'NONE' })
  trustLevel: string;

  @ApiProperty({ example: 0 })
  membersCount: number;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class CreateInstitutionResponseDto extends InstitutionResponseDto {
  @ApiProperty({ example: '1a2b3c4d', description: 'Default password for institution admin login' })
  defaultPassword: string;

  @ApiProperty({ example: 'Institution created successfully. Share the default password with the institution admin.' })
  message: string;
}

export class ResetPasswordResponseDto {
  @ApiProperty({ example: 'Password reset successfully' })
  message: string;
}

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  message: string;

  @ApiProperty({ example: 'Bad Request' })
  error: string;
}
