import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Assigns a correlation ID to every request - reusing an inbound
 * X-Request-Id header when present (e.g. from a proxy/load balancer or a
 * calling service) so a single request can be traced across systems,
 * otherwise generating a new one. Attached to req.requestId for the
 * logging interceptor and exception filter to pick up, and echoed back as
 * a response header so the caller can correlate their own logs too.
 */
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const inboundHeader = req.headers[REQUEST_ID_HEADER];
  const inboundId = Array.isArray(inboundHeader)
    ? inboundHeader[0]
    : inboundHeader;

  req.requestId = inboundId && inboundId.length > 0 ? inboundId : randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
}
