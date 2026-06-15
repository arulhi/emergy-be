import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateHotlineDto, UpdateHotlineDto } from './hotlines.dto';

@Injectable()
export class HotlinesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { type?: string; status?: string; institutionId?: string; serviceType?: string }) {
    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.institutionId) where.institutionId = query.institutionId;
    if (query.serviceType) where.serviceType = query.serviceType;

    return this.prisma.hotline.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { institution: { select: { id: true, name: true } } },
    });
  }

  async findOne(id: string) {
    const hotline = await this.prisma.hotline.findUnique({
      where: { id },
      include: { institution: { select: { id: true, name: true } } },
    });
    if (!hotline) throw new NotFoundException('Hotline not found');
    return hotline;
  }

  async create(dto: CreateHotlineDto) {
    return this.prisma.hotline.create({ data: dto as any });
  }

  async update(id: string, dto: UpdateHotlineDto) {
    await this.findOne(id);
    return this.prisma.hotline.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.hotline.delete({ where: { id } });
  }
}
