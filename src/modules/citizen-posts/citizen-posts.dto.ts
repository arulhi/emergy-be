import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateCitizenPostDto {
  @ApiProperty({ example: 'Banjir di Jl. Merdeka setinggi 1 meter' })
  @IsString()
  caption: string;

  @ApiProperty({ example: 'flood', enum: ['fire', 'flood', 'accident', 'medical', 'crime', 'earthquake', 'other'] })
  @IsString()
  category: string;

  @ApiProperty({ example: { lat: -6.1865, lng: 106.8345, address: 'Jl. Merdeka No.45', city: 'Jakarta Pusat', province: 'DKI Jakarta' } })
  location: object;

  @ApiPropertyOptional({ example: [{ type: 'image', url: 'https://...', name: 'photo.jpg' }] })
  @IsOptional()
  media?: { type: string; url: string; name: string }[];
}

export class UpdateCitizenPostDto {
  @ApiPropertyOptional()
  @IsOptional()
  caption?: string;

  @ApiPropertyOptional()
  @IsOptional()
  media?: object[];

  @ApiPropertyOptional()
  @IsOptional()
  location?: object;
}

export class ReportPostDto {
  @ApiProperty({ example: 'Informasi tidak benar / hoax' })
  @IsString()
  reason: string;
}

export class CreateCommentDto {
  @ApiProperty({ example: 'Terima kasih informasinya' })
  @IsString()
  content: string;
}

export class UpdateCommentDto {
  @ApiProperty({ example: 'Updated comment text' })
  @IsString()
  content: string;
}

export class CreateReplyDto {
  @ApiProperty({ example: 'Sama-sama, tetap waspada' })
  @IsString()
  content: string;
}
