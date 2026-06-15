import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { EmergencyContactsService } from './emergency-contacts.service';
import { CreateEmergencyContactDto, UpdateEmergencyContactDto } from './emergency-contacts.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Emergency Contacts')
@Controller('emergency-contacts')
export class EmergencyContactsController {
  constructor(private emergencyContactsService: EmergencyContactsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List emergency contacts', description: 'Filter: type, city' })
  @ApiQuery({ name: 'type', required: false, type: String, example: 'hospital' })
  @ApiQuery({ name: 'city', required: false, type: String, example: 'Jakarta Pusat' })
  async findAll(@Query('type') type?: string, @Query('city') city?: string) {
    return this.emergencyContactsService.findAll({ type, city });
  }

  @Public()
  @Get('public')
  @ApiOperation({ summary: 'Public list (no auth needed)' })
  @ApiQuery({ name: 'city', required: false, type: String, example: 'Jakarta Pusat' })
  async findPublic(@Query('city') city?: string) {
    return this.emergencyContactsService.findPublic({ city });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail contact' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string) {
    return this.emergencyContactsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create emergency contact' })
  @ApiBody({ type: CreateEmergencyContactDto })
  async create(@Body() dto: CreateEmergencyContactDto) {
    return this.emergencyContactsService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update contact' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateEmergencyContactDto })
  async update(@Param('id') id: string, @Body() dto: UpdateEmergencyContactDto) {
    return this.emergencyContactsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete contact' })
  @ApiParam({ name: 'id', type: String })
  async remove(@Param('id') id: string) {
    await this.emergencyContactsService.remove(id);
    return { message: 'Contact deleted' };
  }
}
