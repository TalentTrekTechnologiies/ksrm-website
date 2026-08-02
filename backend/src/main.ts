import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from './prisma/prisma.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { APP_VERSION } from './version';
import { configureApp } from './configure-app';

function assertRequiredEnv() {
  const missing = ['DATABASE_URL', 'JWT_SECRET'].filter(
    (key) => !process.env[key],
  );
  if (missing.length > 0) {
    console.error(
      `FATAL: missing required environment variable(s): ${missing.join(', ')}. ` +
        'Copy backend/.env.example to backend/.env and fill them in before starting.',
    );
    process.exit(1);
  }
}

// Media.sizeBytes/MediaVariant.sizeBytes are BigInt (an Int32 tops out at
// ~2.1GB, right at this module's 2GB video ceiling) - Node's default JSON
// serializer throws on BigInt without this.
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  assertRequiredEnv();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // In production Nginx proxies to this process, so without this every request
  // arrives from 127.0.0.1 and the rate limiter sees the entire internet as a
  // single client - one busy visitor could exhaust the quota for everybody and
  // the site would start answering 429 to real users. Trusting one proxy hop
  // makes req.ip the visitor's real address, which is what the limiter (and
  // the IP recorded in the audit log) is meant to be counting.
  app.set('trust proxy', 1);

  // Serve the whole API under /api.
  //
  // In production one Nginx server block serves the static site at / and
  // proxies /api/ to this process. Without the prefix the API answers on
  // /departments, /gallery, /news ... which are exactly the public site's own
  // page paths, so the two collide and one of them has to lose.
  //
  // Set on the app rather than in configureApp() so the e2e suite, which
  // builds its own test app, keeps calling unprefixed routes.
  app.setGlobalPrefix(configService.get<string>('API_PREFIX') ?? 'api');

  configureApp(app, configService);

  // Swagger docs - not exposed in production
  if (configService.get<string>('NODE_ENV') !== 'production') {
    const swaggerDocument = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('KSRM College CMS API')
        .setDescription(
          'Admin-facing REST API for the KSRM College CMS backend',
        )
        .setVersion(APP_VERSION)
        .addBearerAuth()
        .build(),
    );
    SwaggerModule.setup('api/docs', app, swaggerDocument);
  }

  const port = configService.get<string>('PORT') ?? 4000;
  await app.listen(port);
  console.log(`🚀 Backend server running on http://localhost:${port}`);

  await warnIfDefaultSuperAdminPassword(app);
}

/**
 * Loud boot-time warning if any active super admin still uses the seeded
 * default password - the single most likely way this deployment gets owned.
 * Best-effort: never blocks startup (a fresh DB with no admins is fine).
 */
async function warnIfDefaultSuperAdminPassword(app: INestApplication) {
  try {
    const prisma = app.get(PrismaService, { strict: false });
    const supers = await prisma.admin.findMany({
      where: { isSuperAdmin: true, isActive: true, deletedAt: null },
      select: { email: true, password: true },
    });
    for (const admin of supers) {
      if (await bcrypt.compare('SuperAdmin@123', admin.password)) {
        console.warn(
          `\n⚠️  SECURITY WARNING: super admin "${admin.email}" still uses the ` +
            `seeded default password. Change it before exposing this server ` +
            `to the internet.\n`,
        );
      }
    }
  } catch {
    // Non-fatal by design - this is a warning, not a gate.
  }
}
void bootstrap();
