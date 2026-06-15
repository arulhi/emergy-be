import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { PrismaService } from './database/prisma.service';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { InstitutionsModule } from './modules/institutions/institutions.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { HotlinesModule } from './modules/hotlines/hotlines.module';
import { CoverageAreasModule } from './modules/coverage-areas/coverage-areas.module';
import { SocialPostsModule } from './modules/social-posts/social-posts.module';
import { CitizenProfilesModule } from './modules/citizen-profiles/citizen-profiles.module';
import { CitizenPostsModule } from './modules/citizen-posts/citizen-posts.module';
import { EmergencyContactsModule } from './modules/emergency-contacts/emergency-contacts.module';
import { SosLogsModule } from './modules/sos-logs/sos-logs.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { DataRecordsModule } from './modules/data-records/data-records.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { RegionsModule } from './modules/regions/regions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    RolesModule,
    InstitutionsModule,
    IncidentsModule,
    HotlinesModule,
    CoverageAreasModule,
    SocialPostsModule,
    CitizenProfilesModule,
    CitizenPostsModule,
    EmergencyContactsModule,
    SosLogsModule,
    ModerationModule,
    CategoriesModule,
    DataRecordsModule,
    DashboardModule,
    RegionsModule,
  ],
  controllers: [AppController],
  providers: [
    PrismaService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
  exports: [PrismaService],
})
export class AppModule {}
