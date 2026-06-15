import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { CoverageAreasService } from './coverage-areas.service';
import { CreateCoverageAreaDto, UpdateCoverageAreaDto } from './coverage-areas.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Coverage Areas')
@Controller('coverage-areas')
@UseGuards(JwtAuthGuard)
export class CoverageAreasController {
  constructor(private coverageAreasService: CoverageAreasService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List coverage areas', description: 'Filter: institution, status' })
  @ApiQuery({ name: 'institutionId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String, example: 'active' })
  async findAll(
    @Query('institutionId') institutionId?: string,
    @Query('status') status?: string,
  ) {
    return this.coverageAreasService.findAll({ institutionId, status });
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail coverage area' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string) {
    return this.coverageAreasService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create coverage area' })
  @ApiBody({ type: CreateCoverageAreaDto })
  async create(@Body() dto: CreateCoverageAreaDto, @CurrentUser() user: any) {
    return this.coverageAreasService.create(dto, user?.id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update coverage area' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateCoverageAreaDto })
  async update(@Param('id') id: string, @Body() dto: UpdateCoverageAreaDto) {
    return this.coverageAreasService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete coverage area' })
  @ApiParam({ name: 'id', type: String })
  async remove(@Param('id') id: string) {
    await this.coverageAreasService.remove(id);
    return { message: 'Coverage area deleted' };
  }
}
