import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './roles.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all roles' })
  @ApiResponse({ status: 200, description: 'Roles list' })
  async findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail role + permissions' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @Roles('SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create role' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ status: 201, description: 'Role created' })
  async create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Put(':id')
  @Roles('SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update role + permissions' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateRoleDto })
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete role' })
  @ApiParam({ name: 'id', type: String })
  async remove(@Param('id') id: string) {
    await this.rolesService.remove(id);
    return { message: 'Role deleted' };
  }
}
