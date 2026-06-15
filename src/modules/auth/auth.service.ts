import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { RegisterCitizenDto, RegisterInstitutionDto, LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async registerCitizen(dto: RegisterCitizenDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });
    if (existing) throw new ConflictException('Email or username already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: 'CITIZEN',
      },
    });

    await this.prisma.citizenProfile.create({
      data: {
        name: dto.name,
        username: dto.username,
        email: dto.email,
        phone: dto.phone,
        province: dto.province,
        city: dto.city,
      },
    });

    return this.generateTokens(user);
  }

  async registerInstitution(dto: RegisterInstitutionDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.name.toLowerCase().replace(/\s+/g, '_') }] },
    });
    if (existing) throw new ConflictException('Email or institution already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const username = dto.name.toLowerCase().replace(/\s+/g, '_');

    const institution = await this.prisma.institution.create({
      data: {
        name: dto.name,
        type: dto.type,
        contactEmail: dto.email,
        contactPhone: dto.phone,
        address: dto.address,
        status: 'PENDING',
      },
    });

    const user = await this.prisma.user.create({
      data: {
        username,
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: 'INSTITUTION_ADMIN',
        institutionId: institution.id,
      },
    });

    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.username }, { username: dto.username }] },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    if (user.status !== 'ACTIVE') throw new UnauthorizedException('Account is inactive');

    return this.generateTokens(user);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-change-in-production',
      });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        status: true,
        institutionId: true,
        createdAt: true,
      },
    });
  }

  private async generateTokens(user: any) {
    const payload = { sub: user.id, username: user.username, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
      expiresIn: process.env.JWT_EXPIRATION || '15m',
    } as any);

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-change-in-production',
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    } as any);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        institutionId: user.institutionId,
        createdAt: user.createdAt,
      },
    };
  }
}
