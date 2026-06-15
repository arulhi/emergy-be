import { Module } from '@nestjs/common';
import { HotlinesController } from './hotlines.controller';
import { HotlinesService } from './hotlines.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [HotlinesController],
  providers: [HotlinesService, PrismaService],
  exports: [HotlinesService],
})
export class HotlinesModule {}
