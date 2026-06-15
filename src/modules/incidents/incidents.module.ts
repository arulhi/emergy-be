import { Module } from '@nestjs/common';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { IncidentsStatsService } from './incidents-stats.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [IncidentsController],
  providers: [IncidentsService, IncidentsStatsService, PrismaService],
  exports: [IncidentsService],
})
export class IncidentsModule {}
