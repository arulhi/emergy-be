import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSosLogDto } from './sos-logs.dto';

@Injectable()
export class SosLogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.sosLog.findMany({
        skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { profile: { select: { id: true, name: true } } },
      }),
      this.prisma.sosLog.count(),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getMyLogs(userId: string) {
    return this.prisma.sosLog.findMany({
      where: { profileId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateSosLogDto, userId?: string) {
    return this.prisma.sosLog.create({
      data: { location: dto.location as any, contacted: dto.contacted, profileId: userId },
    });
  }
}
