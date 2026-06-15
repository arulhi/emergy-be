import { ApiProperty } from '@nestjs/swagger';

export class CityEntity {
  @ApiProperty({ example: '3171' })
  id: string;

  @ApiProperty({ example: 'Jakarta Pusat' })
  name: string;

  @ApiProperty({ example: '31' })
  provinceId: string;
}
