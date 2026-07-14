import { AsyncLocalStorage } from 'async_hooks';
import { NextFunction, Request, Response } from 'express';

interface RequestContext {
  ipAddress?: string;
}

// AsyncLocalStorage rather than threading `req.ip` through every service
// method's parameter list (the way `requestId` is threaded today) - that
// would mean touching 30+ existing controller/service call sites for one
// field. This gives AuditLogService.log() transparent access to the
// current request's IP from anywhere in the async call chain, with zero
// changes to any existing caller.
const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function requestContextMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  // X-Forwarded-For (first hop) wins when present - same "trust the proxy's
  // header if given" reasoning requestIdMiddleware already applies for
  // X-Request-Id; falls back to the raw socket address otherwise.
  const forwardedFor = req.headers['x-forwarded-for'];
  const forwardedIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(',')[0]?.trim();

  requestContextStorage.run({ ipAddress: forwardedIp || req.ip }, next);
}

export function getRequestIpAddress(): string | undefined {
  return requestContextStorage.getStore()?.ipAddress;
}
