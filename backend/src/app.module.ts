import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { FacultyModule } from './faculty/faculty.module';
import { NewsModule } from './news/news.module';
import { GalleryModule } from './gallery/gallery.module';
import { PlacementsModule } from './placements/placements.module';
import { DegreeVerificationModule } from './degree-verification/degree-verification.module';
import { ExamNotificationsModule } from './exam-notifications/exam-notifications.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { AuditLogModule } from './audit-log/audit-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    AuditLogModule,
    FacultyModule,
    NewsModule,
    GalleryModule,
    PlacementsModule,
    DegreeVerificationModule,
    ExamNotificationsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
