import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/configure-app';
import { PrismaService } from './../src/prisma/prisma.service';

// Unlike app.e2e-spec.ts (which deliberately uses a placeholder
// DATABASE_URL so it can run without any database), optimistic locking and
// soft-delete/restore are exactly the behaviors that most need testing
// against a real database rather than mocks - this suite runs against the
// actual local ksrm_db now that it's available, per the Sprint 1A
// verification plan. Every row this suite creates is cleaned up in
// afterAll so repeated runs don't accumulate test data in a real dev DB.
process.env.DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5432/ksrm_db?schema=public';

describe('Homepage CMS (e2e, real ksrm_db)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let token: string;
  const createdStatisticIds: number[] = [];
  const createdAdmissionProgramIds: number[] = [];
  const createdTestimonialIds: number[] = [];
  const createdCampusVideoIds: number[] = [];
  const createdAccreditationBadgeIds: number[] = [];
  const createdRecruiterIds: number[] = [];
  const createdDepartmentCardIds: number[] = [];

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
    if (createdStatisticIds.length > 0) {
      await prisma.siteStatistic.deleteMany({
        where: { id: { in: createdStatisticIds } },
      });
    }
    if (createdAdmissionProgramIds.length > 0) {
      await prisma.contentCard.deleteMany({
        where: { id: { in: createdAdmissionProgramIds } },
      });
    }
    if (createdTestimonialIds.length > 0) {
      await prisma.testimonial.deleteMany({
        where: { id: { in: createdTestimonialIds } },
      });
    }
    if (createdCampusVideoIds.length > 0) {
      await prisma.campusVideo.deleteMany({
        where: { id: { in: createdCampusVideoIds } },
      });
    }
    if (createdAccreditationBadgeIds.length > 0) {
      await prisma.accreditationBadge.deleteMany({
        where: { id: { in: createdAccreditationBadgeIds } },
      });
    }
    if (createdRecruiterIds.length > 0) {
      await prisma.recruiter.deleteMany({
        where: { id: { in: createdRecruiterIds } },
      });
    }
    if (createdDepartmentCardIds.length > 0) {
      await prisma.contentCard.deleteMany({
        where: { id: { in: createdDepartmentCardIds } },
      });
    }
    await app.close();
  });

  describe('optimistic locking on Statistics', () => {
    let statId: number;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/homepage/admin/statistics')
        .set('Authorization', `Bearer ${token}`)
        .send({
          scope: 'homepage',
          label: 'e2e optimistic lock test',
          value: 1,
        })
        .expect(201);
      statId = res.body.id;
      createdStatisticIds.push(statId);
    });

    it('accepts an update whose version matches the current row', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/homepage/admin/statistics/${statId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ label: 'updated once', version: 1 })
        .expect(200);

      expect(res.body.label).toBe('updated once');
      expect(res.body.version).toBe(2);
    });

    it('rejects a second update that still sends the now-stale version with 409', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/homepage/admin/statistics/${statId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ label: 'updated twice with stale version', version: 1 })
        .expect(409);

      expect(res.body.message).toMatch(/changed by someone else/);

      // Confirm the row was NOT actually modified by the rejected request.
      const current = await prisma.siteStatistic.findUnique({
        where: { id: statId },
      });
      expect(current?.label).toBe('updated once');
      expect(current?.version).toBe(2);
    });

    it('accepts the update once the caller uses the current version', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/homepage/admin/statistics/${statId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ label: 'updated correctly', version: 2 })
        .expect(200);

      expect(res.body.version).toBe(3);
    });
  });

  describe('soft delete + restore on Statistics', () => {
    let statId: number;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/homepage/admin/statistics')
        .set('Authorization', `Bearer ${token}`)
        .send({ scope: 'homepage', label: 'e2e soft delete test', value: 1 })
        .expect(201);
      statId = res.body.id;
      createdStatisticIds.push(statId);
    });

    it('excludes a soft-deleted row from the public list but keeps the row in the database', async () => {
      const before = await request(app.getHttpServer())
        .get('/homepage/statistics')
        .query({ group: 'homepage' })
        .expect(200);
      expect(before.body.some((s: { id: number }) => s.id === statId)).toBe(
        true,
      );

      await request(app.getHttpServer())
        .delete(`/homepage/admin/statistics/${statId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const after = await request(app.getHttpServer())
        .get('/homepage/statistics')
        .query({ group: 'homepage' })
        .expect(200);
      expect(after.body.some((s: { id: number }) => s.id === statId)).toBe(
        false,
      );

      const rawRow = await prisma.siteStatistic.findUnique({
        where: { id: statId },
      });
      expect(rawRow).not.toBeNull();
      expect(rawRow?.deletedAt).not.toBeNull();
      expect(rawRow?.deletedBy).not.toBeNull();
    });

    it('brings a soft-deleted row back via restore', async () => {
      await request(app.getHttpServer())
        .post(`/homepage/admin/statistics/${statId}/restore`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      const after = await request(app.getHttpServer())
        .get('/homepage/statistics')
        .query({ group: 'homepage' })
        .expect(200);
      expect(after.body.some((s: { id: number }) => s.id === statId)).toBe(
        true,
      );

      const rawRow = await prisma.siteStatistic.findUnique({
        where: { id: statId },
      });
      expect(rawRow?.deletedAt).toBeNull();
      expect(rawRow?.deletedBy).toBeNull();
    });
  });

  describe('RBAC end-to-end against real role assignments', () => {
    it('rejects an unauthenticated request', async () => {
      await request(app.getHttpServer())
        .get('/homepage/admin/statistics')
        .expect(401);
    });

    it('rejects an authenticated admin with no homepage permission', async () => {
      const hashedPassword = await bcrypt.hash('E2eTest@123', 10);
      const testAdmin = await prisma.admin.create({
        data: {
          email: `e2e-no-role-${Date.now()}@ksrm.edu`,
          password: hashedPassword,
          name: 'E2E No Role',
          isSuperAdmin: false,
          permissions: [],
          isActive: true,
        },
      });

      try {
        const loginRes = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: testAdmin.email, password: 'E2eTest@123' })
          .expect(201);

        expect(loginRes.body.admin.permissions).toEqual([]);

        await request(app.getHttpServer())
          .get('/homepage/admin/statistics')
          .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
          .expect(403);
      } finally {
        await prisma.admin.delete({ where: { id: testAdmin.id } });
      }
    });
  });

  describe('Sections: optimistic locking + publish/unpublish (Sprint 1B)', () => {
    it('rejects a stale-version update with 409 and leaves the row untouched', async () => {
      const current = await request(app.getHttpServer())
        .get('/homepage/admin/sections/mission')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      const staleVersion = current.body.version;

      // Bump the version once so the next attempt with `staleVersion` is guaranteed stale.
      await request(app.getHttpServer())
        .patch('/homepage/admin/sections/mission')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: current.body.content,
          status: current.body.status,
          version: staleVersion,
        })
        .expect(200);

      const conflictRes = await request(app.getHttpServer())
        .patch('/homepage/admin/sections/mission')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: current.body.content,
          status: current.body.status,
          version: staleVersion,
        })
        .expect(409);
      expect(conflictRes.body.message).toMatch(/changed by someone else/);
    });

    it('logs PUBLISH/UNPUBLISH on status transitions and UPDATE on content-only saves, restoring original content', async () => {
      const current = await request(app.getHttpServer())
        .get('/homepage/admin/sections/mission')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      const originalContent = current.body.content;
      let version = current.body.version;

      // DRAFT
      const unpublishRes = await request(app.getHttpServer())
        .patch('/homepage/admin/sections/mission')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: originalContent, status: 'DRAFT', version })
        .expect(200);
      version = unpublishRes.body.version;
      expect(unpublishRes.body.status).toBe('DRAFT');

      // Public endpoint must not return a Draft section.
      const publicWhileDraft = await request(app.getHttpServer())
        .get('/homepage/sections/mission')
        .expect(200);
      expect(publicWhileDraft.body).toEqual({});

      // PUBLISHED again, restoring the original content.
      const publishRes = await request(app.getHttpServer())
        .patch('/homepage/admin/sections/mission')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: originalContent, status: 'PUBLISHED', version })
        .expect(200);
      version = publishRes.body.version;
      expect(publishRes.body.status).toBe('PUBLISHED');
      expect(publishRes.body.content).toEqual(originalContent);

      const publicAfterRepublish = await request(app.getHttpServer())
        .get('/homepage/sections/mission')
        .expect(200);
      expect(publicAfterRepublish.body.content).toEqual(originalContent);

      const history = await request(app.getHttpServer())
        .get('/audit-logs/target')
        .query({
          module: 'homepage_section_mission',
          targetId: current.body.id,
        })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      const actions = history.body.map(
        (entry: { action: string }) => entry.action,
      );
      expect(actions.slice(0, 2)).toEqual(['PUBLISH', 'UNPUBLISH']);
    });

    it('rejects invalid content (empty About paragraphs) with a field-level 400', async () => {
      const current = await request(app.getHttpServer())
        .get('/homepage/admin/sections/about')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const res = await request(app.getHttpServer())
        .patch('/homepage/admin/sections/about')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: { ...current.body.content, paragraphs: [] },
          status: current.body.status,
          version: current.body.version,
        })
        .expect(400);
      expect(res.body.message.join(' ')).toMatch(/paragraphs/);
    });
  });

  describe('Admission Programs: CRUD + soft delete/restore (Sprint 1B)', () => {
    let programId: number;

    it('creates a program with structured branches (not a comma-separated string)', async () => {
      const res = await request(app.getHttpServer())
        .post('/homepage/admin/admission-programs')
        .set('Authorization', `Bearer ${token}`)
        .send({
          section: 'homepage_admission_programs',
          imageUrl: '/e2e-test.png',
          title: 'e2e Test Programme',
          linkUrl: '/e2e-test',
          tags: ['CSE', 'AI & DS'],
        })
        .expect(201);
      programId = res.body.id;
      createdAdmissionProgramIds.push(programId);
      expect(res.body.tags).toEqual(['CSE', 'AI & DS']);
    });

    it('rejects a program with zero branches', async () => {
      await request(app.getHttpServer())
        .post('/homepage/admin/admission-programs')
        .set('Authorization', `Bearer ${token}`)
        .send({
          section: 'homepage_admission_programs',
          imageUrl: '/e2e-test-2.png',
          title: 'e2e Test Programme 2',
          linkUrl: '/e2e-test-2',
          tags: [],
        })
        .expect(400);
    });

    it('soft-deletes and restores, excluding/including it from the public list correctly', async () => {
      await request(app.getHttpServer())
        .delete(`/homepage/admin/admission-programs/${programId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const afterDelete = await request(app.getHttpServer())
        .get('/homepage/admission-programs')
        .query({ section: 'homepage_admission_programs' })
        .expect(200);
      expect(
        afterDelete.body.some((p: { id: number }) => p.id === programId),
      ).toBe(false);

      await request(app.getHttpServer())
        .post(`/homepage/admin/admission-programs/${programId}/restore`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      const afterRestore = await request(app.getHttpServer())
        .get('/homepage/admission-programs')
        .query({ section: 'homepage_admission_programs' })
        .expect(200);
      expect(
        afterRestore.body.some((p: { id: number }) => p.id === programId),
      ).toBe(true);
    });
  });

  describe('Quick Links regression guard (unchanged routes post-refactor)', () => {
    it('GET /homepage/quick-links still responds 200 with the expected shape', async () => {
      const res = await request(app.getHttpServer())
        .get('/homepage/quick-links')
        .query({ section: 'homepage_quick_links' })
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('section', 'homepage_quick_links');
      }
    });

    it('GET /homepage/admin/quick-links still requires homepage.view', async () => {
      await request(app.getHttpServer())
        .get('/homepage/admin/quick-links')
        .expect(401);
    });
  });

  describe('Testimonials: CRUD + optimistic lock + soft delete/restore + RBAC (Sprint 1C)', () => {
    let testimonialId: number;

    it('creates a testimonial', async () => {
      const res = await request(app.getHttpServer())
        .post('/homepage/admin/testimonials')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'e2e Student',
          role: 'B.Tech CSE 2026',
          quote: 'Great college.',
          rating: 5,
        })
        .expect(201);
      testimonialId = res.body.id;
      createdTestimonialIds.push(testimonialId);
      expect(res.body.rating).toBe(5);
    });

    it('rejects a rating outside 1-5', async () => {
      await request(app.getHttpServer())
        .post('/homepage/admin/testimonials')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'e2e Student 2',
          role: 'B.Tech ECE 2026',
          quote: 'x',
          rating: 6,
        })
        .expect(400);
    });

    it('appears in the public list wrapped as { visible, items }', async () => {
      const res = await request(app.getHttpServer())
        .get('/homepage/testimonials')
        .expect(200);
      expect(res.body).toHaveProperty('visible', true);
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(
        res.body.items.some((t: { id: number }) => t.id === testimonialId),
      ).toBe(true);
    });

    it('rejects a stale-version update with 409', async () => {
      await request(app.getHttpServer())
        .patch(`/homepage/admin/testimonials/${testimonialId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'e2e Student Updated', version: 1 })
        .expect(200);

      const conflict = await request(app.getHttpServer())
        .patch(`/homepage/admin/testimonials/${testimonialId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'e2e Student Updated Again', version: 1 })
        .expect(409);
      expect(conflict.body.message).toMatch(/changed by someone else/);
    });

    it('soft-deletes and restores, excluding/including it from the public list correctly', async () => {
      await request(app.getHttpServer())
        .delete(`/homepage/admin/testimonials/${testimonialId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const afterDelete = await request(app.getHttpServer())
        .get('/homepage/testimonials')
        .expect(200);
      expect(
        afterDelete.body.items.some(
          (t: { id: number }) => t.id === testimonialId,
        ),
      ).toBe(false);

      await request(app.getHttpServer())
        .post(`/homepage/admin/testimonials/${testimonialId}/restore`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      const afterRestore = await request(app.getHttpServer())
        .get('/homepage/testimonials')
        .expect(200);
      expect(
        afterRestore.body.items.some(
          (t: { id: number }) => t.id === testimonialId,
        ),
      ).toBe(true);
    });

    it('rejects a non-homepage-permissioned admin from the admin list', async () => {
      const hashedPassword = await bcrypt.hash('E2eTest@123', 10);
      const testAdmin = await prisma.admin.create({
        data: {
          email: `e2e-no-role-testimonials-${Date.now()}@ksrm.edu`,
          password: hashedPassword,
          name: 'E2E No Role',
          isSuperAdmin: false,
          permissions: [],
          isActive: true,
        },
      });
      try {
        const loginRes = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: testAdmin.email, password: 'E2eTest@123' })
          .expect(201);
        await request(app.getHttpServer())
          .get('/homepage/admin/testimonials')
          .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
          .expect(403);
      } finally {
        await prisma.admin.delete({ where: { id: testAdmin.id } });
      }
    });
  });

  describe('Campus Videos, Accreditation Badges, Recruiters: CRUD + soft delete regression (Sprint 1C)', () => {
    it('Campus Video: create, appears publicly wrapped, soft-delete excludes it', async () => {
      const res = await request(app.getHttpServer())
        .post('/homepage/admin/campus-videos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'e2e Video',
          youtubeUrl: 'https://www.youtube.com/embed/e2etest',
          badgeLabel: 'Test',
        })
        .expect(201);
      const id = res.body.id;
      createdCampusVideoIds.push(id);

      const publicRes = await request(app.getHttpServer())
        .get('/homepage/campus-videos')
        .expect(200);
      expect(
        publicRes.body.items.some((v: { id: number }) => v.id === id),
      ).toBe(true);

      await request(app.getHttpServer())
        .delete(`/homepage/admin/campus-videos/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      const afterDelete = await request(app.getHttpServer())
        .get('/homepage/campus-videos')
        .expect(200);
      expect(
        afterDelete.body.items.some((v: { id: number }) => v.id === id),
      ).toBe(false);
    });

    it('Accreditation Badge: create, appears publicly wrapped, soft-delete excludes it', async () => {
      const res = await request(app.getHttpServer())
        .post('/homepage/admin/accreditation-badges')
        .set('Authorization', `Bearer ${token}`)
        .send({
          shortName: 'E2E',
          name: 'e2e Badge',
          imageUrl: '/e2e-badge.png',
        })
        .expect(201);
      const id = res.body.id;
      createdAccreditationBadgeIds.push(id);

      const publicRes = await request(app.getHttpServer())
        .get('/homepage/accreditation-badges')
        .expect(200);
      expect(
        publicRes.body.items.some((b: { id: number }) => b.id === id),
      ).toBe(true);

      await request(app.getHttpServer())
        .delete(`/homepage/admin/accreditation-badges/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      const afterDelete = await request(app.getHttpServer())
        .get('/homepage/accreditation-badges')
        .expect(200);
      expect(
        afterDelete.body.items.some((b: { id: number }) => b.id === id),
      ).toBe(false);
    });

    it('Recruiter: create, appears publicly wrapped, soft-delete excludes it', async () => {
      const res = await request(app.getHttpServer())
        .post('/homepage/admin/recruiters')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'e2e Recruiter Co', logoUrl: '/recruiters/e2e.jpg' })
        .expect(201);
      const id = res.body.id;
      createdRecruiterIds.push(id);

      const publicRes = await request(app.getHttpServer())
        .get('/homepage/recruiters')
        .expect(200);
      expect(
        publicRes.body.items.some((r: { id: number }) => r.id === id),
      ).toBe(true);

      await request(app.getHttpServer())
        .delete(`/homepage/admin/recruiters/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      const afterDelete = await request(app.getHttpServer())
        .get('/homepage/recruiters')
        .expect(200);
      expect(
        afterDelete.body.items.some((r: { id: number }) => r.id === id),
      ).toBe(false);
    });
  });

  describe('Departments teaser cards: ContentCard wrapper regression (Sprint 1C)', () => {
    let cardId: number;

    it('creates a department teaser card, decoupled from the real Department table', async () => {
      const res = await request(app.getHttpServer())
        .post('/homepage/admin/departments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          section: 'homepage_departments',
          imageUrl: '/e2e-dept.svg',
          title: 'e2e Test Department',
          linkUrl: '/departments/e2e',
        })
        .expect(201);
      cardId = res.body.id;
      createdDepartmentCardIds.push(cardId);
      expect(res.body.tags).toEqual([]);
    });

    it('appears in the public list wrapped as { visible, items }', async () => {
      const res = await request(app.getHttpServer())
        .get('/homepage/departments')
        .query({ section: 'homepage_departments' })
        .expect(200);
      expect(res.body).toHaveProperty('visible', true);
      expect(res.body.items.some((c: { id: number }) => c.id === cardId)).toBe(
        true,
      );
    });

    it('soft-deletes and restores correctly', async () => {
      await request(app.getHttpServer())
        .delete(`/homepage/admin/departments/${cardId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const afterDelete = await request(app.getHttpServer())
        .get('/homepage/departments')
        .query({ section: 'homepage_departments' })
        .expect(200);
      expect(
        afterDelete.body.items.some((c: { id: number }) => c.id === cardId),
      ).toBe(false);

      await request(app.getHttpServer())
        .post(`/homepage/admin/departments/${cardId}/restore`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      const afterRestore = await request(app.getHttpServer())
        .get('/homepage/departments')
        .query({ section: 'homepage_departments' })
        .expect(200);
      expect(
        afterRestore.body.items.some((c: { id: number }) => c.id === cardId),
      ).toBe(true);
    });
  });

  describe('Section Visibility toggle (Sprint 1C)', () => {
    afterEach(async () => {
      // Always leave every section visible so this suite never regresses
      // the live site's state for a subsequent run.
      await request(app.getHttpServer())
        .patch('/homepage/admin/section-visibility/recruiters')
        .set('Authorization', `Bearer ${token}`)
        .send({ visible: true });
    });

    it('lists all 6 Sprint 1C section keys, defaulting to visible', async () => {
      const res = await request(app.getHttpServer())
        .get('/homepage/admin/section-visibility')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      const keys = res.body.map((s: { key: string }) => s.key).sort();
      expect(keys).toEqual(
        [
          'accreditation',
          'campusVideos',
          'departments',
          'latestNews',
          'recruiters',
          'testimonials',
        ].sort(),
      );
      expect(
        res.body.every((s: { visible: boolean }) => s.visible === true),
      ).toBe(true);
    });

    it('hiding a section makes its public endpoint return { visible: false, items: [] } instead of falling back', async () => {
      await request(app.getHttpServer())
        .patch('/homepage/admin/section-visibility/recruiters')
        .set('Authorization', `Bearer ${token}`)
        .send({ visible: false })
        .expect(200);

      const publicRes = await request(app.getHttpServer())
        .get('/homepage/recruiters')
        .expect(200);
      expect(publicRes.body).toEqual({ visible: false, items: [] });

      // Toggling back on immediately restores the live section.
      await request(app.getHttpServer())
        .patch('/homepage/admin/section-visibility/recruiters')
        .set('Authorization', `Bearer ${token}`)
        .send({ visible: true })
        .expect(200);

      const publicResAfter = await request(app.getHttpServer())
        .get('/homepage/recruiters')
        .expect(200);
      expect(publicResAfter.body.visible).toBe(true);
    });

    it('audit-logs the toggle change', async () => {
      await request(app.getHttpServer())
        .patch('/homepage/admin/section-visibility/recruiters')
        .set('Authorization', `Bearer ${token}`)
        .send({ visible: false })
        .expect(200);

      const history = await request(app.getHttpServer())
        .get('/audit-logs')
        .query({ module: 'homepage_section_visibility', pageSize: 5 })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      // /audit-logs returns a paginated envelope { items, total, page, pageSize }.
      expect(history.body.items.length).toBeGreaterThan(0);
      expect(history.body.items[0].action).toBe('UPDATE');
    });
  });
});
