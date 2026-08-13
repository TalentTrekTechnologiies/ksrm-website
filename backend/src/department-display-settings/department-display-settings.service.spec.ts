import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentDisplaySettingsService } from './department-display-settings.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('DepartmentDisplaySettingsService', () => {
  let service: DepartmentDisplaySettingsService;
  let prisma: {
    departmentDisplaySetting: {
      findMany: jest.Mock;
      upsert: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let auditLog: { log: jest.Mock };

  const admin = { id: 1, name: 'Admin', email: 'admin@ksrm.edu' };

  beforeEach(async () => {
    prisma = {
      departmentDisplaySetting: {
        findMany: jest.fn(),
        upsert: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    auditLog = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentDisplaySettingsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();

    service = module.get(DepartmentDisplaySettingsService);
  });

  describe('getEffectiveSettings', () => {
    it('defaults every catalog key to true when the department has zero rows', async () => {
      prisma.departmentDisplaySetting.findMany.mockResolvedValue([]);

      const result = await service.getEffectiveSettings(3);

      expect(Object.values(result).every((v) => v === true)).toBe(true);
      expect(result['faculty.showEmail']).toBe(true);
    });

    it('overrides a catalog key when a row explicitly sets it false', async () => {
      prisma.departmentDisplaySetting.findMany.mockResolvedValue([
        { key: 'faculty.showEmail', value: false },
      ]);

      const result = await service.getEffectiveSettings(3);

      expect(result['faculty.showEmail']).toBe(false);
      expect(result['hod.showMessage']).toBe(true);
    });
  });

  describe('findAllAdmin', () => {
    it('flags isOverridden only for keys with a stored row', async () => {
      prisma.departmentDisplaySetting.findMany.mockResolvedValue([
        { key: 'faculty.showEmail', value: false },
      ]);

      const result = await service.findAllAdmin(3);

      const faculty = result.find((r) => r.key === 'faculty.showEmail');
      const hod = result.find((r) => r.key === 'hod.showMessage');
      expect(faculty).toMatchObject({ value: false, isOverridden: true });
      expect(hod).toMatchObject({ value: true, isOverridden: false });
    });
  });

  describe('set', () => {
    it('upserts one toggle and logs UPDATE', async () => {
      prisma.departmentDisplaySetting.upsert.mockResolvedValue({
        id: 1,
        key: 'labs.showEquipment',
        value: false,
      });

      await service.set(
        { departmentId: 3, key: 'labs.showEquipment', value: false },
        admin,
        undefined,
      );

      expect(prisma.departmentDisplaySetting.upsert).toHaveBeenCalledWith({
        where: {
          departmentId_key: { departmentId: 3, key: 'labs.showEquipment' },
        },
        create: {
          departmentId: 3,
          key: 'labs.showEquipment',
          value: false,
          updatedBy: 1,
        },
        update: { value: false, updatedBy: 1 },
      });
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE',
          module: 'department_display_settings',
        }),
      );
    });
  });

  describe('bulkSet', () => {
    it('upserts every item in a single transaction and re-fetches the admin view', async () => {
      prisma.$transaction.mockResolvedValue(undefined);
      prisma.departmentDisplaySetting.findMany.mockResolvedValue([]);

      await service.bulkSet(
        {
          departmentId: 3,
          settings: [
            { key: 'faculty.showEmail', value: false },
            { key: 'labs.showEquipment', value: true },
          ],
        },
        admin,
        'req-1',
      );

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'UPDATE', requestId: 'req-1' }),
      );
    });
  });
});
