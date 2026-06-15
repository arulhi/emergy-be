import { Module } from '@nestjs/common';
import { SocialPostsController } from './social-posts.controller';
import { SocialPostsService } from './social-posts.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [SocialPostsController],
  providers: [SocialPostsService, PrismaService],
  exports: [SocialPostsService],
})
export class SocialPostsModule {}
