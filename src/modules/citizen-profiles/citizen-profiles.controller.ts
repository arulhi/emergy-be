import { Controller, Get, Put, Post, Body, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CitizenProfilesService } from './citizen-profiles.service';
import { UpdateCitizenProfileDto } from './citizen-profiles.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Citizen Profiles')
@Controller('citizen-profiles')
export class CitizenProfilesController {
  constructor(private citizenProfilesService: CitizenProfilesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List citizen profiles (public lookup)' })
  async findAll() {
    return this.citizenProfilesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profile saya sendiri' })
  async getMe(@CurrentUser() user: any) {
    return this.citizenProfilesService.getMe(user.id);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Detail profile publik' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string) {
    return this.citizenProfilesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update profile saya' })
  @ApiBody({ type: UpdateCitizenProfileDto })
  async updateMe(@CurrentUser() user: any, @Body() dto: UpdateCitizenProfileDto) {
    return this.citizenProfilesService.updateMe(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/avatar')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: any) {
    if (file) {
      const avatarUrl = `/uploads/${file.filename}`;
      return this.citizenProfilesService.updateMe(user.id, { avatar: avatarUrl });
    }
    return { message: 'No file uploaded' };
  }
}
