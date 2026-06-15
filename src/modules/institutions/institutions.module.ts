import { Module } from '@nestjs/common';
import { InstitutionsController } from './institutions.controller';
import { InstitutionsService } from './institutions.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [InstitutionsController],
  providers: [InstitutionsService, PrismaService],
  exports: [InstitutionsService],
})
export class InstitutionsModule {}
