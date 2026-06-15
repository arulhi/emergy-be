import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateInstitutionDto, UpdateInstitutionDto, UpdateInstitutionStatusDto, UpdateTrustLevelDto, AddMemberDto, UpdateMemberRoleDto } from './institutions.dto';

@Injectable()
export class InstitutionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; status?: string; type?: string; search?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { contactEmail: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.institution.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.institution.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getStats() {
    const [total, active, pending, rejected] = await Promise.all([
      this.prisma.institution.count(),
      this.prisma.institution.count({ where: { status: 'ACTIVE' } }),
      this.prisma.institution.count({ where: { status: 'PENDING' } }),
      this.prisma.institution.count({ where: { status: 'REJECTED' } }),
    ]);
    return { total, active, pending, rejected };
  }

  async findOne(id: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id },
      include: { users: { select: { id: true, username: true, email: true, name: true, role: true } } },
    });
    if (!institution) throw new NotFoundException('Institution not found');
    return institution;
  }

  async getDashboard(id: string) {
    const institution = await this.findOne(id);
    const [totalIncidents, pendingIncidents, resolvedIncidents] = await Promise.all([
      this.prisma.incident.count({ where: { institutionId: id } }),
      this.prisma.incident.count({ where: { institutionId: id, status: 'PENDING' } }),
      this.prisma.incident.count({ where: { institutionId: id, status: 'RESOLVED' } }),
    ]);
    return { institution, stats: { totalIncidents, pendingIncidents, resolvedIncidents } };
  }

  async getIncidents(id: string, query: { page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.incident.findMany({
        where: { institutionId: id },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.incident.count({ where: { institutionId: id } }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getMembers(id: string) {
    return this.prisma.user.findMany({
      where: { institutionId: id },
      select: { id: true, username: true, email: true, name: true, role: true, status: true, createdAt: true },
    });
  }

  async create(dto: CreateInstitutionDto) {
    return this.prisma.institution.create({ data: dto });
  }

  async update(id: string, dto: UpdateInstitutionDto) {
    await this.findOne(id);
    return this.prisma.institution.update({ where: { id }, data: dto });
  }

  async updateStatus(id: string, dto: UpdateInstitutionStatusDto) {
    await this.findOne(id);
    return this.prisma.institution.update({
      where: { id },
      data: { status: dto.status as any },
    });
  }

  async updateTrustLevel(id: string, dto: UpdateTrustLevelDto) {
    await this.findOne(id);
    return this.prisma.institution.update({
      where: { id },
      data: { trustLevel: dto.trustLevel as any },
    });
  }

  async addMember(id: string, dto: AddMemberDto) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id: dto.userId },
      data: { institutionId: id, role: dto.role as any },
    });
  }

  async updateMemberRole(id: string, userId: string, dto: UpdateMemberRoleDto) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: dto.role as any },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.institution.delete({ where: { id } });
  }
}
