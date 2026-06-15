import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { DataRecordsService } from './data-records.service';
import { CreateDataRecordDto, UpdateDataRecordDto } from './data-records.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Data Records')
@Controller('data-records')
@UseGuards(JwtAuthGuard)
export class DataRecordsController {
  constructor(private dataRecordsService: DataRecordsService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List data records', description: 'Filter: type, status. Paginated.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.dataRecordsService.findAll({ page, limit, type, status });
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail record' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string) {
    return this.dataRecordsService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create record' })
  @ApiBody({ type: CreateDataRecordDto })
  async create(@Body() dto: CreateDataRecordDto) {
    return this.dataRecordsService.create(dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update record' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateDataRecordDto })
  async update(@Param('id') id: string, @Body() dto: UpdateDataRecordDto) {
    return this.dataRecordsService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete record' })
  @ApiParam({ name: 'id', type: String })
  async remove(@Param('id') id: string) {
    await this.dataRecordsService.remove(id);
    return { message: 'Record deleted' };
  }
}
