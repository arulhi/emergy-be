import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateSocialPostDto {
  @ApiProperty({ example: 'Peringatan dini: Hujan lebat...' })
  @IsString()
  caption: string;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  media?: { type: string; url: string; name: string }[];

  @ApiProperty({ enum: ['WARNING', 'UPDATE', 'BROADCAST', 'INFO', 'NEWS', 'TIPS', 'ALERT', 'THANK_YOU'] })
  @IsEnum(['WARNING', 'UPDATE', 'BROADCAST', 'INFO', 'NEWS', 'TIPS', 'ALERT', 'THANK_YOU'])
  type: string;
}

export class UpdateSocialPostDto {
  @ApiPropertyOptional()
  @IsOptional()
  caption?: string;

  @ApiPropertyOptional()
  @IsOptional()
  media?: object[];

  @ApiPropertyOptional({ enum: ['WARNING', 'UPDATE', 'BROADCAST', 'INFO', 'NEWS', 'TIPS', 'ALERT', 'THANK_YOU'] })
  @IsOptional()
  type?: string;
}

export class CreateCommentDto {
  @ApiProperty({ example: 'Terima kasih informasinya' })
  @IsString()
  content: string;
}

export class CreateReplyDto {
  @ApiProperty({ example: 'Sama-sama, tetap waspada' })
  @IsString()
  content: string;
}
