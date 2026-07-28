import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { MediaFoldersService } from './media-folders.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

const admin = { id: 1, name: 'Admin', email: 'admin@ksrm.edu' };

function p2002() {
  return new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: '5.22.0',
  });
}

describe('MediaFoldersService', () => {
  let service: MediaFoldersService;
  let prisma: {
    mediaFolder: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
    media: { count: jest.Mock };
    $transaction: jest.Mock;
  };
  let auditLog: { log: jest.Mock };

  beforeEach(async () => {
    prisma = {
      mediaFolder: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      media: { count: jest.fn() },
      $transaction: jest.fn().mockResolvedValue(undefined),
    };
    auditLog = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaFoldersService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();

    service = module.get(MediaFoldersService);
  });

  describe('create', () => {
    it('slugifies the name into a root path when no parent is given', async () => {
      prisma.mediaFolder.create.mockResolvedValue({ id: 1, name: 'Departments', path: 'departments' });

      await service.create({ name: 'Departments' });

      expect(prisma.mediaFolder.create).toHaveBeenCalledWith({
        data: { name: 'Departments', parentId: null, path: 'departments' },
      });
    });

    it('joins onto the parent path when a parentId is given', async () => {
      prisma.mediaFolder.findUnique.mockResolvedValue({ id: 1, path: 'departments' });
      prisma.mediaFolder.create.mockResolvedValue({ id: 2, name: 'CSE', path: 'departments/cse' });

      await service.create({ name: 'CSE', parentId: 1 });

      expect(prisma.mediaFolder.create).toHaveBeenCalledWith({
        data: { name: 'CSE', parentId: 1, path: 'departments/cse' },
      });
    });

    it('404s when the given parentId does not exist', async () => {
      prisma.mediaFolder.findUnique.mockResolvedValue(null);

      await expect(service.create({ name: 'CSE', parentId: 99 })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('turns a duplicate-sibling-name unique violation into a 400', async () => {
      prisma.mediaFolder.create.mockRejectedValue(p2002());

      await expect(service.create({ name: 'Departments' })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('writes an audit entry when an admin creates a folder', async () => {
      prisma.mediaFolder.create.mockResolvedValue({ id: 7, name: 'Reports', path: 'reports' });

      await service.create({ name: 'Reports' }, admin);

      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CREATE',
          module: 'media_folders',
          targetId: 7,
          adminId: admin.id,
        }),
      );
    });
  });

  describe('update', () => {
    it('rejects a folder being set as its own parent', async () => {
      prisma.mediaFolder.findUnique.mockResolvedValue({ id: 1, name: 'X', parentId: null, path: 'x' });

      await expect(service.update(1, { parentId: 1 })).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects moving a folder into its own subtree', async () => {
      // 1 (root) -> 2 (child). Attempting to move 1 under 2 must fail.
      prisma.mediaFolder.findUnique.mockImplementation(({ where: { id } }: { where: { id: number } }) => {
        if (id === 1) return Promise.resolve({ id: 1, name: 'Root', parentId: null, path: 'root' });
        if (id === 2) return Promise.resolve({ id: 2, name: 'Child', parentId: 1, path: 'root/child' });
        return Promise.resolve(null);
      });

      await expect(service.update(1, { parentId: 2 })).rejects.toBeInstanceOf(BadRequestException);
    });

    it('renames in place and recomputes descendant paths when the path changes', async () => {
      prisma.mediaFolder.findUnique.mockResolvedValue({
        id: 1,
        name: 'Old',
        parentId: null,
        path: 'old',
      });
      prisma.mediaFolder.update.mockResolvedValue({ id: 1, name: 'New', path: 'new' });
      prisma.mediaFolder.findMany.mockResolvedValue([
        { id: 2, path: 'old/child' },
      ]);

      await service.update(1, { name: 'New' });

      expect(prisma.mediaFolder.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'New', parentId: null, path: 'new' },
      });
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('refuses to delete a folder that still has subfolders or files', async () => {
      prisma.mediaFolder.findUnique.mockResolvedValue({ id: 1, name: 'X', path: 'x' });
      prisma.mediaFolder.count.mockResolvedValue(1);
      prisma.media.count.mockResolvedValue(0);

      await expect(service.delete(1)).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.mediaFolder.delete).not.toHaveBeenCalled();
    });

    it('deletes an empty folder', async () => {
      prisma.mediaFolder.findUnique.mockResolvedValue({ id: 1, name: 'X', path: 'x' });
      prisma.mediaFolder.count.mockResolvedValue(0);
      prisma.media.count.mockResolvedValue(0);
      prisma.mediaFolder.delete.mockResolvedValue({ id: 1 });

      await service.delete(1);

      expect(prisma.mediaFolder.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
