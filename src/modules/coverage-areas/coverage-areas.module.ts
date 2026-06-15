import { Module } from '@nestjs/common';
import { CoverageAreasController } from './coverage-areas.controller';
import { CoverageAreasService } from './coverage-areas.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [CoverageAreasController],
  providers: [CoverageAreasService, PrismaService],
  exports: [CoverageAreasService],
})
export class CoverageAreasModule {}
