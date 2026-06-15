import { ApiProperty } from '@nestjs/swagger';

export class DistrictEntity {
  @ApiProperty({ example: '3171010' })
  id: string;

  @ApiProperty({ example: 'Gambir' })
  name: string;

  @ApiProperty({ example: '3171' })
  cityId: string;
}
