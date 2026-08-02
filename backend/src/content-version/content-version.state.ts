/**
 * A counter that changes whenever any content does.
 *
 * The public site used to discover edits by re-fetching every section on a
 * timer - thirteen requests per visitor per cycle on the homepage alone, which
 * forced the interval up to 30 seconds in production just to keep the load
 * sane. So an edit took up to half a minute to appear.
 *
 * Instead the browser polls this one number frequently and cheaply, and only
 * re-fetches real content when it moves. Changes surface in about two seconds
 * while making *fewer* requests than before.
 *
 * Deliberately plain module state rather than a Nest provider: PrismaService
 * bumps it and the controller reads it, and injecting a provider into
 * PrismaService would create a dependency cycle for no benefit.
 *
 * In memory, so it resets to 0 when the API restarts. That is harmless - a
 * client seeing an unfamiliar number simply refetches once. It does mean a
 * multi-instance deployment would need this moved to Redis, since each instance
 * would keep its own count.
 */
let version = 0;
let changedAt = Date.now();

/** Called on every database write. Cheap by design - two assignments. */
export function bumpContentVersion(): void {
  version += 1;
  changedAt = Date.now();
}

export function getContentVersion(): { version: number; changedAt: number } {
  return { version, changedAt };
}
