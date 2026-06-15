import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RegionsService {
  constructor(private prisma: PrismaService) {}

  async getProvinces() {
    return this.prisma.province.findMany({ orderBy: { name: 'asc' } });
  }

  async getCities(provinceId: string) {
    return this.prisma.city.findMany({
      where: { provinceId },
      orderBy: { name: 'asc' },
    });
  }

  async getDistricts(cityId: string) {
    return this.prisma.district.findMany({
      where: { cityId },
      orderBy: { name: 'asc' },
    });
  }
}
