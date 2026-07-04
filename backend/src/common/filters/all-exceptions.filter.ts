import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponseBody {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  method: string;
  timestamp: string;
  requestId: string;
}

/**
 * Catches every exception thrown anywhere in the app - HttpExceptions
 * (NotFoundException, the ValidationPipe's BadRequestException, the
 * ForbiddenExceptions from the auth guards, etc.) as well as any
 * unexpected non-HTTP error - and turns it into one consistent JSON shape,
 * instead of each call site's ad-hoc `throw new Error(...)` producing a
 * bare, differently-shaped 500.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionsHandler');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const statusCode: number = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const { error, message } = this.resolveErrorAndMessage(
      exception,
      isHttpException,
    );

    const body: ErrorResponseBody = {
      statusCode,
      error,
      message,
      path: request.originalUrl,
      method: request.method,
      timestamp: new Date().toISOString(),
      requestId: request.requestId,
    };

    const logLine = `${request.method} ${request.originalUrl} ${statusCode} [${request.requestId}]`;
    const isServerError = statusCode >= 500;
    if (isServerError) {
      const stack =
        exception instanceof Error ? exception.stack : String(exception);
      this.logger.error(logLine, stack);
    } else {
      this.logger.warn(logLine);
    }

    response.status(statusCode).json(body);
  }

  private resolveErrorAndMessage(
    exception: unknown,
    isHttpException: boolean,
  ): { error: string; message: string | string[] } {
    if (isHttpException) {
      const httpException = exception as HttpException;
      const responseBody = httpException.getResponse();

      if (typeof responseBody === 'string') {
        return { error: httpException.name, message: responseBody };
      }

      const asRecord = responseBody as Record<string, unknown>;
      const message = asRecord.message;
      return {
        error:
          typeof asRecord.error === 'string'
            ? asRecord.error
            : httpException.name,
        message:
          typeof message === 'string' || Array.isArray(message)
            ? (message as string | string[])
            : httpException.message,
      };
    }

    // Never leak an unknown internal error's real message/stack to the
    // client - it's already logged in full server-side by the caller.
    return {
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    };
  }
}
