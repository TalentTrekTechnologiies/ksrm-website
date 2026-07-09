import { Injectable, Logger } from '@nestjs/common';
import { HeroService } from './hero/hero.service';
import { StatisticsService } from './statistics/statistics.service';
import { QuickLinksService } from './quick-links/quick-links.service';
import { AdmissionProgramsService } from './admission-programs/admission-programs.service';
import { SectionsService } from './sections/sections.service';
import { TestimonialsService } from './testimonials/testimonials.service';
import { CampusVideosService } from './campus-videos/campus-videos.service';
import { AccreditationBadgesService } from './accreditation-badges/accreditation-badges.service';
import { RecruitersService } from './recruiters/recruiters.service';
import { DepartmentsService } from './departments/departments.service';

const SECTION_KEYS = ['vision', 'mission', 'about', 'admissions'] as const;

/**
 * Public-site aggregator - one call for everything wired up so far, so the
 * (fully static-exported) homepage doesn't need N separate client-side
 * fetches. Extended each sprint as more pieces come online, not rebuilt -
 * mirrors DashboardService's safe-per-piece pattern so one broken piece
 * degrades gracefully instead of failing the whole response.
 *
 * As of Sprint 1C, no frontend component actually calls this route - every
 * public component fetches its own dedicated endpoint instead (confirmed by
 * search; see the Sprint 1C plan's "Key decisions" #5). Kept extended for
 * completeness/future use, not because anything currently depends on it -
 * this is deliberately NOT the hot path, so it stays fine for it to return
 * more data than any single section needs.
 */
@Injectable()
export class HomepageService {
  private readonly logger = new Logger(HomepageService.name);

  constructor(
    private readonly heroService: HeroService,
    private readonly statisticsService: StatisticsService,
    private readonly quickLinksService: QuickLinksService,
    private readonly admissionProgramsService: AdmissionProgramsService,
    private readonly sectionsService: SectionsService,
    private readonly testimonialsService: TestimonialsService,
    private readonly campusVideosService: CampusVideosService,
    private readonly accreditationBadgesService: AccreditationBadgesService,
    private readonly recruitersService: RecruitersService,
    private readonly departmentsService: DepartmentsService,
  ) {}

  private async safe<T>(
    fn: () => Promise<T>,
    fallback: T,
    label: string,
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.logger.warn(
        `Homepage aggregator piece "${label}" failed - falling back instead of failing the whole request.`,
        error instanceof Error ? error.message : error,
      );
      return fallback;
    }
  }

  async getPublicPayload() {
    const [
      hero,
      statistics,
      placementStatistics,
      quickLinks,
      admissionPrograms,
      sectionEntries,
      testimonials,
      campusVideos,
      accreditationBadges,
      recruiters,
      departments,
    ] = await Promise.all([
      this.safe(() => this.heroService.getPublic(), null, 'hero'),
      this.safe(
        () => this.statisticsService.findAllPublic('homepage'),
        [],
        'statistics',
      ),
      this.safe(
        () => this.statisticsService.findAllPublic('homepage_placements'),
        [],
        'placementStatistics',
      ),
      this.safe(
        () => this.quickLinksService.findAllPublic('homepage_quick_links'),
        [],
        'quickLinks',
      ),
      this.safe(
        () =>
          this.admissionProgramsService.findAllPublic(
            'homepage_admission_programs',
          ),
        [],
        'admissionPrograms',
      ),
      this.safe(
        () =>
          Promise.all(
            SECTION_KEYS.map(
              async (key) =>
                [key, await this.sectionsService.findPublicByKey(key)] as const,
            ),
          ),
        SECTION_KEYS.map((key) => [key, null] as const),
        'sections',
      ),
      this.safe(
        () => this.testimonialsService.findAllPublic(),
        [],
        'testimonials',
      ),
      this.safe(
        () => this.campusVideosService.findAllPublic(),
        [],
        'campusVideos',
      ),
      this.safe(
        () => this.accreditationBadgesService.findAllPublic(),
        [],
        'accreditationBadges',
      ),
      this.safe(() => this.recruitersService.findAllPublic(), [], 'recruiters'),
      this.safe(
        () => this.departmentsService.findAllPublic('homepage_departments'),
        [],
        'departments',
      ),
    ]);

    const sections = Object.fromEntries(sectionEntries) as Record<
      (typeof SECTION_KEYS)[number],
      Awaited<ReturnType<SectionsService['findPublicByKey']>>
    >;

    return {
      hero,
      statistics,
      placementStatistics,
      quickLinks,
      admissionPrograms,
      sections,
      testimonials,
      campusVideos,
      accreditationBadges,
      recruiters,
      departments,
    };
  }
}
