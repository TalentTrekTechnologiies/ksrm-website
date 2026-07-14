import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { FacultyModule } from './faculty/faculty.module';
import { NewsModule } from './news/news.module';
import { GalleryModule } from './gallery/gallery.module';
import { PlacementsModule } from './placements/placements.module';
import { ExamNotificationsModule } from './exam-notifications/exam-notifications.module';
import { AuthModule } from './auth/auth.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HomepageModule } from './homepage/homepage.module';
import { DownloadsModule } from './downloads/downloads.module';
import { CareersModule } from './careers/careers.module';
import { EventsModule } from './events/events.module';
import { DepartmentsModule } from './departments/departments.module';
import { CommitteesModule } from './committees/committees.module';
import { SiteSettingsModule } from './site-settings/site-settings.module';
import { MediaModule } from './media/media.module';
import { AdminsModule } from './admins/admins.module';
import { RolesModule } from './roles/roles.module';
import { LabsModule } from './labs/labs.module';
import { LearningOutcomesModule } from './learning-outcomes/learning-outcomes.module';
import { DepartmentProgrammesModule } from './department-programmes/department-programmes.module';
import { DepartmentHighlightsModule } from './department-highlights/department-highlights.module';
import { ContactChannelsModule } from './contact-channels/contact-channels.module';
import { ResearchModule } from './research/research.module';
import { DepartmentDisplaySettingsModule } from './department-display-settings/department-display-settings.module';
import { MailerModule } from './mailer/mailer.module';
import { CareerApplicationsModule } from './career-applications/career-applications.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { AdminNotificationsModule } from './admin-notifications/admin-notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Global per-IP rate limit. Generous on purpose: the public homepage
    // legitimately polls ~14 endpoints per interval and campus NAT can put
    // many visitors behind one IP. Sensitive routes tighten this with their
    // own @Throttle() override (see AuthController.login); the media file
    // server opts out entirely (@SkipThrottle - image grids burst-load).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 600 }]),
    PrismaModule,
    AuthModule,
    AuditLogModule,
    FacultyModule,
    NewsModule,
    GalleryModule,
    PlacementsModule,
    ExamNotificationsModule,
    DashboardModule,
    HomepageModule,
    DownloadsModule,
    CareersModule,
    EventsModule,
    DepartmentsModule,
    CommitteesModule,
    SiteSettingsModule,
    MediaModule,
    AdminsModule,
    RolesModule,
    LabsModule,
    LearningOutcomesModule,
    DepartmentProgrammesModule,
    DepartmentHighlightsModule,
    ContactChannelsModule,
    ResearchModule,
    DepartmentDisplaySettingsModule,
    MailerModule,
    CareerApplicationsModule,
    AnnouncementsModule,
    AdminNotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
