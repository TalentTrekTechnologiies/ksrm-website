import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
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

async function bootstrap() {
  assertRequiredEnv();

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

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
}
void bootstrap();
