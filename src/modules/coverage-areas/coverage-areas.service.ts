import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCoverageAreaDto, UpdateCoverageAreaDto } from './coverage-areas.dto';

@Injectable()
export class CoverageAreasService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { institutionId?: string; status?: string }) {
    const where: any = {};
    if (query.institutionId) where.institutionId = query.institutionId;
    if (query.status) where.status = query.status;

    return this.prisma.coverageArea.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { institution: { select: { id: true, name: true } } },
    });
  }

  async findOne(id: string) {
    const area = await this.prisma.coverageArea.findUnique({
      where: { id },
      include: { institution: { select: { id: true, name: true } } },
    });
    if (!area) throw new NotFoundException('Coverage area not found');
    return area;
  }

  async create(dto: CreateCoverageAreaDto, userId?: string) {
    return this.prisma.coverageArea.create({
      data: { ...dto as any, createdBy: userId },
    });
  }

  async update(id: string, dto: UpdateCoverageAreaDto) {
    await this.findOne(id);
    return this.prisma.coverageArea.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.coverageArea.delete({ where: { id } });
  }
}
