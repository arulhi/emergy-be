import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterCitizenDto, RegisterInstitutionDto, RefreshTokenDto } from './auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register-citizen')
  @ApiOperation({ summary: 'Register warga baru' })
  @ApiBody({ type: RegisterCitizenDto })
  @ApiResponse({ status: 201, description: 'Warga terdaftar' })
  @ApiResponse({ status: 409, description: 'Email/username already exists' })
  async registerCitizen(@Body() dto: RegisterCitizenDto) {
    return this.authService.registerCitizen(dto);
  }

  @Public()
  @Post('register-institution')
  @ApiOperation({ summary: 'Register institusi baru (pending approval)' })
  @ApiBody({ type: RegisterInstitutionDto })
  @ApiResponse({ status: 201, description: 'Institusi terdaftar, menunggu approval' })
  async registerInstitution(@Body() dto: RegisterInstitutionDto) {
    return this.authService.registerInstitution(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login → JWT access + refresh token' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Berhasil login' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout — hapus refresh token' })
  @ApiResponse({ status: 200, description: 'Logged out' })
  async logout(@CurrentUser() user: any) {
    await this.authService.logout(user.id);
    return { message: 'Logged out' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profile user saat ini' })
  @ApiResponse({ status: 200, description: 'Profile user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async me(@CurrentUser() user: any) {
    return this.authService.me(user.id);
  }
}
