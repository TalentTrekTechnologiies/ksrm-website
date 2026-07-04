import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

/**
 * Applies every cross-cutting concern (correlation IDs, validation, the
 * global exception filter, request logging, CORS) to a Nest application
 * instance. Shared between the real bootstrap (main.ts) and the e2e test
 * setup so the test suite actually exercises the same wiring production
 * runs with, instead of silently drifting from it.
 */
export function configureApp(
  app: INestApplication,
  configService: ConfigService,
): void {
  app.use(requestIdMiddleware);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN') ?? 'http://localhost:3000',
    credentials: true,
  });
}
