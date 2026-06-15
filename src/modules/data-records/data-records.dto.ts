import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateDataRecordDto {
  @ApiProperty({ example: 'Record Title' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'report' })
  @IsString()
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  content?: object;
}

export class UpdateDataRecordDto {
  @ApiPropertyOptional()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  content?: object;

  @ApiPropertyOptional()
  @IsOptional()
  status?: string;
}
