import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { ModerationService } from './moderation.service';
import { UpdateModerationStatusDto, UpdateSpamReportStatusDto } from './moderation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Moderation')
@Controller('moderation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPERADMIN', 'ADMIN')
export class ModerationController {
  constructor(private moderationService: ModerationService) {}

  @Get('content')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List content', description: 'Filter: status, type. Paginated.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'FLAGGED', 'REMOVED'] })
  @ApiQuery({ name: 'type', required: false, type: String })
  async getContent(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.moderationService.getContent({ page, limit, status, type });
  }

  @Get('content/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail content' })
  @ApiParam({ name: 'id', type: String })
  async getContentDetail(@Param('id') id: string) {
    return this.moderationService.getContentDetail(id);
  }

  @Patch('content/:id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve/flag/remove content' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateModerationStatusDto })
  async updateContentStatus(@Param('id') id: string, @Body() dto: UpdateModerationStatusDto) {
    return this.moderationService.updateContentStatus(id, dto);
  }

  @Get('spam-reports')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List spam reports' })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getSpamReports(@Query('status') status?: string) {
    return this.moderationService.getSpamReports({ status });
  }

  @Get('spam-reports/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail spam report' })
  @ApiParam({ name: 'id', type: String })
  async getSpamReportDetail(@Param('id') id: string) {
    return this.moderationService.getSpamReportDetail(id);
  }

  @Patch('spam-reports/:id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resolve/approve/reject spam report' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateSpamReportStatusDto })
  async updateSpamReportStatus(@Param('id') id: string, @Body() dto: UpdateSpamReportStatusDto) {
    return this.moderationService.updateSpamReportStatus(id, dto);
  }
}
