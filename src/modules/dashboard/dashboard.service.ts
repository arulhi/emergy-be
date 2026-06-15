import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [totalUsers, totalIncidents, totalInstitutions, activeInstitutions, pendingInstitutions] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.incident.count(),
        this.prisma.institution.count(),
        this.prisma.institution.count({ where: { status: 'ACTIVE' } }),
        this.prisma.institution.count({ where: { status: 'PENDING' } }),
      ]);
    return { totalUsers, totalIncidents, totalInstitutions, activeInstitutions, pendingInstitutions };
  }

  async getIncidentTrends(months?: number) {
    const m = months || 12;
    const dateThreshold = new Date();
    dateThreshold.setMonth(dateThreshold.getMonth() - m);

    const incidents = await this.prisma.incident.findMany({
      where: { createdAt: { gte: dateThreshold } },
      select: { createdAt: true },
    });

    const trendMap: Record<string, number> = {};
    incidents.forEach((i) => {
      const month = i.createdAt.toISOString().substring(0, 7);
      trendMap[month] = (trendMap[month] || 0) + 1;
    });

    return Object.entries(trendMap)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  async getIncidentCategories() {
    const incidents = await this.prisma.incident.findMany({
      select: { type: true },
    });
    const map: Record<string, number> = {};
    incidents.forEach((i) => {
      map[i.type] = (map[i.type] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }

  async getIncidentSeverity() {
    const incidents = await this.prisma.incident.findMany({
      select: { severity: true },
    });
    const map: Record<string, number> = {};
    incidents.forEach((i) => {
      const s = i.severity || 'unknown';
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }

  async getRecentActivity(limit?: number) {
    const l = limit || 10;
    const [recentIncidents, recentUsers] = await Promise.all([
      this.prisma.incident.findMany({
        take: l,
        orderBy: { createdAt: 'desc' },
        select: { id: true, type: true, location: true, status: true, createdAt: true },
      }),
      this.prisma.user.findMany({
        take: l,
        orderBy: { createdAt: 'desc' },
        select: { id: true, username: true, role: true, createdAt: true },
      }),
    ]);

    return {
      recentIncidents: recentIncidents.map((i) => ({ ...i, type: 'incident' })),
      recentUsers: recentUsers.map((u) => ({ ...u, type: 'user' })),
    };
  }

  async getInstitutionSummary() {
    const institutions = await this.prisma.institution.findMany({
      select: { id: true, name: true, status: true, trustLevel: true, membersCount: true, verifiedReports: true },
      orderBy: { verifiedReports: 'desc' },
      take: 20,
    });

    return institutions.map((inst) => ({
      ...inst,
      incidentCount: 0,
    }));
  }

  async getRegionDistribution() {
    const incidents = await this.prisma.incident.findMany({
      select: { location: true },
    });

    const map: Record<string, number> = {};
    incidents.forEach((i) => {
      const loc = i.location || 'Unknown';
      map[loc] = (map[loc] || 0) + 1;
    });

    return Object.entries(map)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }
}
