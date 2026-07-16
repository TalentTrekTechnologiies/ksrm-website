import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';
import { requestContextMiddleware } from './common/request-context';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

/**
 * Applies every cross-cutting concern (security headers, correlation IDs,
 * validation, the global exception filter, request logging, CORS) to a Nest
 * application instance. Shared between the real bootstrap (main.ts) and the
 * e2e test setup so the test suite actually exercises the same wiring
 * production runs with, instead of silently drifting from it.
 */
export function configureApp(
  app: INestApplication,
  configService: ConfigService,
): void {
  // Security headers. Two deliberate deviations from helmet's defaults:
  // - contentSecurityPolicy off: this is a JSON API (plus dev-only Swagger),
  //   not an HTML app - a CSP here only breaks Swagger while protecting
  //   nothing the API actually serves.
  // - crossOriginResourcePolicy cross-origin: the Media Library serves
  //   images/PDFs to the frontend's *different* origin; helmet's default
  //   `same-origin` would make every <img src=".../media/file/..."> fail.
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.use(requestIdMiddleware);
  app.use(requestContextMiddleware);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // An origin is scheme + host + port and never has a path, so a trailing slash
  // is always a typo - but CORS matching is byte-exact, so "https://site.app/"
  // silently rejects a browser sending "https://site.app" and every request from
  // the real site fails. That cost us a live demo once. Normalise it here rather
  // than depending on whoever fills in the dashboard field getting it right.
  // Comma-separated values are supported so a preview/staging origin can be added
  // without a code change.
  const corsOrigin = (
    configService.get<string>('CORS_ORIGIN') ?? 'http://localhost:3000'
  )
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigin.length === 1 ? corsOrigin[0] : corsOrigin,
    credentials: true,
  });
}
