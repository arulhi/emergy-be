import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { IncidentsService } from './incidents.service';
import { IncidentsStatsService } from './incidents-stats.service';
import { CreateIncidentDto, UpdateIncidentDto, UpdateIncidentStatusDto, AssignIncidentDto } from './incidents.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Incidents')
@Controller('incidents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IncidentsController {
  constructor(
    private incidentsService: IncidentsService,
    private incidentsStatsService: IncidentsStatsService,
  ) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List incidents', description: 'Filter: type, severity, status, source, date range. Paginated.' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'type', required: false, type: String, example: 'flood' })
  @ApiQuery({ name: 'severity', required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'HOAX'] })
  @ApiQuery({ name: 'source', required: false, enum: ['ADMIN', 'SOCIAL', 'HOTLINE', 'CITIZEN'] })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Paginated incidents' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string,
    @Query('severity') severity?: string,
    @Query('status') status?: string,
    @Query('source') source?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.incidentsService.findAll({ page, limit, type, severity, status, source, startDate, endDate });
  }

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Statistik dashboard: total, by status, by severity' })
  async getStats() {
    return this.incidentsStatsService.getStats();
  }

  @Get('charts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Data chart: category distribution, severity, trend bulanan' })
  @ApiQuery({ name: 'months', required: false, type: Number, example: 12 })
  async getCharts(@Query('months') months?: number) {
    return this.incidentsStatsService.getCharts(months);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail incident' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string) {
    return this.incidentsService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create incident' })
  @ApiBody({ type: CreateIncidentDto })
  async create(@Body() dto: CreateIncidentDto, @CurrentUser() user: any) {
    return this.incidentsService.create(dto, user?.id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update incident' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateIncidentDto })
  async update(@Param('id') id: string, @Body() dto: UpdateIncidentDto) {
    return this.incidentsService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update status: verify, resolve, dismiss' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateIncidentStatusDto })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateIncidentStatusDto) {
    return this.incidentsService.updateStatus(id, dto);
  }

  @Patch(':id/assign')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign incident ke institusi/user' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: AssignIncidentDto })
  async assign(@Param('id') id: string, @Body() dto: AssignIncidentDto) {
    return this.incidentsService.assign(id, dto);
  }

  @Delete(':id')
  @Roles('SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete incident' })
  @ApiParam({ name: 'id', type: String })
  async remove(@Param('id') id: string) {
    await this.incidentsService.remove(id);
    return { message: 'Incident deleted' };
  }
}
