import { Test, TestingModule } from '@nestjs/testing';
import { HomepageService } from './homepage.service';
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

describe('HomepageService', () => {
  let service: HomepageService;
  let heroService: { getPublic: jest.Mock };
  let statisticsService: { findAllPublic: jest.Mock };
  let quickLinksService: { findAllPublic: jest.Mock };
  let admissionProgramsService: { findAllPublic: jest.Mock };
  let sectionsService: { findPublicByKey: jest.Mock };
  let testimonialsService: { findAllPublic: jest.Mock };
  let campusVideosService: { findAllPublic: jest.Mock };
  let accreditationBadgesService: { findAllPublic: jest.Mock };
  let recruitersService: { findAllPublic: jest.Mock };
  let departmentsService: { findAllPublic: jest.Mock };

  beforeEach(async () => {
    heroService = { getPublic: jest.fn() };
    statisticsService = { findAllPublic: jest.fn() };
    quickLinksService = { findAllPublic: jest.fn() };
    admissionProgramsService = {
      findAllPublic: jest.fn().mockResolvedValue([]),
    };
    sectionsService = { findPublicByKey: jest.fn().mockResolvedValue(null) };
    testimonialsService = { findAllPublic: jest.fn().mockResolvedValue([]) };
    campusVideosService = { findAllPublic: jest.fn().mockResolvedValue([]) };
    accreditationBadgesService = {
      findAllPublic: jest.fn().mockResolvedValue([]),
    };
    recruitersService = { findAllPublic: jest.fn().mockResolvedValue([]) };
    departmentsService = { findAllPublic: jest.fn().mockResolvedValue([]) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomepageService,
        { provide: HeroService, useValue: heroService },
        { provide: StatisticsService, useValue: statisticsService },
        { provide: QuickLinksService, useValue: quickLinksService },
        {
          provide: AdmissionProgramsService,
          useValue: admissionProgramsService,
        },
        { provide: SectionsService, useValue: sectionsService },
        { provide: TestimonialsService, useValue: testimonialsService },
        { provide: CampusVideosService, useValue: campusVideosService },
        {
          provide: AccreditationBadgesService,
          useValue: accreditationBadgesService,
        },
        { provide: RecruitersService, useValue: recruitersService },
        { provide: DepartmentsService, useValue: departmentsService },
      ],
    }).compile();

    service = module.get(HomepageService);
  });

  it('assembles hero, both statistic groups, quick links, admission programs, sections, and the Sprint 1C sections into one payload', async () => {
    heroService.getPublic.mockResolvedValue({ id: 1, heading: 'Hi' });
    statisticsService.findAllPublic
      .mockResolvedValueOnce([{ id: 1 }])
      .mockResolvedValueOnce([{ id: 2 }]);
    quickLinksService.findAllPublic.mockResolvedValue([{ id: 3 }]);
    admissionProgramsService.findAllPublic.mockResolvedValue([{ id: 4 }]);
    sectionsService.findPublicByKey.mockImplementation((key: string) =>
      Promise.resolve({ key, content: {} }),
    );
    testimonialsService.findAllPublic.mockResolvedValue([{ id: 5 }]);
    campusVideosService.findAllPublic.mockResolvedValue([{ id: 6 }]);
    accreditationBadgesService.findAllPublic.mockResolvedValue([{ id: 7 }]);
    recruitersService.findAllPublic.mockResolvedValue([{ id: 8 }]);
    departmentsService.findAllPublic.mockResolvedValue([{ id: 9 }]);

    const result = await service.getPublicPayload();

    expect(result.hero).toEqual({ id: 1, heading: 'Hi' });
    expect(result.statistics).toEqual([{ id: 1 }]);
    expect(result.placementStatistics).toEqual([{ id: 2 }]);
    expect(result.quickLinks).toEqual([{ id: 3 }]);
    expect(result.admissionPrograms).toEqual([{ id: 4 }]);
    expect(result.sections).toEqual({
      vision: { key: 'vision', content: {} },
      mission: { key: 'mission', content: {} },
      about: { key: 'about', content: {} },
      admissions: { key: 'admissions', content: {} },
    });
    expect(result.testimonials).toEqual([{ id: 5 }]);
    expect(result.campusVideos).toEqual([{ id: 6 }]);
    expect(result.accreditationBadges).toEqual([{ id: 7 }]);
    expect(result.recruiters).toEqual([{ id: 8 }]);
    expect(result.departments).toEqual([{ id: 9 }]);
  });

  it('degrades a failing piece to its fallback instead of failing the whole request', async () => {
    heroService.getPublic.mockRejectedValue(
      new Error('relation does not exist'),
    );
    statisticsService.findAllPublic.mockResolvedValue([]);
    quickLinksService.findAllPublic.mockResolvedValue([]);

    const result = await service.getPublicPayload();

    expect(result.hero).toBeNull();
    expect(result.statistics).toEqual([]);
  });

  it('degrades the sections piece to all-null if one section lookup throws', async () => {
    heroService.getPublic.mockResolvedValue(null);
    statisticsService.findAllPublic.mockResolvedValue([]);
    quickLinksService.findAllPublic.mockResolvedValue([]);
    admissionProgramsService.findAllPublic.mockResolvedValue([]);
    sectionsService.findPublicByKey.mockRejectedValue(
      new Error('relation does not exist'),
    );

    const result = await service.getPublicPayload();

    expect(result.sections).toEqual({
      vision: null,
      mission: null,
      about: null,
      admissions: null,
    });
  });

  it('degrades a failing Sprint 1C piece (e.g. recruiters) to an empty array', async () => {
    heroService.getPublic.mockResolvedValue(null);
    statisticsService.findAllPublic.mockResolvedValue([]);
    quickLinksService.findAllPublic.mockResolvedValue([]);
    admissionProgramsService.findAllPublic.mockResolvedValue([]);
    recruitersService.findAllPublic.mockRejectedValue(
      new Error('relation does not exist'),
    );

    const result = await service.getPublicPayload();

    expect(result.recruiters).toEqual([]);
  });
});
