import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsService } from './departments.service';
import { ContentCardService } from '../content-cards/content-card.service';

describe('DepartmentsService (thin wrapper over ContentCardService)', () => {
  let service: DepartmentsService;
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
      providers: [
        DepartmentsService,
        { provide: ContentCardService, useValue: contentCards },
      ],
    }).compile();

    service = module.get(DepartmentsService);
  });

  it('delegates create() with the homepage_departments audit module and "Department card" label', async () => {
    await service.create(
      { section: 'homepage_departments' } as any,
      admin,
      'req-1',
    );

    expect(contentCards.create).toHaveBeenCalledWith(
      { section: 'homepage_departments' },
      admin,
      'homepage_departments',
      'Department card',
      'req-1',
    );
  });

  it('delegates reorder() unchanged', async () => {
    await service.reorder(
      { section: 'homepage_departments', items: [] } as any,
      admin,
      'req-2',
    );

    expect(contentCards.reorder).toHaveBeenCalledWith(
      { section: 'homepage_departments', items: [] },
      admin,
      'homepage_departments',
      'Department card',
      'req-2',
    );
  });
});
