import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Logs one line per completed request (method, path, status, duration,
 * requestId). Failed requests are logged by AllExceptionsFilter instead,
 * so this only hooks the success path to avoid double-logging the same
 * request from two places.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const { method, originalUrl, requestId } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = httpContext.getResponse<Response>();
        const duration = Date.now() - start;
        this.logger.log(
          `${method} ${originalUrl} ${response.statusCode} +${duration}ms [${requestId}]`,
        );
      }),
    );
  }
}
