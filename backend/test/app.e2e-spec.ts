import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { HealthStatus } from './../src/app.service';
import { ErrorResponseBody } from './../src/common/filters/all-exceptions.filter';
import { configureApp } from './../src/configure-app';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Mirror main.ts's bootstrap wiring (correlation ID middleware, global
    // exception filter, logging interceptor, validation, CORS) so this
    // suite actually exercises the same behavior production runs with.
    configureApp(app, app.get(ConfigService));
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

  it('echoes a caller-supplied X-Request-Id back on the response', async () => {
    const res = await request(app.getHttpServer())
      .get('/health')
      .set('X-Request-Id', 'test-correlation-id-123')
      .expect(200);
    expect(res.headers['x-request-id']).toBe('test-correlation-id-123');
  });

  it('generates an X-Request-Id when the caller does not supply one', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(typeof res.headers['x-request-id']).toBe('string');
    expect(res.headers['x-request-id'].length).toBeGreaterThan(0);
  });

  it('returns a consistent JSON error shape for an unknown route', async () => {
    const res = await request(app.getHttpServer())
      .get('/this-route-does-not-exist')
      .expect(404);
    const body = res.body as ErrorResponseBody;
    expect(body.statusCode).toBe(404);
    expect(body.path).toBe('/this-route-does-not-exist');
    expect(body.method).toBe('GET');
    expect(typeof body.requestId).toBe('string');
    expect(typeof body.timestamp).toBe('string');
  });

  it('returns a consistent JSON error shape for a validation failure', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'not-an-email', password: '123' })
      .expect(400);
    const body = res.body as ErrorResponseBody;
    expect(body.statusCode).toBe(400);
    expect(body.error).toBe('Bad Request');
    expect(Array.isArray(body.message)).toBe(true);
    expect(typeof body.requestId).toBe('string');
  });

  afterEach(async () => {
    await app.close();
  });
});
