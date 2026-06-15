import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateModerationStatusDto, UpdateSpamReportStatusDto } from './moderation.dto';

@Injectable()
export class ModerationService {
  constructor(private prisma: PrismaService) {}

  async getContent(query: { page?: number; limit?: number; status?: string; type?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;

    const [data, total] = await Promise.all([
      this.prisma.contentItem.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.contentItem.count({ where }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getContentDetail(id: string) {
    const item = await this.prisma.contentItem.findUnique({
      where: { id },
      include: { spamReports: { orderBy: { createdAt: 'desc' } } },
    });
    if (!item) throw new NotFoundException('Content not found');
    return item;
  }

  async updateContentStatus(id: string, dto: UpdateModerationStatusDto) {
    await this.getContentDetail(id);
    return this.prisma.contentItem.update({ where: { id }, data: { status: dto.status as any } });
  }

  async getSpamReports(query: { status?: string }) {
    const where: any = {};
    if (query.status) where.status = query.status;
    return this.prisma.spamReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { contentItem: { select: { id: true, title: true } } },
    });
  }

  async getSpamReportDetail(id: string) {
    const report = await this.prisma.spamReport.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Spam report not found');
    return report;
  }

  async updateSpamReportStatus(id: string, dto: UpdateSpamReportStatusDto) {
    await this.getSpamReportDetail(id);
    return this.prisma.spamReport.update({ where: { id }, data: { status: dto.status } });
  }
}
