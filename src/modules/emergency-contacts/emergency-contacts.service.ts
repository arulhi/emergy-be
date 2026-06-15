import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateEmergencyContactDto, UpdateEmergencyContactDto } from './emergency-contacts.dto';

@Injectable()
export class EmergencyContactsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { type?: string; city?: string }) {
    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.city) where.city = { contains: query.city, mode: 'insensitive' };
    return this.prisma.emergencyContact.findMany({ where, orderBy: { name: 'asc' } });
  }

  async findPublic(query: { city?: string }) {
    const where: any = {};
    if (query.city) where.city = { contains: query.city, mode: 'insensitive' };
    return this.prisma.emergencyContact.findMany({ where, orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const contact = await this.prisma.emergencyContact.findUnique({ where: { id } });
    if (!contact) throw new NotFoundException('Emergency contact not found');
    return contact;
  }

  async create(dto: CreateEmergencyContactDto) {
    return this.prisma.emergencyContact.create({ data: dto as any });
  }

  async update(id: string, dto: UpdateEmergencyContactDto) {
    await this.findOne(id);
    return this.prisma.emergencyContact.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.emergencyContact.delete({ where: { id } });
  }
}
