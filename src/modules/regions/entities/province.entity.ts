import { ApiProperty } from '@nestjs/swagger';

export class ProvinceEntity {
  @ApiProperty({ example: '31' })
  id: string;

  @ApiProperty({ example: 'DKI Jakarta' })
  name: string;
}
