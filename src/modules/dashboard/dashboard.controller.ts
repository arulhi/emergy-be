import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPERADMIN', 'ADMIN')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ringkasan: total users, incidents, institutions, active, pending' })
  async getStats() {
    return this.dashboardService.getStats();
  }

  @Get('incident-trends')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trend insiden per bulan' })
  @ApiQuery({ name: 'months', required: false, type: Number, example: 12 })
  async getIncidentTrends(@Query('months') months?: number) {
    return this.dashboardService.getIncidentTrends(months);
  }

  @Get('incident-categories')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Distribusi insiden per kategori' })
  async getIncidentCategories() {
    return this.dashboardService.getIncidentCategories();
  }

  @Get('incident-severity')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Distribusi insiden per severity' })
  async getIncidentSeverity() {
    return this.dashboardService.getIncidentSeverity();
  }

  @Get('recent-activity')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aktivitas terbaru' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async getRecentActivity(@Query('limit') limit?: number) {
    return this.dashboardService.getRecentActivity(limit);
  }

  @Get('institution-summary')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ringkasan per institusi' })
  async getInstitutionSummary() {
    return this.dashboardService.getInstitutionSummary();
  }

  @Get('region-distribution')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sebaran insiden per region' })
  async getRegionDistribution() {
    return this.dashboardService.getRegionDistribution();
  }
}
