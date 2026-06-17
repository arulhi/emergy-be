import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { InstitutionsService } from './institutions.service';
import { CreateInstitutionDto, UpdateInstitutionDto, UpdateInstitutionStatusDto, UpdateTrustLevelDto, AddMemberDto, UpdateMemberRoleDto, ResetPasswordDto, CreateInstitutionResponseDto, ResetPasswordResponseDto, ErrorResponseDto } from './institutions.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Institutions')
@Controller('institutions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InstitutionsController {
  constructor(private institutionsService: InstitutionsService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List institutions', description: 'Filter: status, type, search. Paginated.' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'PENDING', 'REJECTED', 'SUSPENDED'] })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    return this.institutionsService.findAll({ page, limit, status, type, search });
  }

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Summary stats institutions' })
  async getStats() {
    return this.institutionsService.getStats();
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail institution' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string) {
    return this.institutionsService.findOne(id);
  }

  @Get(':id/dashboard')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dashboard stats spesifik institusi' })
  @ApiParam({ name: 'id', type: String })
  async getDashboard(@Param('id') id: string) {
    return this.institutionsService.getDashboard(id);
  }

  @Get(':id/incidents')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Incidents milik institusi' })
  @ApiParam({ name: 'id', type: String })
  async getIncidents(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.institutionsService.getIncidents(id, { page, limit });
  }

  @Get(':id/members')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Anggota institusi' })
  @ApiParam({ name: 'id', type: String })
  async getMembers(@Param('id') id: string) {
    return this.institutionsService.getMembers(id);
  }

  @Post()
  @Roles('SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create institution', description: 'Superadmin creates institution + generates INSTITUTION_ADMIN user with default password.' })
  @ApiBody({ type: CreateInstitutionDto })
  @ApiCreatedResponse({ type: CreateInstitutionResponseDto, description: 'Institution created with default password' })
  @ApiResponse({ status: 409, type: ErrorResponseDto, description: 'Email already exists' })
  async create(@Body() dto: CreateInstitutionDto) {
    return this.institutionsService.create(dto);
  }

  @Put(':id')
  @Roles('SUPERADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update institution' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateInstitutionDto })
  async update(@Param('id') id: string, @Body() dto: UpdateInstitutionDto) {
    return this.institutionsService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles('SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve/reject/suspend institution' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateInstitutionStatusDto })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateInstitutionStatusDto) {
    return this.institutionsService.updateStatus(id, dto);
  }

  @Patch(':id/trust-level')
  @Roles('SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update trust level' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateTrustLevelDto })
  async updateTrustLevel(@Param('id') id: string, @Body() dto: UpdateTrustLevelDto) {
    return this.institutionsService.updateTrustLevel(id, dto);
  }

  @Post(':id/members')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tambah anggota ke institusi' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: AddMemberDto })
  async addMember(@Param('id') id: string, @Body() dto: AddMemberDto) {
    return this.institutionsService.addMember(id, dto);
  }

  @Patch(':id/members/:userId/role')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ubah role anggota institusi' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'userId', type: String })
  @ApiBody({ type: UpdateMemberRoleDto })
  async updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.institutionsService.updateMemberRole(id, userId, dto);
  }

  @Post(':id/reset-password')
  @Roles('SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset password admin institusi', description: 'Superadmin resets the INSTITUTION_ADMIN password for a given institution.' })
  @ApiParam({ name: 'id', type: String, description: 'Institution ID' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({ type: ResetPasswordResponseDto, description: 'Password reset successfully' })
  @ApiResponse({ status: 404, type: ErrorResponseDto, description: 'Institution or admin user not found' })
  async resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    return this.institutionsService.resetPassword(id, dto);
  }

  @Delete(':id')
  @Roles('SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete institution' })
  @ApiParam({ name: 'id', type: String })
  async remove(@Param('id') id: string) {
    await this.institutionsService.remove(id);
    return { message: 'Institution deleted' };
  }
}
