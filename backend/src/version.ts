import { readFileSync } from 'fs';
import { join } from 'path';

// Read at runtime (not a compile-time `import`) so tsc's rootDir inference
// for `nest build` isn't dragged back up to the package root by a file
// outside src/.
export const APP_VERSION: string = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'),
).version;
