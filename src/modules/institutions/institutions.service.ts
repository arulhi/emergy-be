import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { CreateInstitutionDto, UpdateInstitutionDto, UpdateInstitutionStatusDto, UpdateTrustLevelDto, AddMemberDto, UpdateMemberRoleDto, ResetPasswordDto } from './institutions.dto';

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
      this.prisma.institution.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { emergencyContacts: true } }),
      this.prisma.institution.count({ where }),
    ]);

    const enriched = await this.enrichWithRegionNames(data);

    return {
      data: enriched,
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
      include: { users: { select: { id: true, username: true, email: true, name: true, role: true } }, emergencyContacts: true },
    });
    if (!institution) throw new NotFoundException('Institution not found');
    const enriched = await this.enrichWithRegionNames([institution]);
    return enriched[0];
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
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.contactEmail },
    });
    if (existing) throw new ConflictException('Email already exists');

    const defaultPassword = crypto.randomBytes(4).toString('hex');
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const now = new Date();

    const institution = await this.prisma.institution.create({
      data: {
        name: dto.name,
        type: dto.type,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        address: dto.address,
        status: (dto.status || 'ACTIVE') as any,
        province: dto.province || dto.selectedProvince,
        city: dto.city || dto.selectedCity,
        district: dto.district || dto.selectedDistrict,
        regionId: dto.regionId,
        joinDate: now,
      },
    });

    if (dto.emergencyContacts?.length) {
      await this.prisma.emergencyContact.createMany({
        data: dto.emergencyContacts.map(c => ({
          name: c.name,
          type: c.type || 'OTHER',
          phone: c.phone,
          address: c.address,
          city: c.city,
          institutionId: institution.id,
        })),
      });
    }

    const username = dto.name.toLowerCase().replace(/\s+/g, '_') + '_admin';

    await this.prisma.user.create({
      data: {
        username,
        email: dto.contactEmail || `${username}@emergy.my.id`,
        password: hashedPassword,
        name: dto.name,
        role: 'INSTITUTION_ADMIN',
        institutionId: institution.id,
      },
    });

    return {
      ...institution,
      defaultPassword,
      message: 'Institution created successfully. Share the default password with the institution admin.',
    };
  }

  async update(id: string, dto: UpdateInstitutionDto) {
    await this.findOne(id);

    const { selectedProvince, selectedCity, selectedDistrict, emergencyContacts, ...rest } = dto;
    const data: any = { ...rest };
    if (selectedProvince) data.province = selectedProvince;
    if (selectedCity) data.city = selectedCity;
    if (selectedDistrict) data.district = selectedDistrict;

    if (emergencyContacts !== undefined) {
      await this.prisma.emergencyContact.deleteMany({ where: { institutionId: id } });
      if (emergencyContacts.length) {
        await this.prisma.emergencyContact.createMany({
          data: emergencyContacts.map(c => ({
            name: c.name,
            type: c.type || 'OTHER',
            phone: c.phone,
            address: c.address,
            city: c.city,
            institutionId: id,
          })),
        });
      }
    }

    return this.prisma.institution.update({ where: { id }, data });
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

  async resetPassword(id: string, dto: ResetPasswordDto) {
    const institution = await this.findOne(id);
    const adminUser = await this.prisma.user.findFirst({
      where: { institutionId: id, role: 'INSTITUTION_ADMIN' },
    });
    if (!adminUser) throw new NotFoundException('No admin user found for this institution');

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: adminUser.id },
      data: { password: hashedPassword },
    });

    return { message: 'Password reset successfully' };
  }

  private async enrichWithRegionNames(items: any[]) {
    const provinceIds = [...new Set(items.map(i => i.province).filter(Boolean))];
    const cityIds = [...new Set(items.map(i => i.city).filter(Boolean))];
    const districtIds = [...new Set(items.map(i => i.district || i.regionId).filter(Boolean))];

    const [provinces, cities, districts] = await Promise.all([
      provinceIds.length ? this.prisma.province.findMany({ where: { id: { in: provinceIds } } }) : [],
      cityIds.length ? this.prisma.city.findMany({ where: { id: { in: cityIds } } }) : [],
      districtIds.length ? this.prisma.district.findMany({ where: { id: { in: districtIds } } }) : [],
    ]);

    const provMap = Object.fromEntries(provinces.map(p => [p.id, p.name]));
    const cityMap = Object.fromEntries(cities.map(c => [c.id, c.name]));
    const distMap = Object.fromEntries(districts.map(d => [d.id, d.name]));

    return items.map(item => ({
      ...item,
      provinceName: provMap[item.province] || null,
      cityName: cityMap[item.city] || null,
      districtName: distMap[item.district || item.regionId] || null,
    }));
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.institution.delete({ where: { id } });
  }
}
