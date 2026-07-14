import { Module } from '@nestjs/common';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { AuthModule } from '../auth/auth.module';
import { HomepageController } from './homepage.controller';
import { HomepageService } from './homepage.service';
import { HeroController } from './hero/hero.controller';
import { HeroService } from './hero/hero.service';
import { StatisticsController } from './statistics/statistics.controller';
import { StatisticsService } from './statistics/statistics.service';
import { ContentCardService } from './content-cards/content-card.service';
import { QuickLinksController } from './quick-links/quick-links.controller';
import { QuickLinksService } from './quick-links/quick-links.service';
import { AdmissionProgramsController } from './admission-programs/admission-programs.controller';
import { AdmissionProgramsService } from './admission-programs/admission-programs.service';
import { SectionsController } from './sections/sections.controller';
import { SectionsService } from './sections/sections.service';
import { TestimonialsController } from './testimonials/testimonials.controller';
import { TestimonialsService } from './testimonials/testimonials.service';
import { CampusVideosController } from './campus-videos/campus-videos.controller';
import { CampusVideosService } from './campus-videos/campus-videos.service';
import { AccreditationBadgesController } from './accreditation-badges/accreditation-badges.controller';
import { AccreditationBadgesService } from './accreditation-badges/accreditation-badges.service';
import { RecruitersController } from './recruiters/recruiters.controller';
import { RecruitersService } from './recruiters/recruiters.service';
import { DepartmentsController } from './departments/departments.controller';
import { DepartmentsService } from './departments/departments.service';
import { SectionVisibilityModule } from './section-visibility/section-visibility.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [AuditLogModule, AuthModule, SectionVisibilityModule, MediaModule],
  controllers: [
    HomepageController,
    HeroController,
    StatisticsController,
    QuickLinksController,
    AdmissionProgramsController,
    SectionsController,
    TestimonialsController,
    CampusVideosController,
    AccreditationBadgesController,
    RecruitersController,
    DepartmentsController,
  ],
  providers: [
    HomepageService,
    HeroService,
    StatisticsService,
    ContentCardService,
    QuickLinksService,
    AdmissionProgramsService,
    SectionsService,
    TestimonialsService,
    CampusVideosService,
    AccreditationBadgesService,
    RecruitersService,
    DepartmentsService,
  ],
})
export class HomepageModule {}
