import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateCitizenProfileDto } from './citizen-profiles.dto';

@Injectable()
export class CitizenProfilesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.citizenProfile.findMany({
      select: { id: true, name: true, username: true, avatar: true, city: true, postsCount: true },
      orderBy: { postsCount: 'desc' },
    });
  }

  async getMe(userId: string) {
    const profile = await this.prisma.citizenProfile.findUnique({
      where: { id: userId },
      include: { _count: { select: { posts: true, comments: true } } },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async findOne(id: string) {
    const profile = await this.prisma.citizenProfile.findUnique({
      where: { id },
      include: { _count: { select: { posts: true, comments: true } } },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async updateMe(userId: string, dto: UpdateCitizenProfileDto) {
    return this.prisma.citizenProfile.update({
      where: { id: userId },
      data: dto,
    });
  }
}
