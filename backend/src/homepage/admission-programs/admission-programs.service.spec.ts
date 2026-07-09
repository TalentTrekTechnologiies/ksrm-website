import { Test, TestingModule } from '@nestjs/testing';
import { AdmissionProgramsService } from './admission-programs.service';
import { ContentCardService } from '../content-cards/content-card.service';

describe('AdmissionProgramsService (thin wrapper over ContentCardService)', () => {
  let service: AdmissionProgramsService;
  let contentCards: Record<string, jest.Mock>;

  const admin = { id: 1, name: 'Admin', email: 'admin@ksrm.edu' };

  beforeEach(async () => {
    contentCards = {
      findAllPublic: jest.fn(),
      findAllAdmin: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
      reorder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AdmissionProgramsService, { provide: ContentCardService, useValue: contentCards }],
    }).compile();

    service = module.get(AdmissionProgramsService);
  });

  it('delegates create() with the homepage_admission_programs audit module and "Admission program" label', async () => {
    await service.create({ section: 'homepage_admission_programs' } as any, admin, 'req-1');

    expect(contentCards.create).toHaveBeenCalledWith(
      { section: 'homepage_admission_programs' },
      admin,
      'homepage_admission_programs',
      'Admission program',
      'req-1',
    );
  });

  it('delegates reorder() unchanged', async () => {
    await service.reorder({ section: 'homepage_admission_programs', items: [] } as any, admin, 'req-2');

    expect(contentCards.reorder).toHaveBeenCalledWith(
      { section: 'homepage_admission_programs', items: [] },
      admin,
      'homepage_admission_programs',
      'Admission program',
      'req-2',
    );
  });
});
