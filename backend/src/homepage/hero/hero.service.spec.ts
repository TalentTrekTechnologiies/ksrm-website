import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { HeroService } from './hero.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit-log/audit-log.service';

describe('HeroService', () => {
  let service: HeroService;
  let prisma: {
    homepageHero: {
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };
  let auditLog: { log: jest.Mock };

  const admin = { id: 1, name: 'Super Administrator', email: 'superadmin@ksrm.edu' };

  beforeEach(async () => {
    prisma = {
      homepageHero: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    auditLog = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeroService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();

    service = module.get(HeroService);
  });

  describe('create', () => {
    it('creates the singleton hero when none exists yet', async () => {
      prisma.homepageHero.findFirst.mockResolvedValue(null);
      prisma.homepageHero.create.mockResolvedValue({ id: 1, heading: 'Hi', version: 1 });

      const result = await service.create(
        { heading: 'Hi', subtitle: 'Sub', videoUrl: '/a.mp4' } as any,
        admin,
        'req-1',
      );

      expect(result).toEqual({ id: 1, heading: 'Hi', version: 1 });
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'CREATE', module: 'homepage_hero', requestId: 'req-1' }),
      );
    });

    it('rejects a second create with 409 once a hero already exists', async () => {
      prisma.homepageHero.findFirst.mockResolvedValue({ id: 1, version: 1 });

      await expect(
        service.create({ heading: 'x', subtitle: 'y', videoUrl: '/a.mp4' } as any, admin, undefined),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.homepageHero.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('404s when no hero exists yet', async () => {
      prisma.homepageHero.findFirst.mockResolvedValue(null);

      await expect(
        service.update({ heading: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('409s on a stale version (optimistic lock conflict)', async () => {
      prisma.homepageHero.findFirst.mockResolvedValue({ id: 1, version: 3 });

      await expect(
        service.update({ heading: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.homepageHero.update).not.toHaveBeenCalled();
    });

    it('updates and increments version when the version matches', async () => {
      prisma.homepageHero.findFirst.mockResolvedValue({ id: 1, version: 1, heading: 'old' });
      prisma.homepageHero.update.mockResolvedValue({ id: 1, version: 2, heading: 'new' });

      const result = await service.update({ heading: 'new', version: 1 } as any, admin, 'req-2');

      expect(prisma.homepageHero.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({ heading: 'new', version: { increment: 1 } }),
        }),
      );
      expect(result.version).toBe(2);
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'UPDATE', module: 'homepage_hero', requestId: 'req-2' }),
      );
    });
  });
});
