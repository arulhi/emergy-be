import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { CitizenProfilesController } from './citizen-profiles.controller';
import { CitizenProfilesService } from './citizen-profiles.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  imports: [
    MulterModule.register({ dest: './uploads' }),
  ],
  controllers: [CitizenProfilesController],
  providers: [CitizenProfilesService, PrismaService],
  exports: [CitizenProfilesService],
})
export class CitizenProfilesModule {}
