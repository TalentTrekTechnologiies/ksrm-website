import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The specimen build. Same generated output as out/, just under a name
    // that keeps it away from the folder the college's deploy publishes -
    // without this, linting the repo reports thousands of problems in built
    // bundles and buries the real ones.
    "demo-out/**",
  ]),
]);

export default eslintConfig;
