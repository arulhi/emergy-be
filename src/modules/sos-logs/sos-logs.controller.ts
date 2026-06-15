import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { SosLogsService } from './sos-logs.service';
import { CreateSosLogDto } from './sos-logs.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('SOS Logs')
@Controller('sos-logs')
@UseGuards(JwtAuthGuard)
export class SosLogsController {
  constructor(private sosLogsService: SosLogsService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all SOS logs (admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.sosLogsService.findAll({ page, limit });
  }

  @Get('my')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'SOS logs saya' })
  async getMyLogs(@CurrentUser() user: any) {
    return this.sosLogsService.getMyLogs(user.id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create SOS log' })
  @ApiBody({ type: CreateSosLogDto })
  async create(@Body() dto: CreateSosLogDto, @CurrentUser() user: any) {
    return this.sosLogsService.create(dto, user?.id);
  }
}
