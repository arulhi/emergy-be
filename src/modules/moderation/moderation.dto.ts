import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateModerationStatusDto {
  @ApiProperty({ enum: ['APPROVED', 'FLAGGED', 'REMOVED'] })
  @IsEnum(['APPROVED', 'FLAGGED', 'REMOVED'])
  status: string;
}

export class UpdateSpamReportStatusDto {
  @ApiProperty({ enum: ['approved', 'rejected'] })
  @IsEnum(['approved', 'rejected'])
  status: string;
}
