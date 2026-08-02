/**
 * How long an admin's access token stays valid.
 *
 * This was 7 days. Nothing refreshes or revokes a token once issued, so that
 * was also how long a leaked one kept working - on a shared office machine, a
 * week. A working day is the useful span: long enough that nobody is retyping
 * a password between sessions, short enough that a stray token dies quickly.
 *
 * The admin panel signs an idle session out after ten minutes on top of this
 * (see use-idle-logout.ts). That handles the unattended screen; this handles
 * the token itself, and unlike the browser-side timeout it cannot be bypassed.
 *
 * Override with JWT_EXPIRES_IN for a deployment with different needs.
 */
import type { SignOptions } from 'jsonwebtoken';

// Cast because jsonwebtoken types expiresIn as a template-literal union
// ("12h", "7d", ...), which an env-var string cannot satisfy statically.
export const TOKEN_LIFETIME = (process.env.JWT_EXPIRES_IN ??
  '12h') as SignOptions['expiresIn'];
