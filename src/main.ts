import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({ origin: process.env.CORS_ORIGIN, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('Emergy API')
    .setDescription('Backend API untuk Emergy — Disaster Management System')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .addTag('Auth', 'Login, Register warga/institusi, Refresh token, Logout, Profile saya')
    .addTag('Users', 'CRUD user (superadmin). Filter: role, status, search. Paginated.')
    .addTag('Roles', 'CRUD role & permissions. Superadmin only.')
    .addTag('Institutions', 'CRUD institusi. Approve/reject, trust level, anggota, dashboard institusi.')
    .addTag('Incidents', 'CRUD insiden. Filter: type, severity, status, date. Assign, charts, stats.')
    .addTag('Hotlines', 'CRUD nomor darurat. Filter: type, status, institution.')
    .addTag('Coverage Areas', 'CRUD area cakupan institusi. Filter: institution, status.')
    .addTag('Social Posts', 'CRUD postingan sosial institusi. Like, comment, reply.')
    .addTag('Citizen Profiles', 'CRUD profil warga. Upload avatar, public profile.')
    .addTag('Citizen Posts', 'Feed publik. CRUD post + upvote + urgent + report + comment + reply. Auto-assign incident.')
    .addTag('Emergency Contacts', 'CRUD kontak darurat. Endpoint publik tanpa auth.')
    .addTag('SOS Logs', 'CRUD log SOS warga. Filter by user.')
    .addTag('Moderation', 'Moderasi konten & spam reports. Approve/flag/remove.')
    .addTag('Categories', 'CRUD kategori insiden (tree/parent-child).')
    .addTag('Data Records', 'Generic CRUD — data records')
    .addTag('Dashboard', 'Statistik agregat: total users, incidents, institutions, trends, charts.')
    .addTag('Regions', 'Wilayah Indonesia: provinces, cities, districts. Publik.')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
