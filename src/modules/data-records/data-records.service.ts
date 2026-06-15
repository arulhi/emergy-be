import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateDataRecordDto, UpdateDataRecordDto } from './data-records.dto';

@Injectable()
export class DataRecordsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; type?: string; status?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.dataRecord.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.dataRecord.count({ where }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const record = await this.prisma.dataRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Data record not found');
    return record;
  }

  async create(dto: CreateDataRecordDto) {
    return this.prisma.dataRecord.create({ data: dto as any });
  }

  async update(id: string, dto: UpdateDataRecordDto) {
    await this.findOne(id);
    return this.prisma.dataRecord.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.dataRecord.delete({ where: { id } });
  }
}
