import { Module } from '@nestjs/common';
import { RegionsController } from './regions.controller';
import { RegionsService } from './regions.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [RegionsController],
  providers: [RegionsService, PrismaService],
  exports: [RegionsService],
})
export class RegionsModule {}
