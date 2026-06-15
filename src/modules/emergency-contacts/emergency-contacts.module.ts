import { Module } from '@nestjs/common';
import { EmergencyContactsController } from './emergency-contacts.controller';
import { EmergencyContactsService } from './emergency-contacts.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [EmergencyContactsController],
  providers: [EmergencyContactsService, PrismaService],
  exports: [EmergencyContactsService],
})
export class EmergencyContactsModule {}
