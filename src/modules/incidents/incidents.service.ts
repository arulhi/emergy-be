import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateIncidentDto, UpdateIncidentDto, UpdateIncidentStatusDto, AssignIncidentDto } from './incidents.dto';

@Injectable()
export class IncidentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number; limit?: number; type?: string; severity?: string;
    status?: string; source?: string; startDate?: string; endDate?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.severity) where.severity = query.severity;
    if (query.status) where.status = query.status;
    if (query.source) where.source = query.source;

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.incident.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reportedBy: { select: { id: true, username: true } },
          assignedTo: { select: { id: true, username: true } },
          institution: { select: { id: true, name: true } },
        },
      }),
      this.prisma.incident.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { id },
      include: {
        reportedBy: { select: { id: true, username: true } },
        assignedTo: { select: { id: true, username: true } },
        institution: { select: { id: true, name: true } },
      },
    });
    if (!incident) throw new NotFoundException('Incident not found');
    return incident;
  }

  async create(dto: CreateIncidentDto, userId?: string) {
    return this.prisma.incident.create({
      data: {
        ...dto as any,
        severity: (dto.severity as any) || 'MEDIUM',
        source: (dto.source as any) || 'ADMIN',
        reportedById: userId,
        createdBy: userId,
      },
    });
  }

  async update(id: string, dto: UpdateIncidentDto) {
    await this.findOne(id);
    return this.prisma.incident.update({ where: { id }, data: dto as any });
  }

  async updateStatus(id: string, dto: UpdateIncidentStatusDto) {
    await this.findOne(id);
    return this.prisma.incident.update({ where: { id }, data: { status: dto.status as any } });
  }

  async assign(id: string, dto: AssignIncidentDto) {
    await this.findOne(id);
    return this.prisma.incident.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.incident.delete({ where: { id } });
  }
}
