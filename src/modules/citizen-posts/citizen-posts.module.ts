import { Module } from '@nestjs/common';
import { CitizenPostsController } from './citizen-posts.controller';
import { CitizenPostsService } from './citizen-posts.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [CitizenPostsController],
  providers: [CitizenPostsService, PrismaService],
  exports: [CitizenPostsService],
})
export class CitizenPostsModule {}
