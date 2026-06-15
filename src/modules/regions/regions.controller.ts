import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { RegionsService } from './regions.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Regions')
@Controller('regions')
export class RegionsController {
  constructor(private regionsService: RegionsService) {}

  @Public()
  @Get('provinces')
  @ApiOperation({ summary: 'List 38 provinsi Indonesia' })
  async getProvinces() {
    return this.regionsService.getProvinces();
  }

  @Public()
  @Get('provinces/:id/cities')
  @ApiOperation({ summary: 'List kota/kab per provinsi' })
  @ApiParam({ name: 'id', type: String, example: '31' })
  async getCities(@Param('id') id: string) {
    return this.regionsService.getCities(id);
  }

  @Public()
  @Get('cities/:id/districts')
  @ApiOperation({ summary: 'List kecamatan per kota' })
  @ApiParam({ name: 'id', type: String, example: '3171' })
  async getDistricts(@Param('id') id: string) {
    return this.regionsService.getDistricts(id);
  }
}
