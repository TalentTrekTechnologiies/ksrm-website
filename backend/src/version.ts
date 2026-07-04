import { readFileSync } from 'fs';
import { join } from 'path';

// Read at runtime (not a compile-time `import`) so tsc's rootDir inference
// for `nest build` isn't dragged back up to the package root by a file
// outside src/.
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'),
) as { version: string };

export const APP_VERSION: string = packageJson.version;
