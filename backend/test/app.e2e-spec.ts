import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { HealthStatus } from './../src/app.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET)', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    const body = res.body as HealthStatus;
    expect(body.status).toMatch(/^(ok|degraded)$/);
    expect(body.database).toMatch(/^(connected|disconnected)$/);
    expect(typeof body.uptime).toBe('number');
    expect(typeof body.version).toBe('string');
    expect(typeof body.timestamp).toBe('string');
  });

  afterEach(async () => {
    await app.close();
  });
});
