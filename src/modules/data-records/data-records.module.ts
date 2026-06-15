import { Module } from '@nestjs/common';
import { DataRecordsController } from './data-records.controller';
import { DataRecordsService } from './data-records.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [DataRecordsController],
  providers: [DataRecordsService, PrismaService],
  exports: [DataRecordsService],
})
export class DataRecordsModule {}
