import { Test, TestingModule } from '@nestjs/testing';
import { QuickLinksService } from './quick-links.service';
import { ContentCardService } from '../content-cards/content-card.service';

// Detailed CRUD/optimistic-lock/reorder behavior is tested once, generically,
// in content-cards/content-card.service.spec.ts. This suite only confirms
// QuickLinksService is a correct thin wrapper - the actual regression guard
// for "the quick-links routes/behavior are unchanged after the Sprint 1B
// refactor" (see the plan's explicit "don't rename working APIs" decision).
describe('QuickLinksService (thin wrapper over ContentCardService)', () => {
  let service: QuickLinksService;
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
      providers: [QuickLinksService, { provide: ContentCardService, useValue: contentCards }],
    }).compile();

    service = module.get(QuickLinksService);
  });

  it('delegates create() with the homepage_quick_links audit module and "Quick link" label', async () => {
    await service.create({ section: 'homepage_quick_links' } as any, admin, 'req-1');

    expect(contentCards.create).toHaveBeenCalledWith(
      { section: 'homepage_quick_links' },
      admin,
      'homepage_quick_links',
      'Quick link',
      'req-1',
    );
  });

  it('delegates update() unchanged', async () => {
    await service.update(5, { version: 2 } as any, admin, 'req-2');

    expect(contentCards.update).toHaveBeenCalledWith(
      5,
      { version: 2 },
      admin,
      'homepage_quick_links',
      'Quick link',
      'req-2',
    );
  });

  it('delegates softDelete()/restore()/reorder() unchanged', async () => {
    await service.softDelete(1, admin, 'req-3');
    await service.restore(1, admin, 'req-4');
    await service.reorder({ section: 'homepage_quick_links', items: [] } as any, admin, 'req-5');

    expect(contentCards.softDelete).toHaveBeenCalledWith(1, admin, 'homepage_quick_links', 'Quick link', 'req-3');
    expect(contentCards.restore).toHaveBeenCalledWith(1, admin, 'homepage_quick_links', 'Quick link', 'req-4');
    expect(contentCards.reorder).toHaveBeenCalledWith(
      { section: 'homepage_quick_links', items: [] },
      admin,
      'homepage_quick_links',
      'Quick link',
      'req-5',
    );
  });
});
