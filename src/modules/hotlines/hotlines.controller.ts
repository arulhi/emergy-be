import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { HotlinesService } from './hotlines.service';
import { CreateHotlineDto, UpdateHotlineDto } from './hotlines.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Hotlines')
@Controller('hotlines')
@UseGuards(JwtAuthGuard)
export class HotlinesController {
  constructor(private hotlinesService: HotlinesService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List hotlines', description: 'Filter: type, status, institution, serviceType' })
  @ApiQuery({ name: 'type', required: false, enum: ['POLICE', 'HOSPITAL', 'FIRE', 'SAR', 'PLN', 'BNPB', 'BPBD', 'EMERGENCY', 'FLOOD', 'MEDICAL', 'INFORMATION', 'OTHER'] })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'institutionId', required: false, type: String })
  @ApiQuery({ name: 'serviceType', required: false, type: String })
  async findAll(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('institutionId') institutionId?: string,
    @Query('serviceType') serviceType?: string,
  ) {
    return this.hotlinesService.findAll({ type, status, institutionId, serviceType });
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail hotline' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string) {
    return this.hotlinesService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create hotline' })
  @ApiBody({ type: CreateHotlineDto })
  async create(@Body() dto: CreateHotlineDto) {
    return this.hotlinesService.create(dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update hotline' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateHotlineDto })
  async update(@Param('id') id: string, @Body() dto: UpdateHotlineDto) {
    return this.hotlinesService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete hotline' })
  @ApiParam({ name: 'id', type: String })
  async remove(@Param('id') id: string) {
    await this.hotlinesService.remove(id);
    return { message: 'Hotline deleted' };
  }
}
