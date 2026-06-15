import { Module } from '@nestjs/common';
import { SosLogsController } from './sos-logs.controller';
import { SosLogsService } from './sos-logs.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [SosLogsController],
  providers: [SosLogsService, PrismaService],
  exports: [SosLogsService],
})
export class SosLogsModule {}
