import { readFileSync } from 'fs';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

// Read at runtime (not a compile-time `import`) so tsc's rootDir inference
// for `nest build` isn't dragged back up to the package root by a file
// outside src/.
const { version } = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'),
);

function assertRequiredEnv() {
  const missing = ['DATABASE_URL', 'JWT_SECRET'].filter((key) => !process.env[key]);
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

  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Enable CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN') ?? 'http://localhost:3000',
    credentials: true,
  });

  // Swagger docs - not exposed in production
  if (configService.get<string>('NODE_ENV') !== 'production') {
    const swaggerDocument = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('KSRM College CMS API')
        .setDescription('Admin-facing REST API for the KSRM College CMS backend')
        .setVersion(version)
        .addBearerAuth()
        .build(),
    );
    SwaggerModule.setup('api/docs', app, swaggerDocument);
  }

  const port = configService.get<string>('PORT') ?? 4000;
  await app.listen(port);
  console.log(`🚀 Backend server running on http://localhost:${port}`);
}
bootstrap();
