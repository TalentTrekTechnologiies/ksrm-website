import { ConflictException } from '@nestjs/common';

/**
 * Every homepage entity carries a `version` column (bumped on every update)
 * so concurrent edits are caught instead of silently overwriting each
 * other - the first real use of the `version` columns Phase 1 added
 * schema-wide but no existing module actually checks yet.
 *
 * Callers pass the version the client last saw (from the record they
 * loaded/rendered) alongside their update payload; this throws before any
 * write happens if the record has moved on since then.
 */
export function assertVersionMatch(
  record: { version: number },
  expectedVersion: number,
  entityLabel: string,
): void {
  if (record.version !== expectedVersion) {
    throw new ConflictException(
      `${entityLabel} was changed by someone else since you loaded it ` +
        `(you have version ${expectedVersion}, current is ${record.version}). ` +
        `Reload the latest version and try again.`,
    );
  }
}
