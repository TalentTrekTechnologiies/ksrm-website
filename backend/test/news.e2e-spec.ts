import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/configure-app';
import { PrismaService } from './../src/prisma/prisma.service';

// Runs against the real local ksrm_db, same rationale as homepage.e2e-spec.ts.
process.env.DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5432/ksrm_db?schema=public';

describe('News module (e2e, real ksrm_db) - Sprint 1C upgrade', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let token: string;
  const createdNewsIds: number[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app, app.get(ConfigService));
    await app.init();
    prisma = app.get(PrismaService);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'superadmin@ksrm.edu', password: 'SuperAdmin@123' })
      .expect(201);
    token = loginRes.body.accessToken;
  });

  afterAll(async () => {
    if (createdNewsIds.length > 0) {
      await prisma.news.deleteMany({ where: { id: { in: createdNewsIds } } });
    }
    await app.close();
  });

  describe('Permission-key bug fix regression', () => {
    it('a "Viewer" role (news.view only) can list admin news but cannot create one - proves the bug is fixed with granular keys, not just relabeled', async () => {
      const viewerRole = await prisma.role.findUnique({
        where: { name: 'Viewer' },
      });
      expect(viewerRole).not.toBeNull();

      const hashedPassword = await bcrypt.hash('E2eTest@123', 10);
      const testAdmin = await prisma.admin.create({
        data: {
          email: `e2e-news-viewer-${Date.now()}@ksrm.edu`,
          password: hashedPassword,
          name: 'E2E News Viewer',
          isSuperAdmin: false,
          permissions: [],
          isActive: true,
        },
      });

      try {
        await prisma.adminRole.create({
          data: { adminId: testAdmin.id, roleId: viewerRole!.id },
        });

        const loginRes = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: testAdmin.email, password: 'E2eTest@123' })
          .expect(201);
        expect(loginRes.body.admin.permissions).toContain('news.view');
        expect(loginRes.body.admin.permissions).not.toContain('news.create');

        const viewerToken = loginRes.body.accessToken;

        // Can list (news.view).
        await request(app.getHttpServer())
          .get('/news/admin')
          .set('Authorization', `Bearer ${viewerToken}`)
          .expect(200);

        // Cannot create (needs news.create, which Viewer doesn't have) -
        // this is the exact regression check for the bare-'news' permission
        // bug: before the fix, this route checked for a key nobody was ever
        // granted, so even Super Admin would have been blocked here.
        await request(app.getHttpServer())
          .post('/news')
          .set('Authorization', `Bearer ${viewerToken}`)
          .send({
            title: 'x',
            content: 'x',
            category: 'General',
            date: '2026-01-01',
          })
          .expect(403);
      } finally {
        await prisma.admin.delete({ where: { id: testAdmin.id } });
      }
    });

    it('Super Admin (via the real granular keys) can create - confirms the fix actually works end to end', async () => {
      const res = await request(app.getHttpServer())
        .post('/news')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'e2e News Article',
          content: 'Body',
          category: 'General',
          date: '2026-01-01',
          isPublished: true,
        })
        .expect(201);
      createdNewsIds.push(res.body.id);
      expect(res.body.title).toBe('e2e News Article');
    });
  });

  describe('Draft visibility fix', () => {
    let draftId: number;

    it('a draft (isPublished: false) is visible to the admin list but not the public list', async () => {
      const res = await request(app.getHttpServer())
        .post('/news')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'e2e Draft Article',
          content: 'Body',
          category: 'General',
          date: '2026-01-01',
          isPublished: false,
        })
        .expect(201);
      draftId = res.body.id;
      createdNewsIds.push(draftId);

      const adminList = await request(app.getHttpServer())
        .get('/news/admin')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(adminList.body.some((n: { id: number }) => n.id === draftId)).toBe(
        true,
      );

      const publicList = await request(app.getHttpServer())
        .get('/news')
        .expect(200);
      expect(
        publicList.body.items.some((n: { id: number }) => n.id === draftId),
      ).toBe(false);
    });
  });

  describe('Soft delete/restore + optimistic lock (previously missing)', () => {
    let newsId: number;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/news')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'e2e Lock Test',
          content: 'Body',
          category: 'General',
          date: '2026-01-01',
        })
        .expect(201);
      newsId = res.body.id;
      createdNewsIds.push(newsId);
    });

    it('rejects a stale-version update with 409', async () => {
      await request(app.getHttpServer())
        .patch(`/news/${newsId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'e2e Lock Test Updated', version: 1 })
        .expect(200);

      const conflict = await request(app.getHttpServer())
        .patch(`/news/${newsId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'e2e Lock Test Updated Again', version: 1 })
        .expect(409);
      expect(conflict.body.message).toMatch(/changed by someone else/);
    });

    it('soft-deletes (not a hard delete) and restores', async () => {
      await request(app.getHttpServer())
        .delete(`/news/${newsId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const rawRow = await prisma.news.findUnique({ where: { id: newsId } });
      expect(rawRow).not.toBeNull(); // still exists - soft delete, not hard delete
      expect(rawRow?.deletedAt).not.toBeNull();

      const adminListExcluding = await request(app.getHttpServer())
        .get('/news/admin')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(
        adminListExcluding.body.some((n: { id: number }) => n.id === newsId),
      ).toBe(false);

      await request(app.getHttpServer())
        .post(`/news/${newsId}/restore`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      const afterRestore = await request(app.getHttpServer())
        .get('/news/admin')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(
        afterRestore.body.some((n: { id: number }) => n.id === newsId),
      ).toBe(true);
    });
  });

  describe('Latest News homepage section visibility', () => {
    afterEach(async () => {
      await request(app.getHttpServer())
        .patch('/homepage/admin/section-visibility/latestNews')
        .set('Authorization', `Bearer ${token}`)
        .send({ visible: true });
    });

    it('hiding latestNews makes GET /news return { visible: false, items: [] }', async () => {
      await request(app.getHttpServer())
        .patch('/homepage/admin/section-visibility/latestNews')
        .set('Authorization', `Bearer ${token}`)
        .send({ visible: false })
        .expect(200);

      const publicRes = await request(app.getHttpServer())
        .get('/news')
        .expect(200);
      expect(publicRes.body).toEqual({ visible: false, items: [] });
    });
  });
});
