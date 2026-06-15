# PLAN BACKEND — Emergy API

**NestJS + Prisma + PostgreSQL — Melayani Superadmin, Institution, dan Public User**

---

## 1. Arsitektur

```
┌──────────────────────────────────────────────────┐
│  Frontend (Next.js) — Vercel                      │
│  NEXT_PUBLIC_API_BASE_URL = http://localhost:3001 │
│  Semua data via _services/*.service.ts → Axios    │
│  TIDAK ADA localStorage untuk CRUD data lagi      │
│  Auth via JWT (access + refresh token)            │
└──────────────────────┬───────────────────────────┘
                       │ HTTPS
┌──────────────────────▼───────────────────────────┐
│  Backend (NestJS) — Railway / Render              │
│  Port 3001                                        │
│  Auth: @nestjs/jwt + passport                     │
│  ORM: Prisma → PostgreSQL                         │
│  File/Image → S3-compatible (opsional)            │
│  Realtime: WebSocket / SSE (opsional)             │
└──────────────────────────────────────────────────┘
```

---

## 2. Mapping Complete localStorage → API

### 2.1 Superadmin Dashboard Domain (`lib/localStorage.ts` + `lib/emergy-mock.ts`)

| # | localStorage Key | Interface Source | Halaman FE | Backend Module | Prioritas |
|---|-----------------|-----------------|------------|----------------|-----------|
| 1 | `app_users` | `user.interface.ts` + `emergy-mock.ts` | `/users`, `/users/[id]` | **Users** | P0 |
| 2 | `app_roles` | `user.interface.ts` | `/roles` | **Roles** | P0 |
| 3 | `app_current_user` | `user.interface.ts` | — (auth) | **Auth** | P0 |
| 4 | `app_incidents` | `localStorage.ts:IncidentReport` | `/incidents`, `/dashboard` | **Incidents** | P0 |
| 5 | `institutions` (mock) | `emergy-mock.ts:Institution` | `/institutions`, register | **Institutions** | P0 |
| 6 | `app_hotlines` | `localStorage.ts:Hotline` | `/institution/hotlines` | **Hotlines** | P0 |
| 7 | `app_social_posts` | `localStorage.ts:SocialPost` | `/institution/social` | **SocialPosts** | P0 |
| 8 | `app_coverage_areas` | `localStorage.ts:CoverageAreaRecord` | `/institution/areas` | **CoverageAreas** | P0 |
| 9 | `app_social_comments` | `localStorage.ts:SocialComment` | `/institution/social` | **SocialPosts** | P0 |
| 10 | — (mock data) | `emergy-mock.ts:ContentItem` | `/moderation` | **Moderation** | P1 |
| 12 | — (mock data) | `emergy-mock.ts:SpamReport` | `/moderation` | **Moderation** | P1 |
| 13 | — (mock data) | `emergy-mock.ts:Category` | `/master-data` | **Categories** | P1 |
| 14 | — (mock data) | — | `/dashboard` | **Dashboard** (aggregated) | P0 |
| 15 | — (mock data) | — | `/data` | **DataRecords** (custom CRUD) | P2 |
| 16 | — (mock data) | — | `/calendar` | *(frontend-only calendar)* | P2 |

### 2.2 Institution Domain (`lib/localStorage.ts`)

Halaman di `/app/institution/`:

| Halaman | localStorage Key | Backend Module |
|---------|-----------------|----------------|
| `/institution/dashboard` | `app_incidents` (aggregated) | Incidents + Dashboard |
| `/institution/incidents` | `app_incidents` | Incidents |
| `/institution/hotlines` | `app_hotlines` | Hotlines |
| `/institution/areas` | `app_coverage_areas` | CoverageAreas |
| `/institution/social` | `app_social_posts` + `app_social_comments` | SocialPosts |

### 2.3 Public Citizen Domain (`lib/publicStorage.ts` + `lib/public-mock.ts`)

| # | localStorage Key | Interface Source | Halaman FE | Backend Module | Prioritas |
|---|-----------------|-----------------|------------|----------------|-----------|
| 17 | `app_citizen_posts` | `public-mock.ts:CitizenPost` | `/feed`, `/feed/[id]`, `/create` | **CitizenPosts** | P0 |
| 18 | `app_citizen_comments` | `public-mock.ts:CitizenComment` | `/feed/[id]` | **CitizenPosts** (nested) | P0 |
| 19 | `app_citizen_profiles` | `public-mock.ts:CitizenProfile` | `/profile`, `/feed` | **CitizenProfiles** | P0 |
| 20 | `app_current_citizen` | `public-mock.ts:CitizenProfile` | — (auth) | **Auth** | P0 |
| 21 | `app_emergency_contacts` | `public-mock.ts:EmergencyContact` | `/contacts`, `/feed` | **EmergencyContacts** | P1 |
| 22 | `app_sos_logs` | `public-mock.ts:SOSLog` | `/feed` | **SOSLogs** | P1 |
| 23 | `app_hoax_reports` | *(inline in publicStorage.ts)* | `/feed` | **CitizenPosts** (report) | P1 |

### 2.4 Infrastructure / Lainnya

| File | Kegunaan | Backend Strategy |
|------|----------|-----------------|
| `lib/region-service.ts` | Fetch wilayah dari emsifa API | **RegionsModule** — seed data ke DB dari API eksternal |
| `lib/region-data.ts` | Static fallback wilayah Indonesia | **RegionsModule** — seed langsung |
| `lib/realtime.ts` | SSE untuk live feed | **Opsional** — bisa via WebSocket atau polling |
| `lib/rbac.ts` | Cek permission user | **RolesModule** + Guards |
| `store/authStore.ts` | Zustand auth state | Tetap di FE (hanya status, token via cookie) |
| `store/globalStore.ts` | Zustand global (title, theme) | Tetap di FE |
| `_network/request.ts` | Axios instance + interceptor | Tetap dipakai |
| `_services/login-api.services.ts` | Login service (mock fallback) | Diganti panggil Auth API |
| `proto/auth/auth.proto` | Protobuf definisi auth | **Tidak dipakai** — REST/JSON saja |

---

## 3. NestJS Module Structure

```
src/
├── main.ts
├── app.module.ts
├── app.controller.ts              # Health check: GET /api/health
│
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts    # @CurrentUser()
│   │   ├── roles.decorator.ts           # @Roles('SUPERADMIN')
│   │   └── public.decorator.ts          # @Public() — skip JWT
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── interceptors/
│   │   ├── transform.interceptor.ts     # Seragamkan response { statusCode, message, data, meta }
│   │   └── logging.interceptor.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── pipes/
│   │   └── validation.pipe.ts           # class-validator global
│   └── interfaces/
│       └── api-response.interface.ts    # IApiResponse<T>, IPaginatedMeta
│
├── modules/
│   ├── auth/                 # Login, Register, Refresh, Logout
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.dto.ts
│   │   └── strategies/
│   │       ├── jwt.strategy.ts
│   │       └── jwt-refresh.strategy.ts
│   │
│   ├── users/                # CRUD User (Superadmin only)
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.dto.ts
│   │   └── entities/user.entity.ts
│   │
│   ├── roles/                # CRUD Role & Permissions
│   │   ├── roles.module.ts
│   │   ├── roles.controller.ts
│   │   ├── roles.service.ts
│   │   ├── roles.dto.ts
│   │   └── entities/role.entity.ts
│   │
│   ├── institutions/         # CRUD Institution
│   │   ├── institutions.module.ts
│   │   ├── institutions.controller.ts
│   │   ├── institutions.service.ts
│   │   ├── institutions.dto.ts
│   │   └── entities/institution.entity.ts
│   │
│   ├── incidents/            # CRUD Incident + Stats
│   │   ├── incidents.module.ts
│   │   ├── incidents.controller.ts
│   │   ├── incidents.service.ts
│   │   ├── incidents.dto.ts
│   │   ├── entities/incident.entity.ts
│   │   └── incidents-stats.service.ts
│   │
│   ├── hotlines/             # CRUD Hotline
│   │   ├── hotlines.module.ts
│   │   ├── hotlines.controller.ts
│   │   ├── hotlines.service.ts
│   │   ├── hotlines.dto.ts
│   │   └── entities/hotline.entity.ts
│   │
│   ├── coverage-areas/       # CRUD Coverage Area
│   │   ├── coverage-areas.module.ts
│   │   ├── coverage-areas.controller.ts
│   │   ├── coverage-areas.service.ts
│   │   ├── coverage-areas.dto.ts
│   │   └── entities/coverage-area.entity.ts
│   │
│   ├── social-posts/         # CRUD Social Post + Comment + Reply
│   │   ├── social-posts.module.ts
│   │   ├── social-posts.controller.ts
│   │   ├── social-posts.service.ts
│   │   ├── social-posts.dto.ts
│   │   └── entities/
│   │       ├── social-post.entity.ts
│   │       ├── social-comment.entity.ts
│   │       └── social-reply.entity.ts
│   │
│   ├── citizen-profiles/     # CRUD Citizen Profile
│   │   ├── citizen-profiles.module.ts
│   │   ├── citizen-profiles.controller.ts
│   │   ├── citizen-profiles.service.ts
│   │   ├── citizen-profiles.dto.ts
│   │   └── entities/citizen-profile.entity.ts
│   │
│   ├── citizen-posts/        # CRUD Citizen Post + Comment + Reply + Upvote + Report
│   │   ├── citizen-posts.module.ts
│   │   ├── citizen-posts.controller.ts
│   │   ├── citizen-posts.service.ts
│   │   ├── citizen-posts.dto.ts
│   │   └── entities/
│   │       ├── citizen-post.entity.ts
│   │       ├── citizen-comment.entity.ts
│   │       ├── citizen-reply.entity.ts
│   │       └── hoax-report.entity.ts
│   │

│   ├── emergency-contacts/   # CRUD Emergency Contact
│   │   ├── emergency-contacts.module.ts
│   │   ├── emergency-contacts.controller.ts
│   │   ├── emergency-contacts.service.ts
│   │   ├── emergency-contacts.dto.ts
│   │   └── entities/emergency-contact.entity.ts
│   │
│   ├── sos-logs/             # SOS Log
│   │   ├── sos-logs.module.ts
│   │   ├── sos-logs.controller.ts
│   │   ├── sos-logs.service.ts
│   │   ├── sos-logs.dto.ts
│   │   └── entities/sos-log.entity.ts
│   │
│   ├── moderation/           # Content moderation + spam reports
│   │   ├── moderation.module.ts
│   │   ├── moderation.controller.ts
│   │   ├── moderation.service.ts
│   │   └── entities/
│   │       ├── content-item.entity.ts
│   │       └── spam-report.entity.ts
│   │
│   ├── categories/           # Incident categories
│   │   ├── categories.module.ts
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   ├── categories.dto.ts
│   │   └── entities/category.entity.ts
│   │
│   ├── data-records/         # Generic data CRUD (halaman /data)
│   │   ├── data-records.module.ts
│   │   ├── data-records.controller.ts
│   │   ├── data-records.service.ts
│   │   └── entities/data-record.entity.ts
│   │
│   ├── dashboard/            # Aggregated stats
│   │   ├── dashboard.module.ts
│   │   ├── dashboard.controller.ts
│   │   └── dashboard.service.ts
│   │
│   └── regions/              # Wilayah Indonesia (Province, City, District)
│       ├── regions.module.ts
│       ├── regions.controller.ts
│       ├── regions.service.ts
│       ├── regions.dto.ts
│       ├── entities/
│       │   ├── province.entity.ts
│       │   ├── city.entity.ts
│       │   └── district.entity.ts
│       └── regions.seeder.ts     # Seed 38 provinsi dari API/static
│
└── database/
    ├── prisma.service.ts     # Injectable PrismaClient
    └── seed.ts               # Seed semua master data
```

### main.ts — Bootstrap + Swagger

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({ origin: process.env.CORS_ORIGIN, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // Swagger — lihat Section 8.3 untuk versi lengkap
  const config = new DocumentBuilder()
    .setTitle('Emergy API')
    .setDescription('Backend API untuk Emergy — Disaster Management System')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .addTag('Auth', 'Login, Register, Refresh, Logout, Me')
    .addTag('Users', 'CRUD user — superadmin')
    .addTag('Roles', 'CRUD role & permissions')
    .addTag('Institutions', 'CRUD institusi, approve, members')
    .addTag('Incidents', 'CRUD insiden, stats, charts, assign')
    .addTag('Hotlines', 'CRUD hotline')
    .addTag('Coverage Areas', 'CRUD area cakupan')
    .addTag('Social Posts', 'CRUD postingan institusi, like, comment')
    .addTag('Citizen Profiles', 'CRUD profil warga, avatar')
    .addTag('Citizen Posts', 'CRUD feed publik, upvote, report, comment')
    .addTag('Emergency Contacts', 'CRUD kontak darurat')
    .addTag('SOS Logs', 'CRUD log SOS')
    .addTag('Moderation', 'Moderasi konten & spam')
    .addTag('Categories', 'CRUD kategori insiden')
    .addTag('Data Records', 'CRUD data records')
    .addTag('Dashboard', 'Statistik agregat')
    .addTag('Regions', 'Wilayah Indonesia')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
```

---

## 4. Prisma Schema — Lengkap

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================
// AUTH & USERS
// ============================================================

enum UserRole {
  SUPERADMIN
  ADMIN
  INSTITUTION_ADMIN
  INSTITUTION_STAFF
  CITIZEN
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

model User {
  id            String      @id @default(cuid())
  username      String      @unique
  email         String      @unique
  password      String
  role          UserRole    @default(CITIZEN)
  status        UserStatus  @default(ACTIVE)
  refreshToken  String?
  name          String?     // Nama lengkap (untuk institution users)
  institutionId String?
  institution   Institution? @relation(fields: [institutionId], references: [id])
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  incidentsReported Incident[]    @relation("ReportedIncidents")
  incidentsAssigned Incident[]    @relation("AssignedIncidents")
  messages          Message[]
  notifications     Notification[]

  @@map("users")
}

// ============================================================
// ROLES & PERMISSIONS
// ============================================================

model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  permissions Json     // String[] — e.g. ["users:view", "users:create", ...]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("roles")
}

// ============================================================
// INSTITUTIONS
// ============================================================

enum InstitutionStatus {
  ACTIVE
  PENDING
  REJECTED
  SUSPENDED
}

enum TrustLevel {
  NONE
  BRONZE
  SILVER
  GOLD
  PLATINUM
}

model Institution {
  id              String             @id @default(cuid())
  name            String
  type            String             // Government, Non-Profit, Healthcare, Education, Media, Community
  status          InstitutionStatus  @default(PENDING)
  trustLevel      TrustLevel         @default(NONE)
  membersCount    Int                @default(0)
  verifiedReports Int                @default(0)
  joinDate        DateTime           @default(now())
  contactEmail    String?
  contactPhone    String?
  address         String?
  province        String?
  city            String?
  district        String?
  regionId        String?
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  users            User[]
  incidents        Incident[]
  hotlines         Hotline[]
  coverageAreas    CoverageArea[]
  socialPosts      SocialPost[]
  emergencyContacts EmergencyContact[]

  @@map("institutions")
}

// ============================================================
// INCIDENTS
// ============================================================

enum IncidentSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum IncidentStatus {
  PENDING
  IN_PROGRESS
  RESOLVED
  HOAX
}

enum IncidentSource {
  ADMIN
  SOCIAL
  HOTLINE
  CITIZEN
}

model Incident {
  id            String           @id @default(cuid())
  type          String           // fire, flood, accident, medical, crime, earthquake, other
  location      String           // Alamat lengkap
  reporter      String           // Nama pelapor
  description   String?
  media         Json?            // [{ type: "photo"|"url"|"video", url, name }]
  status        IncidentStatus   @default(PENDING)
  source        IncidentSource   @default(CITIZEN)
  severity      IncidentSeverity @default(MEDIUM)
  title         String?
  reportedById  String?
  reportedBy    User?            @relation("ReportedIncidents", fields: [reportedById], references: [id])
  institutionId String?
  institution   Institution?     @relation(fields: [institutionId], references: [id])
  assignedToId  String?
  assignedTo    User?            @relation("AssignedIncidents", fields: [assignedToId], references: [id])
  citizenPostId String?          @unique
  citizenPost   CitizenPost?     @relation(fields: [citizenPostId], references: [id])
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  createdBy     String?

  @@map("incidents")
}

// ============================================================
// HOTLINES
// ============================================================

enum HotlineType {
  POLICE
  HOSPITAL
  FIRE
  SAR
  PLN
  BNPB
  BPBD
  EMERGENCY
  FLOOD
  MEDICAL
  INFORMATION
  OTHER
}

model Hotline {
  id            String      @id @default(cuid())
  name          String
  number        String      // Nomor telepon
  coverage      Json?       // CoverageArea[] — [{ provinceId, provinceName, cityId, cityName, districtId, districtName }]
  serviceType   String?     // Emergency, Flood, Fire, Medical, Information, dll
  operatingHours String?    // "24/7" | "08:00 - 20:00"
  status        String      @default("active")
  type          HotlineType? @default(OTHER)
  phone         String?     // Alias untuk number
  location      String?
  address       String?
  lat           Float?
  lng           Float?
  city          String?
  source        String?     // "institution" | "system"
  institutionId String?
  institution   Institution? @relation(fields: [institutionId], references: [id])
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@map("hotlines")
}

// ============================================================
// COVERAGE AREAS
// ============================================================

model CoverageArea {
  id            String      @id @default(cuid())
  name          String
  coverage      Json?       // CoverageArea[] — [{ provinceId, provinceName, cityId, cityName, districtId, districtName }]
  status        String      @default("active")
  latitude      Float?
  longitude     Float?
  type          String?     // "province" | "city" | "district"
  institutionId String
  institution   Institution @relation(fields: [institutionId], references: [id])
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  createdBy     String?

  @@map("coverage_areas")
}

// ============================================================
// SOCIAL POSTS (Institution social feed)
// ============================================================

enum SocialPostType {
  WARNING
  UPDATE
  BROADCAST
  INFO
  NEWS
  TIPS
  ALERT
  THANK_YOU
}

model SocialPost {
  id            String         @id @default(cuid())
  author        String         // Nama institusi
  institution   String         // Nama institusi
  caption       String
  media         Json?          // [{ type: "image"|"video", url, name }]
  type          SocialPostType @default(UPDATE)
  likes         Json           @default("[]") // String[] of user IDs
  createdBy     String
  institutionId String
  institution   Institution    @relation(fields: [institutionId], references: [id])
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  comments      SocialComment[]

  @@map("social_posts")
}

model SocialComment {
  id        String       @id @default(cuid())
  postId    String
  post      SocialPost   @relation(fields: [postId], references: [id], onDelete: Cascade)
  author    String
  content   String
  createdBy String
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  replies   SocialReply[]

  @@map("social_comments")
}

model SocialReply {
  id        String       @id @default(cuid())
  commentId String
  comment   SocialComment @relation(fields: [commentId], references: [id], onDelete: Cascade)
  author    String
  content   String
  createdBy String
  createdAt DateTime     @default(now())

  @@map("social_replies")
}

// ============================================================
// EMERGENCY CONTACTS
// ============================================================

model EmergencyContact {
  id            String      @id @default(cuid())
  name          String
  type          String      // police, hospital, fire, sar, pln, bnpb, bpbd
  phone         String
  address       String?
  city          String?
  lat           Float?
  lng           Float?
  institutionId String?
  institution   Institution? @relation(fields: [institutionId], references: [id])
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@map("emergency_contacts")
}

// ============================================================
// CITIZEN PROFILES
// ============================================================

model CitizenProfile {
  id          String   @id @default(cuid())
  name        String
  username    String   @unique
  email       String   @unique
  phone       String?
  avatar      String?
  bio         String?
  province    String?
  city        String?
  district    String?
  postsCount  Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  posts       CitizenPost[]
  comments    CitizenComment[]
  replies     CitizenReply[]
  sosLogs     SosLog[]

  @@map("citizen_profiles")
}

// ============================================================
// CITIZEN POSTS (Public feed)
// ============================================================

enum PostStatus {
  PUBLISHED
  VERIFIED
  RESOLVED
  HOAX
}

model CitizenPost {
  id                  String     @id @default(cuid())
  caption             String
  media               Json?      // [{ type: "image"|"video", url, name }]
  category            String     // fire, flood, accident, medical, crime, earthquake, other
  location            Json?      // { lat, lng, address, province, city, district }
  urgency             String     @default("normal") // "normal" | "urgent"
  upvotes             Json       @default("[]")     // String[] of citizen IDs
  urgentVotes         Json       @default("[]")     // String[] of citizen IDs
  status              PostStatus @default(PUBLISHED)
  assignedInstitution String?    // Institution name (denormalized)
  institutionResponse String?
  createdById         String
  createdBy           CitizenProfile @relation(fields: [createdById], references: [id])
  createdAt           DateTime   @default(now())
  updatedAt           DateTime   @updatedAt

  comments            CitizenComment[]
  incident            Incident?

  @@map("citizen_posts")
}

model CitizenComment {
  id          String         @id @default(cuid())
  content     String
  postId      String
  post        CitizenPost    @relation(fields: [postId], references: [id], onDelete: Cascade)
  createdById String
  createdBy   CitizenProfile @relation(fields: [createdById], references: [id])
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  replies     CitizenReply[]

  @@map("citizen_comments")
}

model CitizenReply {
  id          String         @id @default(cuid())
  content     String
  commentId   String
  comment     CitizenComment @relation(fields: [commentId], references: [id], onDelete: Cascade)
  createdById String
  createdBy   CitizenProfile @relation(fields: [createdById], references: [id])
  createdAt   DateTime       @default(now())

  @@map("citizen_replies")
}

model HoaxReport {
  id          String   @id @default(cuid())
  postId      String
  post        CitizenPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  reason      String
  reportedBy  String
  createdAt   DateTime @default(now())

  @@map("hoax_reports")
}

// ============================================================
// SOS LOGS
// ============================================================

model SosLog {
  id        String   @id @default(cuid())
  userId    String?
  userName  String?
  location  Json?    // { lat, lng, address }
  contacted String?
  profileId String?
  profile   CitizenProfile? @relation(fields: [profileId], references: [id])
  createdAt DateTime @default(now())

  @@map("sos_logs")
}

// ============================================================
// MODERATION (Content moderation & spam reports)
// ============================================================

enum ModerationStatus {
  PENDING
  APPROVED
  FLAGGED
  REMOVED
}

model ContentItem {
  id            String           @id @default(cuid())
  title         String
  type          String           // post, comment, image, report
  author        String
  institution   String
  reportsCount  Int              @default(0)
  aiScore       Json?            // { overallRisk, hoaxProbability, spamProbability, confidence }
  status        ModerationStatus @default(PENDING)
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  spamReports   SpamReport[]

  @@map("content_items")
}

model SpamReport {
  id            String   @id @default(cuid())
  contentTitle  String
  contentType   String   // post, comment, report
  reporter      String
  reason        String
  isBulk        Boolean  @default(false)
  relatedCount  Int      @default(0)
  status        String   @default("pending")
  contentItemId String?
  contentItem   ContentItem? @relation(fields: [contentItemId], references: [id])
  createdAt     DateTime @default(now())

  @@map("spam_reports")
}

// ============================================================
// CATEGORIES (Incident categories hierarkis)
// ============================================================

model Category {
  id          String   @id @default(cuid())
  name        String
  description String?
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  parentId    String?
  parent      Category?  @relation("CategoryParent", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryParent")
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@map("categories")
}

// ============================================================
// DATA RECORDS (Generic CRUD untuk halaman /data)
// ============================================================

model DataRecord {
  id        String   @id @default(cuid())
  title     String
  type      String   // Kategori record
  content   Json?    // Flexible content field
  status    String   @default("active")
  userId    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("data_records")
}

// ============================================================
// REGIONS (Wilayah Indonesia)
// ============================================================

model Province {
  id   String @id
  name String

  cities City[]

  @@map("provinces")
}

model City {
  id         String @id
  name       String
  provinceId String
  province   Province @relation(fields: [provinceId], references: [id])

  districts District[]

  @@map("cities")
}

model District {
  id     String @id
  name   String
  cityId String
  city   City @relation(fields: [cityId], references: [id])

  @@map("districts")
}

// ============================================================
// MESSAGES / CHAT (Future — untuk diskusi internal)
// ============================================================

model Discussion {
  id          String    @id @default(cuid())
  title       String?
  participants Json     // String[] of user IDs
  updatedAt   DateTime  @updatedAt
  createdAt   DateTime  @default(now())

  messages    Message[]

  @@map("discussions")
}

model Message {
  id           String     @id @default(cuid())
  content      String
  type         String     @default("text")
  media        Json?
  discussionId String
  discussion   Discussion @relation(fields: [discussionId], references: [id], onDelete: Cascade)
  senderId     String
  sender       User       @relation(fields: [senderId], references: [id])
  createdAt    DateTime   @default(now())

  @@map("messages")
}

// ============================================================
// NOTIFICATIONS (Future — untuk notifikasi realtime)
// ============================================================

model Notification {
  id        String   @id @default(cuid())
  type      String
  title     String
  message   String
  read      Boolean  @default(false)
  link      String?
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())

  @@map("notifications")
}
```

---

## 5. API Endpoints — Complete per Module

### 5.1 Auth

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `POST` | `/auth/register-citizen` | Public | Register warga |
| `POST` | `/auth/register-institution` | Public | Register institusi baru |
| `POST` | `/auth/login` | Public | Login → JWT |
| `POST` | `/auth/refresh` | Public | Refresh token |
| `POST` | `/auth/logout` | Authenticated | Hapus refresh token |
| `GET` | `/auth/me` | Authenticated | Profile user saat ini |

### 5.2 Users (Superadmin)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/users` | Superadmin/Admin | List (paginated, filter: role, status, search) |
| `GET` | `/users/:id` | Superadmin/Admin | Detail |
| `POST` | `/users` | Superadmin/Admin | Create |
| `PUT` | `/users/:id` | Superadmin/Admin | Update |
| `PATCH` | `/users/:id/status` | Superadmin | Suspend/activate |
| `DELETE` | `/users/:id` | Superadmin | Delete |

### 5.3 Roles (Superadmin)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/roles` | Authenticated | List |
| `GET` | `/roles/:id` | Authenticated | Detail |
| `POST` | `/roles` | Superadmin | Create |
| `PUT` | `/roles/:id` | Superadmin | Update + permissions |
| `DELETE` | `/roles/:id` | Superadmin | Delete |

### 5.4 Institutions

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/institutions` | Authenticated | List (paginated, filter: status, type, search) |
| `GET` | `/institutions/stats` | Authenticated | Summary stats |
| `GET` | `/institutions/:id` | Authenticated | Detail |
| `GET` | `/institutions/:id/dashboard` | Institution | Dashboard stats spesifik institusi |
| `GET` | `/institutions/:id/incidents` | Institution | Incidents milik institusi |
| `GET` | `/institutions/:id/members` | Institution | Anggota institusi |
| `POST` | `/institutions` | Superadmin | Create |
| `PUT` | `/institutions/:id` | Superadmin/Admin | Update |
| `PATCH` | `/institutions/:id/status` | Superadmin | Approve/reject/suspend |
| `PATCH` | `/institutions/:id/trust-level` | Superadmin | Update trust level |
| `DELETE` | `/institutions/:id` | Superadmin | Delete |

### 5.5 Incidents

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/incidents` | Authenticated | List (paginated, filter: type, severity, status, date, source) |
| `GET` | `/incidents/stats` | Authenticated | Statistik dashboard |
| `GET` | `/incidents/charts` | Authenticated | Chart data (category, severity, trend) |
| `GET` | `/incidents/:id` | Authenticated | Detail |
| `POST` | `/incidents` | Authenticated | Create |
| `PUT` | `/incidents/:id` | Authenticated | Update |
| `PATCH` | `/incidents/:id/status` | Authenticated | Update status |
| `PATCH` | `/incidents/:id/assign` | Authenticated | Assign ke institusi/user |
| `DELETE` | `/incidents/:id` | Superadmin | Delete |

### 5.6 Hotlines

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/hotlines` | Authenticated | List (filter: type, status, serviceType, institution) |
| `GET` | `/hotlines/:id` | Authenticated | Detail |
| `POST` | `/hotlines` | Authenticated | Create |
| `PUT` | `/hotlines/:id` | Authenticated | Update |
| `DELETE` | `/hotlines/:id` | Authenticated | Delete |

### 5.7 Coverage Areas

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/coverage-areas` | Authenticated | List (filter: institution, status) |
| `GET` | `/coverage-areas/:id` | Authenticated | Detail |
| `POST` | `/coverage-areas` | Authenticated | Create |
| `PUT` | `/coverage-areas/:id` | Authenticated | Update |
| `DELETE` | `/coverage-areas/:id` | Authenticated | Delete |

### 5.8 Social Posts (Institution)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/social-posts` | Authenticated | List (filter: institution, type) |
| `GET` | `/social-posts/:id` | Authenticated | Detail + comments |
| `POST` | `/social-posts` | Authenticated | Create |
| `PUT` | `/social-posts/:id` | Authenticated | Update |
| `POST` | `/social-posts/:id/like` | Authenticated | Toggle like |
| `DELETE` | `/social-posts/:id` | Authenticated | Delete |
| `POST` | `/social-posts/:id/comments` | Authenticated | Add comment |
| `POST` | `/social-posts/:postId/comments/:commentId/replies` | Authenticated | Reply to comment |
| `DELETE` | `/social-posts/:postId/comments/:commentId` | Authenticated | Delete comment |

### 5.9 Emergency Contacts

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/emergency-contacts` | Authenticated | List (filter: type, city) |
| `GET` | `/emergency-contacts/public` | Public | List publik (tanpa auth) |
| `GET` | `/emergency-contacts/:id` | Authenticated | Detail |
| `POST` | `/emergency-contacts` | Authenticated | Create |
| `PUT` | `/emergency-contacts/:id` | Authenticated | Update |
| `DELETE` | `/emergency-contacts/:id` | Authenticated | Delete |

### 5.11 Citizen Profiles

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/citizen-profiles` | Public | List (untuk lookup) |
| `GET` | `/citizen-profiles/me` | Citizen | Profile sendiri |
| `GET` | `/citizen-profiles/:id` | Public | Detail profile publik |
| `PUT` | `/citizen-profiles/me` | Citizen | Update profile |
| `POST` | `/citizen-profiles/me/avatar` | Citizen | Upload avatar |

### 5.12 Citizen Posts (Public Feed)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/citizen-posts` | Public | Feed (paginated, filter: category, urgency, city) |
| `GET` | `/citizen-posts/:id` | Public | Detail + comments |
| `POST` | `/citizen-posts` | Citizen | Create post |
| `PUT` | `/citizen-posts/:id` | Citizen | Update (owner only) |
| `DELETE` | `/citizen-posts/:id` | Citizen/Admin | Delete |
| `POST` | `/citizen-posts/:id/upvote` | Citizen | Toggle upvote |
| `POST` | `/citizen-posts/:id/urgent` | Citizen | Toggle urgent vote |
| `POST` | `/citizen-posts/:id/report` | Citizen | Report as hoax |
| `GET` | `/citizen-posts/:id/comments` | Public | List comments |
| `POST` | `/citizen-posts/:id/comments` | Citizen | Add comment |
| `PUT` | `/citizen-posts/:postId/comments/:commentId` | Citizen | Edit comment |
| `DELETE` | `/citizen-posts/:postId/comments/:commentId` | Citizen/Admin | Delete comment |
| `POST` | `/citizen-posts/:postId/comments/:commentId/replies` | Citizen | Reply to comment |
| `DELETE` | `/citizen-posts/:postId/comments/:commentId/replies/:replyId` | Citizen/Admin | Delete reply |

### 5.13 SOS Logs

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/sos-logs` | Citizen/Admin | List SOS logs |
| `GET` | `/sos-logs/my` | Citizen | Logs user sendiri |
| `POST` | `/sos-logs` | Citizen | Create SOS log |

### 5.14 Dashboard (Superadmin Aggregated)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/dashboard/stats` | Superadmin/Admin | Total users, incidents, institutions |
| `GET` | `/dashboard/incident-trends` | Superadmin/Admin | Trend bulanan |
| `GET` | `/dashboard/incident-categories` | Superadmin/Admin | Distribusi per category |
| `GET` | `/dashboard/incident-severity` | Superadmin/Admin | Distribusi per severity |
| `GET` | `/dashboard/recent-activity` | Superadmin/Admin | Activity terbaru |
| `GET` | `/dashboard/institution-summary` | Superadmin/Admin | Ringkasan per institusi |
| `GET` | `/dashboard/region-distribution` | Superadmin/Admin | Sebaran per region |

### 5.15 Moderation

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/moderation/content` | Superadmin/Moderator | List content (filter: status, type) |
| `GET` | `/moderation/content/:id` | Superadmin/Moderator | Detail |
| `PATCH` | `/moderation/content/:id/status` | Superadmin/Moderator | Approve/flag/remove |
| `GET` | `/moderation/spam-reports` | Superadmin/Moderator | List spam reports |
| `GET` | `/moderation/spam-reports/:id` | Superadmin/Moderator | Detail |
| `PATCH` | `/moderation/spam-reports/:id/status` | Superadmin/Moderator | Resolve report |

### 5.16 Categories

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/categories` | Authenticated | List all (tree structure) |
| `GET` | `/categories/:id` | Authenticated | Detail |
| `POST` | `/categories` | Superadmin | Create |
| `PUT` | `/categories/:id` | Superadmin | Update |
| `DELETE` | `/categories/:id` | Superadmin | Delete |

### 5.17 Data Records (Generic CRUD untuk halaman /data)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/data-records` | Authenticated | List (paginated, filter: type, status) |
| `GET` | `/data-records/:id` | Authenticated | Detail |
| `POST` | `/data-records` | Authenticated | Create |
| `PUT` | `/data-records/:id` | Authenticated | Update |
| `DELETE` | `/data-records/:id` | Authenticated | Delete |

### 5.18 Regions (Wilayah Indonesia)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/regions/provinces` | Public | 38 provinsi |
| `GET` | `/regions/provinces/:id/cities` | Public | Kota/kab per provinsi |
| `GET` | `/regions/cities/:id/districts` | Public | Kecamatan per kota |

### 5.19 Auto-Assignment: Citizen Post → Incident

**Critical business rule**: Ketika citizen membuat post di feed, backend harus auto-match lokasi post dengan coverage area institusi. Jika cocok, buat Incident dan assign ke institusi tersebut.

| Step | Action | Detail |
|------|--------|--------|
| 1 | Create CitizenPost | `POST /citizen-posts` |
| 2 | Match location | `citizenPost.location.city` + `citizenPost.location.province` vs `CoverageArea.coverage[].cityName` + `CoverageArea.coverage[].provinceName` |
| 3 | If match | Buat Incident dengan `institutionId` dari CoverageArea dan `citizenPostId` untuk relasi |
| 4 | Update post | Set `citizenPost.assignedInstitution` = institution name |
| 5 | Notify | Trigger notifikasi ke institution (opsional, future) |

**Matcher logic (di `CitizenPostsService.create`)**:
```
1. Ambil semua CoverageArea dengan status "active"
2. Normalize location.city dan location.province dari post
3. Cari CoverageArea yang coverage[].cityName cocok
4. Jika ditemukan:
   a. Buat Incident { type, location, reporter, description, media,
      source: CITIZEN, institutionId, citizenPostId, status: PENDING }
   b. Update CitizenPost.assignedInstitution = CoverageArea.institution.name
   c. Update CitizenPost.institutionResponse = null
```

**Match priority**: Satu post bisa match multiple CoverageArea (misal: BPBD DKI + PMI DKI). Priority:
1. First match wins (urutan coverage areas)
2. Atau berdasarkan trust level tertinggi (future)

**Frontend tidak perlu logic ini** — semua auto-assignment terjadi di backend `POST /citizen-posts`.

### 5.20 Users/Institution (Role-specific)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/institutions/:id/members` | Institution | Anggota institusi |
| `POST` | `/institutions/:id/members` | Institution | Invite/tambah anggota |
| `PATCH` | `/institutions/:id/members/:userId/role` | Institution | Ubah role anggota |

---

## 6. Response Format (Konsisten)

### Success
```json
{
  "statusCode": 200,
  "message": "OK",
  "data": { },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email already exists" }
  ]
}
```

---

## 7. Environment Variables

### Backend `.env`
```
DATABASE_URL=postgresql://user:pass@localhost:5432/emergy
JWT_SECRET=super-secret-key-change-in-production
JWT_REFRESH_SECRET=super-secret-refresh-key-change-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

---

## 8. API Documentation (Swagger)

### 8.1 Akses
| Environment | URL |
|-------------|-----|
| **Development** | `http://localhost:3001/api/docs` |
| **Production** | `https://api.emergy.my.id/api/docs` |

### 8.2 Setup
```bash
npm install @nestjs/swagger swagger-ui-express
```

### 8.3 main.ts — Bootstrap + Swagger (Lengkap)

```typescript
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
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    // ─── 17 Tags — 1 per module ─────────────────────────
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
```

### 8.4 Common Decorators (Custom)

```typescript
// common/decorators/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// common/decorators/public.decorator.ts
export const Public = () => SetMetadata('isPublic', true);

// common/decorators/roles.decorator.ts
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
```

### 8.5 Controller Patterns — 17 Modul Lengkap

#### 8.5.1 AuthController
```typescript
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @Post('register-citizen')
  @ApiOperation({ summary: 'Register warga baru' })
  @ApiBody({ type: RegisterCitizenDto })
  @ApiResponse({ status: 201, description: 'Warga terdaftar', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'Email/username already exists' })

  @Post('register-institution')
  @ApiOperation({ summary: 'Register institusi baru (pending approval)' })
  @ApiBody({ type: RegisterInstitutionDto })
  @ApiResponse({ status: 201, description: 'Institusi terdaftar, menunggu approval' })

  @Post('login')
  @ApiOperation({ summary: 'Login → JWT access + refresh token' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Berhasil login', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Token refreshed' })

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout — hapus refresh token' })
  @ApiResponse({ status: 200, description: 'Logged out' })

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profile user saat ini' })
  @ApiResponse({ status: 200, description: 'Profile user', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
}
```

#### 8.5.2 UsersController
```typescript
@ApiTags('Users')
@Controller('users')
export class UsersController {
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List users', description: 'Superadmin/Admin. Paginated, filterable.' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'role', required: false, enum: ['SUPERADMIN', 'ADMIN', 'INSTITUTION_ADMIN', 'INSTITUTION_STAFF', 'CITIZEN'] })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'john' })
  @ApiResponse({ status: 200, description: 'Users returned (paginated)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail user' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created' })

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated' })

  @Patch(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update status (activate/suspend)' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateUserStatusDto })
  @ApiResponse({ status: 200, description: 'Status updated' })

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
}
```

#### 8.5.3 RolesController
```typescript
@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all roles' })
  @ApiResponse({ status: 200, description: 'Roles list' })

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail role + permissions' })
  @ApiParam({ name: 'id', type: String })

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create role' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ status: 201, description: 'Role created' })

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update role + permissions' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateRoleDto })

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete role' })
  @ApiParam({ name: 'id', type: String })
}
```

#### 8.5.4 InstitutionsController
```typescript
@ApiTags('Institutions')
@Controller('institutions')
export class InstitutionsController {
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List institutions', description: 'Filter: status, type, search. Paginated.' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'PENDING', 'REJECTED', 'SUSPENDED'] })
  @ApiQuery({ name: 'type', required: false, type: String, example: 'Government' })
  @ApiQuery({ name: 'search', required: false, type: String })

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Summary stats institutions' })

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail institution' })
  @ApiParam({ name: 'id', type: String })

  @Get(':id/dashboard')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dashboard stats spesifik institusi' })
  @ApiParam({ name: 'id', type: String })

  @Get(':id/incidents')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Incidents milik institusi' })
  @ApiParam({ name: 'id', type: String })

  @Get(':id/members')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Anggota institusi' })
  @ApiParam({ name: 'id', type: String })

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create institution (superadmin)' })
  @ApiBody({ type: CreateInstitutionDto })

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update institution' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateInstitutionDto })

  @Patch(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve/reject/suspend institution' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateInstitutionStatusDto })

  @Patch(':id/trust-level')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update trust level' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateTrustLevelDto })

  @Post(':id/members')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tambah anggota ke institusi' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: AddMemberDto })

  @Patch(':id/members/:userId/role')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ubah role anggota institusi' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'userId', type: String })
  @ApiBody({ type: UpdateMemberRoleDto })

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete institution' })
  @ApiParam({ name: 'id', type: String })
}
```

#### 8.5.5 IncidentsController
```typescript
@ApiTags('Incidents')
@Controller('incidents')
export class IncidentsController {
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List incidents', description: 'Filter: type, severity, status, source, date range. Paginated.' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'type', required: false, type: String, example: 'flood' })
  @ApiQuery({ name: 'severity', required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'HOAX'] })
  @ApiQuery({ name: 'source', required: false, enum: ['ADMIN', 'SOCIAL', 'HOTLINE', 'CITIZEN'] })
  @ApiQuery({ name: 'startDate', required: false, type: String, example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: false, type: String, example: '2025-12-31' })
  @ApiResponse({ status: 200, description: 'Paginated incidents' })

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Statistik dashboard: total, by status, by severity' })

  @Get('charts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Data chart: category distribution, severity, trend bulanan' })
  @ApiQuery({ name: 'months', required: false, type: Number, example: 12 })

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail incident' })
  @ApiParam({ name: 'id', type: String })

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create incident' })
  @ApiBody({ type: CreateIncidentDto })

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update incident' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateIncidentDto })

  @Patch(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update status: verify, resolve, dismiss' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateIncidentStatusDto })

  @Patch(':id/assign')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign incident ke institusi/user' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: AssignIncidentDto })

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete incident' })
  @ApiParam({ name: 'id', type: String })
}
```

#### 8.5.6 HotlinesController
```typescript
@ApiTags('Hotlines')
@Controller('hotlines')
export class HotlinesController {
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List hotlines', description: 'Filter: type, status, institution, serviceType' })
  @ApiQuery({ name: 'type', required: false, enum: ['POLICE', 'HOSPITAL', 'FIRE', 'SAR', 'PLN', 'BNPB', 'BPBD'] })
  @ApiQuery({ name: 'status', required: false, type: String, example: 'active' })

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail hotline' })
  @ApiParam({ name: 'id', type: String })

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create hotline' })
  @ApiBody({ type: CreateHotlineDto })

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update hotline' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateHotlineDto })

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete hotline' })
  @ApiParam({ name: 'id', type: String })
}
```

#### 8.5.7 CoverageAreasController
```typescript
@ApiTags('Coverage Areas')
@Controller('coverage-areas')
export class CoverageAreasController {
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List coverage areas', description: 'Filter: institution, status' })
  @ApiQuery({ name: 'institutionId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String, example: 'active' })

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail coverage area' })
  @ApiParam({ name: 'id', type: String })

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create coverage area' })
  @ApiBody({ type: CreateCoverageAreaDto })

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update coverage area' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateCoverageAreaDto })

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete coverage area' })
  @ApiParam({ name: 'id', type: String })
}
```

#### 8.5.8 SocialPostsController
```typescript
@ApiTags('Social Posts')
@Controller('social-posts')
export class SocialPostsController {
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List social posts', description: 'Filter: institution, type' })
  @ApiQuery({ name: 'institutionId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: ['WARNING', 'UPDATE', 'BROADCAST', 'INFO', 'NEWS', 'TIPS', 'ALERT'] })

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail post + comments' })
  @ApiParam({ name: 'id', type: String })

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create social post' })
  @ApiBody({ type: CreateSocialPostDto })

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update social post' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateSocialPostDto })

  @Post(':id/like')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle like' })
  @ApiParam({ name: 'id', type: String })

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete social post' })
  @ApiParam({ name: 'id', type: String })

  // ─── Nested: Comments ─────────────────────────────
  @Post(':postId/comments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add comment to social post' })
  @ApiParam({ name: 'postId', type: String })
  @ApiBody({ type: CreateCommentDto })

  @Post(':postId/comments/:commentId/replies')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reply to comment' })
  @ApiParam({ name: 'postId', type: String })
  @ApiParam({ name: 'commentId', type: String })
  @ApiBody({ type: CreateReplyDto })

  @Delete(':postId/comments/:commentId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete comment' })
  @ApiParam({ name: 'postId', type: String })
  @ApiParam({ name: 'commentId', type: String })
}
```

#### 8.5.9 EmergencyContactsController
```typescript
@ApiTags('Emergency Contacts')
@Controller('emergency-contacts')
export class EmergencyContactsController {
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List emergency contacts', description: 'Filter: type, city' })
  @ApiQuery({ name: 'type', required: false, type: String, example: 'hospital' })
  @ApiQuery({ name: 'city', required: false, type: String, example: 'Jakarta Pusat' })

  @Get('public')
  @ApiOperation({ summary: 'Public list (no auth needed)' })
  @ApiQuery({ name: 'city', required: false, type: String, example: 'Jakarta Pusat' })

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail contact' })
  @ApiParam({ name: 'id', type: String })

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create emergency contact' })
  @ApiBody({ type: CreateEmergencyContactDto })

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update contact' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateEmergencyContactDto })

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete contact' })
  @ApiParam({ name: 'id', type: String })
}
```

#### 8.5.10 CitizenProfilesController
```typescript
@ApiTags('Citizen Profiles')
@Controller('citizen-profiles')
export class CitizenProfilesController {
  @Get()
  @ApiOperation({ summary: 'List citizen profiles (public lookup)' })

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profile saya sendiri' })

  @Get(':id')
  @ApiOperation({ summary: 'Detail profile publik' })
  @ApiParam({ name: 'id', type: String })

  @Put('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update profile saya' })
  @ApiBody({ type: UpdateCitizenProfileDto })

  @Post('me/avatar')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: JwtUser) { }
}
```

#### 8.5.11 CitizenPostsController (Lengkap)
```typescript
@ApiTags('Citizen Posts')
@Controller('citizen-posts')
export class CitizenPostsController {
  // ─── Public ────────────────────────────────────────
  @Public()
  @Get()
  @ApiOperation({ summary: 'Public feed', description: 'Paginated, filter by category, urgency, city' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'category', required: false, type: String, example: 'flood' })
  @ApiQuery({ name: 'urgency', required: false, type: String, example: 'urgent' })
  @ApiQuery({ name: 'city', required: false, type: String, example: 'Jakarta Pusat' })

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Detail post + comments + replies' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Post found' })
  @ApiResponse({ status: 404, description: 'Post not found' })

  // ─── Citizen only ──────────────────────────────────
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create post → auto-assign incident ke institusi' })
  @ApiBody({ type: CreateCitizenPostDto })
  @ApiResponse({ status: 201, description: 'Post + incident created' })
  @ApiResponse({ status: 400, description: 'Validation error' })

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update post (owner only)' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateCitizenPostDto })

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete post (owner or admin)' })
  @ApiParam({ name: 'id', type: String })

  // ─── Actions ───────────────────────────────────────
  @Post(':id/upvote')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle upvote' })
  @ApiParam({ name: 'id', type: String })

  @Post(':id/urgent')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle urgent vote' })
  @ApiParam({ name: 'id', type: String })

  @Post(':id/report')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Report as hoax' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: ReportPostDto })

  // ─── Nested: Comments ──────────────────────────────
  @Public()
  @Get(':id/comments')
  @ApiOperation({ summary: 'List comments of a post' })
  @ApiParam({ name: 'id', type: String })

  @Post(':id/comments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add comment' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: CreateCommentDto })

  @Put(':postId/comments/:commentId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit comment (owner only)' })
  @ApiParam({ name: 'postId', type: String })
  @ApiParam({ name: 'commentId', type: String })
  @ApiBody({ type: UpdateCommentDto })

  @Delete(':postId/comments/:commentId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete comment (owner or admin)' })
  @ApiParam({ name: 'postId', type: String })
  @ApiParam({ name: 'commentId', type: String })

  // ─── Nested: Replies ───────────────────────────────
  @Post(':postId/comments/:commentId/replies')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reply to comment' })
  @ApiParam({ name: 'postId', type: String })
  @ApiParam({ name: 'commentId', type: String })
  @ApiBody({ type: CreateReplyDto })

  @Delete(':postId/comments/:commentId/replies/:replyId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete reply' })
  @ApiParam({ name: 'postId', type: String })
  @ApiParam({ name: 'commentId', type: String })
  @ApiParam({ name: 'replyId', type: String })
}
```

#### 8.5.12 SOSLogsController
```typescript
@ApiTags('SOS Logs')
@Controller('sos-logs')
export class SosLogsController {
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all SOS logs (admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })

  @Get('my')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'SOS logs saya' })

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create SOS log' })
  @ApiBody({ type: CreateSosLogDto })
}
```

#### 8.5.13 ModerationController
```typescript
@ApiTags('Moderation')
@Controller('moderation')
export class ModerationController {
  @Get('content')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List content', description: 'Filter: status, type. Paginated.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'FLAGGED', 'REMOVED'] })
  @ApiQuery({ name: 'type', required: false, type: String, example: 'post' })

  @Get('content/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail content' })
  @ApiParam({ name: 'id', type: String })

  @Patch('content/:id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve/flag/remove content' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateModerationStatusDto })

  @Get('spam-reports')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List spam reports' })
  @ApiQuery({ name: 'status', required: false, type: String, example: 'pending' })

  @Get('spam-reports/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail spam report' })
  @ApiParam({ name: 'id', type: String })

  @Patch('spam-reports/:id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resolve/approve/reject spam report' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateSpamReportStatusDto })
}
```

#### 8.5.14 CategoriesController
```typescript
@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all categories (tree structure)' })

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail category + children' })
  @ApiParam({ name: 'id', type: String })

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category' })
  @ApiBody({ type: CreateCategoryDto })

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateCategoryDto })

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete category' })
  @ApiParam({ name: 'id', type: String })
}
```

#### 8.5.15 DataRecordsController
```typescript
@ApiTags('Data Records')
@Controller('data-records')
export class DataRecordsController {
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List data records', description: 'Filter: type, status. Paginated.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail record' })
  @ApiParam({ name: 'id', type: String })

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create record' })
  @ApiBody({ type: CreateDataRecordDto })

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update record' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateDataRecordDto })

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete record' })
  @ApiParam({ name: 'id', type: String })
}
```

#### 8.5.16 DashboardController
```typescript
@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ringkasan: total users, incidents, institutions, active, pending' })

  @Get('incident-trends')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trend insiden per bulan' })
  @ApiQuery({ name: 'months', required: false, type: Number, example: 12 })

  @Get('incident-categories')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Distribusi insiden per kategori' })

  @Get('incident-severity')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Distribusi insiden per severity' })

  @Get('recent-activity')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aktivitas terbaru' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })

  @Get('institution-summary')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ringkasan per institusi' })

  @Get('region-distribution')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sebaran insiden per region' })
}
```

#### 8.5.17 RegionsController
```typescript
@ApiTags('Regions')
@Controller('regions')
export class RegionsController {
  @Get('provinces')
  @ApiOperation({ summary: 'List 38 provinsi Indonesia' })

  @Get('provinces/:id/cities')
  @ApiOperation({ summary: 'List kota/kab per provinsi' })
  @ApiParam({ name: 'id', type: String, example: '31' })

  @Get('cities/:id/districts')
  @ApiOperation({ summary: 'List kecamatan per kota' })
  @ApiParam({ name: 'id', type: String, example: '3171' })
}
```

### 8.6 Common DTOs

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsArray, IsBoolean } from 'class-validator';

// ─── Pagination ─────────────────────────────────────────
export class PaginationDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  limit?: number;
}

// ─── Auth ──────────────────────────────────────────────
export class LoginDto {
  @ApiProperty({ example: 'emilys', description: 'Username or email' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterCitizenDto {
  @ApiProperty({ example: 'Ahmad Fauzi' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'ahmadfauzi' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'ahmad@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: '0812-3456-7890' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'DKI Jakarta' })
  @IsOptional()
  province?: string;

  @ApiPropertyOptional({ example: 'Jakarta Pusat' })
  @IsOptional()
  city?: string;
}

export class RegisterInstitutionDto {
  @ApiProperty({ example: 'BPBD Jakarta' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Government' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'admin@bpbd.jakarta.go.id' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: '021-12345678' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Jl. Merdeka No.1, Jakarta Pusat' })
  @IsOptional()
  address?: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  @IsString()
  refreshToken: string;
}

// ─── Users ──────────────────────────────────────────────
export class CreateUserDto {
  @ApiProperty({ example: 'johndoe' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: ['SUPERADMIN', 'ADMIN', 'INSTITUTION_ADMIN', 'INSTITUTION_STAFF', 'CITIZEN'] })
  @IsEnum(['SUPERADMIN', 'ADMIN', 'INSTITUTION_ADMIN', 'INSTITUTION_STAFF', 'CITIZEN'])
  role: string;

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  status?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'johnupdated' })
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ example: 'john_new@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] })
  @IsOptional()
  status?: string;
}

export class UpdateUserStatusDto {
  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] })
  @IsEnum(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
  status: string;
}

// ─── Roles ──────────────────────────────────────────────
export class CreateRoleDto {
  @ApiProperty({ example: 'moderator' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Can moderate content' })
  @IsOptional()
  description?: string;

  @ApiProperty({ example: ['dashboard:view', 'incidents:view', 'incidents:edit'], type: [String] })
  @IsArray()
  permissions: string[];
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'moderator' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  permissions?: string[];
}

// ─── Institutions ────────────────────────────────────────
export class CreateInstitutionDto {
  @ApiProperty({ example: 'BPBD DKI Jakarta' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Government' })
  @IsString()
  type: string;

  @ApiPropertyOptional({ example: 'info@bpbd.jakarta.go.id' })
  @IsOptional()
  contactEmail?: string;

  @ApiPropertyOptional({ example: '021-12345678' })
  @IsOptional()
  contactPhone?: string;

  @ApiPropertyOptional({ example: 'Jl. Merdeka No.1, Jakarta Pusat' })
  @IsOptional()
  address?: string;
}

export class UpdateInstitutionDto {
  @ApiPropertyOptional()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  address?: string;
}

export class UpdateInstitutionStatusDto {
  @ApiProperty({ enum: ['ACTIVE', 'PENDING', 'REJECTED', 'SUSPENDED'] })
  @IsEnum(['ACTIVE', 'PENDING', 'REJECTED', 'SUSPENDED'])
  status: string;
}

export class UpdateTrustLevelDto {
  @ApiProperty({ enum: ['NONE', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'] })
  @IsEnum(['NONE', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'])
  trustLevel: string;
}

export class AddMemberDto {
  @ApiProperty({ example: 'user_xxx' })
  @IsString()
  userId: string;

  @ApiProperty({ enum: ['INSTITUTION_ADMIN', 'INSTITUTION_STAFF'] })
  @IsEnum(['INSTITUTION_ADMIN', 'INSTITUTION_STAFF'])
  role: string;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: ['INSTITUTION_ADMIN', 'INSTITUTION_STAFF'] })
  @IsEnum(['INSTITUTION_ADMIN', 'INSTITUTION_STAFF'])
  role: string;
}

// ─── Incidents ──────────────────────────────────────────
export class CreateIncidentDto {
  @ApiProperty({ example: 'Banjir di Jakarta Timur' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'Jl. Raya Bogor Km 10, Jakarta Timur' })
  @IsString()
  location: string;

  @ApiProperty({ example: 'Ani S.' })
  @IsString()
  reporter: string;

  @ApiPropertyOptional({ example: 'Banjir setinggi 1 meter...' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @IsOptional()
  severity?: string;

  @ApiPropertyOptional({ enum: ['ADMIN', 'SOCIAL', 'HOTLINE', 'CITIZEN'] })
  @IsOptional()
  source?: string;
}

export class UpdateIncidentDto {
  @ApiPropertyOptional()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @IsOptional()
  severity?: string;
}

export class UpdateIncidentStatusDto {
  @ApiProperty({ enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'HOAX'] })
  @IsEnum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'HOAX'])
  status: string;
}

export class AssignIncidentDto {
  @ApiPropertyOptional({ example: 'inst_001' })
  @IsOptional()
  institutionId?: string;

  @ApiPropertyOptional({ example: 'user_xxx' })
  @IsOptional()
  assignedToId?: string;
}

// ─── Hotlines ──────────────────────────────────────────
export class CreateHotlineDto {
  @ApiProperty({ example: 'Emergency Call Center' })
  @IsString()
  name: string;

  @ApiProperty({ example: '112' })
  @IsString()
  number: string;

  @ApiPropertyOptional({ enum: ['POLICE', 'HOSPITAL', 'FIRE', 'SAR', 'PLN', 'BNPB', 'BPBD'] })
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ example: 'Emergency' })
  @IsOptional()
  serviceType?: string;

  @ApiPropertyOptional({ example: '24/7' })
  @IsOptional()
  operatingHours?: string;
}

export class UpdateHotlineDto {
  @ApiPropertyOptional()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  serviceType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  operatingHours?: string;

  @ApiPropertyOptional()
  @IsOptional()
  status?: string;
}

// ─── Coverage Areas ────────────────────────────────────
export class CreateCoverageAreaDto {
  @ApiProperty({ example: 'Jakarta Pusat Coverage' })
  @IsString()
  name: string;

  @ApiProperty({ example: [{ label: 'DKI Jakarta > Jakarta Pusat', provinceId: '31', provinceName: 'DKI Jakarta', cityId: '3171', cityName: 'Jakarta Pusat' }] })
  coverage: object[];

  @ApiPropertyOptional({ enum: ['active', 'inactive'] })
  @IsOptional()
  status?: string;
}

export class UpdateCoverageAreaDto {
  @ApiPropertyOptional()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  coverage?: object[];

  @ApiPropertyOptional({ enum: ['active', 'inactive'] })
  @IsOptional()
  status?: string;
}

// ─── Social Posts ──────────────────────────────────────
export class CreateSocialPostDto {
  @ApiProperty({ example: 'Peringatan dini: Hujan lebat...' })
  @IsString()
  caption: string;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  media?: { type: string; url: string; name: string }[];

  @ApiProperty({ enum: ['WARNING', 'UPDATE', 'BROADCAST', 'INFO', 'NEWS', 'TIPS', 'ALERT'] })
  @IsEnum(['WARNING', 'UPDATE', 'BROADCAST', 'INFO', 'NEWS', 'TIPS', 'ALERT'])
  type: string;
}

export class UpdateSocialPostDto {
  @ApiPropertyOptional()
  @IsOptional()
  caption?: string;

  @ApiPropertyOptional()
  @IsOptional()
  media?: object[];

  @ApiPropertyOptional({ enum: ['WARNING', 'UPDATE', 'BROADCAST', 'INFO', 'NEWS', 'TIPS', 'ALERT'] })
  @IsOptional()
  type?: string;
}

// ─── Citizen Posts ─────────────────────────────────────
export class CreateCitizenPostDto {
  @ApiProperty({ example: 'Banjir di Jl. Merdeka setinggi 1 meter' })
  @IsString()
  caption: string;

  @ApiProperty({ example: 'flood', enum: ['fire', 'flood', 'accident', 'medical', 'crime', 'earthquake', 'other'] })
  @IsString()
  category: string;

  @ApiProperty({ example: { lat: -6.1865, lng: 106.8345, address: 'Jl. Merdeka No.45', city: 'Jakarta Pusat', province: 'DKI Jakarta' } })
  location: object;

  @ApiPropertyOptional({ example: [{ type: 'image', url: 'https://...', name: 'photo.jpg' }] })
  @IsOptional()
  media?: { type: string; url: string; name: string }[];
}

export class UpdateCitizenPostDto {
  @ApiPropertyOptional()
  @IsOptional()
  caption?: string;

  @ApiPropertyOptional()
  @IsOptional()
  media?: object[];

  @ApiPropertyOptional()
  @IsOptional()
  location?: object;
}

export class ReportPostDto {
  @ApiProperty({ example: 'Informasi tidak benar / hoax' })
  @IsString()
  reason: string;
}

// ─── Comments & Replies (shared) ──────────────────────
export class CreateCommentDto {
  @ApiProperty({ example: 'Terima kasih informasinya' })
  @IsString()
  content: string;
}

export class UpdateCommentDto {
  @ApiProperty({ example: 'Updated comment text' })
  @IsString()
  content: string;
}

export class CreateReplyDto {
  @ApiProperty({ example: 'Sama-sama, tetap waspada' })
  @IsString()
  content: string;
}

// ─── SOS ──────────────────────────────────────────────
export class CreateSosLogDto {
  @ApiProperty({ example: { lat: -6.1865, lng: 106.8345, address: 'Jakarta Pusat' } })
  location: object;

  @ApiPropertyOptional({ example: '112' })
  @IsOptional()
  contacted?: string;
}

// ─── Emergency Contacts ──────────────────────────────
export class CreateEmergencyContactDto {
  @ApiProperty({ example: 'Polres Jakarta Pusat' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ['police', 'hospital', 'fire', 'sar', 'pln', 'bnpb', 'bpbd'] })
  @IsEnum(['police', 'hospital', 'fire', 'sar', 'pln', 'bnpb', 'bpbd'])
  type: string;

  @ApiProperty({ example: '021-12345678' })
  @IsString()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Jakarta Pusat' })
  @IsOptional()
  city?: string;
}

export class UpdateEmergencyContactDto {
  @ApiPropertyOptional()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  city?: string;
}

// ─── Citizen Profile ─────────────────────────────────
export class UpdateCitizenProfileDto {
  @ApiPropertyOptional({ example: 'Ahmad Fauzi' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Perkenalkan saya warga Jakarta...' })
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ example: '0812-3456-7890' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'DKI Jakarta' })
  @IsOptional()
  province?: string;

  @ApiPropertyOptional({ example: 'Jakarta Pusat' })
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Gambir' })
  @IsOptional()
  district?: string;
}

// ─── Moderation ─────────────────────────────────────
export class UpdateModerationStatusDto {
  @ApiProperty({ enum: ['APPROVED', 'FLAGGED', 'REMOVED'] })
  @IsEnum(['APPROVED', 'FLAGGED', 'REMOVED'])
  status: string;
}

export class UpdateSpamReportStatusDto {
  @ApiProperty({ enum: ['approved', 'rejected'] })
  @IsEnum(['approved', 'rejected'])
  status: string;
}

// ─── Categories ─────────────────────────────────────
export class CreateCategoryDto {
  @ApiProperty({ example: 'Natural Disasters' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ example: 'cat_001' })
  @IsOptional()
  parentId?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  isActive?: boolean;
}

// ─── Data Records ───────────────────────────────────
export class CreateDataRecordDto {
  @ApiProperty({ example: 'Record Title' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'report' })
  @IsString()
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  content?: object;
}

export class UpdateDataRecordDto {
  @ApiPropertyOptional()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  content?: object;

  @ApiPropertyOptional()
  @IsOptional()
  status?: string;
}
```

### 8.7 Response DTOs

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─── Wrapper ──────────────────────────────────────────
export class ApiMeta {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}

export class ApiResponseWrapper<T> {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'OK' })
  message: string;

  data: T;

  @ApiPropertyOptional({ type: ApiMeta })
  meta?: ApiMeta;
}

// ─── Auth ────────────────────────────────────────────
export class UserResponseDto {
  @ApiProperty({ example: 'user_001' })
  id: string;

  @ApiProperty({ example: 'emilys' })
  username: string;

  @ApiProperty({ example: 'emilys@example.com' })
  email: string;

  @ApiProperty({ example: 'SUPERADMIN' })
  role: string;

  @ApiProperty({ example: 'ACTIVE' })
  status: string;

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z' })
  createdAt: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  refreshToken: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}

// ─── Error ────────────────────────────────────────────
export class ApiErrorDetail {
  @ApiProperty({ example: 'email' })
  field: string;

  @ApiProperty({ example: 'Email already exists' })
  message: string;
}

export class ApiErrorResponse {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiPropertyOptional({ type: [ApiErrorDetail] })
  errors?: ApiErrorDetail[];
}
```

### 8.8 Ringkasan Coverage

| # | Tag | Controller | Public | Bearer | Endpoints |
|---|-----|-----------|--------|--------|-----------|
| 1 | Auth | AuthController | 3 | 2 | 6 |
| 2 | Users | UsersController | 0 | 6 | 6 |
| 3 | Roles | RolesController | 0 | 5 | 5 |
| 4 | Institutions | InstitutionsController | 0 | 12 | 12 |
| 5 | Incidents | IncidentsController | 0 | 9 | 9 |
| 6 | Hotlines | HotlinesController | 0 | 5 | 5 |
| 7 | Coverage Areas | CoverageAreasController | 0 | 5 | 5 |
| 8 | Social Posts | SocialPostsController | 0 | 8 | 8 |
| 9 | Emergency Contacts | EmergencyContactsController | 1 | 5 | 6 |
| 10 | Citizen Profiles | CitizenProfilesController | 2 | 3 | 5 |
| 11 | Citizen Posts | CitizenPostsController | 3 | 10 | 13 |
| 12 | SOS Logs | SosLogsController | 0 | 3 | 3 |
| 13 | Moderation | ModerationController | 0 | 6 | 6 |
| 14 | Categories | CategoriesController | 0 | 5 | 5 |
| 15 | Data Records | DataRecordsController | 0 | 6 | 6 |
| 16 | Dashboard | DashboardController | 0 | 7 | 7 |
| 17 | Regions | RegionsController | 3 | 0 | 3 |
| | **Total** | **17 controllers** | **12** | **97** | **109** |

**Semua 109 endpoint tercover dengan decorator Swagger yang sesuai.**

---

## 9. Strategi Migrasi Bertahap

### Phase 1 — Auth + Users + Roles (P0)
```
Backend:
  - Buat AuthModule (register, login, refresh, me)
  - Buat UsersModule (CRUD, status)
  - Buat RolesModule (CRUD, permissions)

Frontend:
  - update _services/login-api.services.ts → call POST /auth/login
  - Hapus dependensi localStorage di login flow
  - buat _services/user.service.ts → call /users/*
  - buat _services/role.service.ts → call /roles/*
  - update pages/(dashboard)/users/page.tsx
  - update pages/(dashboard)/roles/page.tsx
```

### Phase 2 — Institutions (P0)
```
Backend:
  - Buat InstitutionsModule

Frontend:
  - buat _services/institution.service.ts
  - update pages/(dashboard)/institutions/page.tsx
  - update pages/(auth)/register/page.tsx (institution register)
```

### Phase 3 — Incidents + Dashboard (P0)
```
Backend:
  - Buat IncidentsModule (CRUD + stats + charts)
  - Buat DashboardModule (aggregated stats)

Frontend:
  - buat _services/incident.service.ts
  - update pages/(dashboard)/incidents/page.tsx
  - update pages/(dashboard)/dashboard/page.tsx
  - update pages/institution/incidents/page.tsx
  - update pages/institution/dashboard/page.tsx
```

### Phase 4 — Institution Features (Hotlines, Coverage, Social) (P0)
```
Backend:
  - Buat HotlinesModule, CoverageAreasModule, SocialPostsModule

Frontend:
  - buat _services/hotline.service.ts
  - buat _services/coverage-area.service.ts
  - buat _services/social-post.service.ts
  - update pages/institution/hotlines/page.tsx
  - update pages/institution/areas/page.tsx
  - update pages/institution/social/page.tsx
```

### Phase 5 — Citizen Features (Profiles + Posts) (P0)
```
Backend:
  - Buat CitizenProfilesModule, CitizenPostsModule

Frontend:
  - buat _services/citizen-profile.service.ts
  - buat _services/citizen-post.service.ts
  - update pages/(public)/feed/page.tsx
  - update pages/(public)/feed/[id]/page.tsx
  - update pages/(public)/create/page.tsx
  - update pages/(public)/profile/page.tsx
  - Hapus publicStorage.ts (bertahap)
  - Hapus public-mock.ts (bertahap)
```

### Phase 6 — Remaining (P1)
```
Backend:
  - EmergencyContactsModule, SOSLogsModule
  - ModerationModule, CategoriesModule
  - RegionsModule (seeder)

Frontend:
  - buat services untuk masing-masing
  - update halaman terkait
```

### Phase 7 — Cleanup & Deprecation (P2)
```
Setelah semua domain terintegrasi ke API:
  - Hapus lib/localStorage.ts
  - Hapus lib/emergy-mock.ts
  - Hapus lib/publicStorage.ts
  - Hapus lib/public-mock.ts

  - Hapus lib/rbac.ts (RBAC backend via JWT + roles)
  - Bersihkan store/globalStore.ts dari mock references
```

---

## 10. Frontend Files yang Akan Dimodifikasi

| File | Action | Fase |
|------|--------|------|
| `_services/login-api.services.ts` | Rewrite → panggil `/auth/login` | 1 |
| `_services/user.service.ts` | **Buat baru** → CRUD `/users/*` | 1 |
| `_services/role.service.ts` | **Buat baru** → CRUD `/roles/*` | 1 |
| `_services/institution.service.ts` | **Buat baru** → CRUD `/institutions/*` | 2 |
| `_services/incident.service.ts` | **Buat baru** → CRUD `/incidents/*` | 3 |
| `_services/hotline.service.ts` | **Buat baru** → CRUD `/hotlines/*` | 4 |
| `_services/coverage-area.service.ts` | **Buat baru** → CRUD `/coverage-areas/*` | 4 |
| `_services/social-post.service.ts` | **Buat baru** → CRUD `/social-posts/*` | 4 |
| `_services/citizen-profile.service.ts` | **Buat baru** → CRUD `/citizen-profiles/*` | 5 |
| `_services/citizen-post.service.ts` | **Buat baru** → CRUD `/citizen-posts/*` | 5 |

| `_services/emergency-contact.service.ts` | **Buat baru** → CRUD `/emergency-contacts/*` | 6 |
| `_services/sos-log.service.ts` | **Buat baru** → CRUD `/sos-logs/*` | 6 |
| `_services/moderation.service.ts` | **Buat baru** → CRUD `/moderation/*` | 6 |
| `_services/category.service.ts` | **Buat baru** → CRUD `/categories/*` | 6 |
| `_services/data-record.service.ts` | **Buat baru** → CRUD `/data-records/*` | 6 |
| `_services/dashboard.service.ts` | **Buat baru** → GET `/dashboard/*` | 3 |
| `_services/region.service.ts` | **Buat baru** → GET `/regions/*` | 6 |
| `lib/localStorage.ts` | Hapus setelah semua migrasi | 7 |
| `lib/emergy-mock.ts` | Hapus setelah semua migrasi | 7 |
| `lib/publicStorage.ts` | Hapus setelah semua migrasi | 7 |
| `lib/public-mock.ts` | Hapus setelah semua migrasi | 7 |

| `lib/rbac.ts` | Hapus (pindah ke backend JWT) | 7 |
| `proto/auth/auth.proto` | **Tidak dipakai** — biarkan atau hapus | — |

---

## 11. File yg Tetap (Tidak Perlu Backend)

| File | Alasan |
|------|--------|
| `store/authStore.ts` | Zustand state murni (isAuthenticated) |
| `store/globalStore.ts` | Theme + title — UI only |
| `lib/realtime.ts` | SSE client — tetap di FE (backend feed via WebSocket nanti) |
| `lib/utils.ts` | Utility `cn()` — tidak terkait data |
| `_network/request.ts` | Axios instance — tetap dipakai, hanya baseURL diubah |
| `lib/region-data.ts` | Static fallback — tidak lagi dipakai (backup saja) |
| `lib/region-service.ts` | Akan diganti panggil `/regions/*` |
| `components/` | UI components — tidak perlu perubahan |
| `hooks/` | Custom hooks — jika ada yang panggil localStorage, perlu update |

---

## 12. Prioritas & Timeline Estimasi

| Phase | Module | Endpoints | Halaman FE | Estimasi |
|-------|--------|-----------|------------|----------|
| **1** | Auth, Users, Roles | 15 | 3 halaman | 3-4 hari |
| **2** | Institutions | 12 | 2 halaman | 2-3 hari |
| **3** | Incidents, Dashboard | 18 | 4 halaman | 3-4 hari |
| **4** | Hotlines, Coverage, Social | 20 | 3 halaman | 3-4 hari |
| **5** | Citizen Profiles, Posts | 22 | 4 halaman | 4-5 hari |
| **6** | Emergency, SOS, Moderation, Categories, Regions | 25 | 3 halaman | 3-4 hari |
| **7** | Cleanup | — | — | 1 hari |

**Total: ~20-25 hari kerja** (untuk backend + frontend integration)
