import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class IncidentsStatsService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [total, pending, inProgress, resolved, hoax] = await Promise.all([
      this.prisma.incident.count(),
      this.prisma.incident.count({ where: { status: 'PENDING' } }),
      this.prisma.incident.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.incident.count({ where: { status: 'RESOLVED' } }),
      this.prisma.incident.count({ where: { status: 'HOAX' } }),
    ]);
    return { total, pending, inProgress, resolved, hoax };
  }

  async getCharts(months?: number) {
    const m = months || 12;
    const dateThreshold = new Date();
    dateThreshold.setMonth(dateThreshold.getMonth() - m);

    const incidents = await this.prisma.incident.findMany({
      where: { createdAt: { gte: dateThreshold } },
      select: { type: true, severity: true, createdAt: true },
    });

    const categoryDistribution = this.groupBy(incidents, 'type');
    const severityDistribution = this.groupBy(incidents, 'severity');

    const trendMap: Record<string, number> = {};
    incidents.forEach((i) => {
      const month = i.createdAt.toISOString().substring(0, 7);
      trendMap[month] = (trendMap[month] || 0) + 1;
    });
    const monthlyTrend = Object.entries(trendMap)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return { categoryDistribution, severityDistribution, monthlyTrend };
  }

  private groupBy(items: any[], key: string) {
    const map: Record<string, number> = {};
    items.forEach((item) => {
      const val = item[key] || 'unknown';
      map[val] = (map[val] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }
}
