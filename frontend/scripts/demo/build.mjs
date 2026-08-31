/**
 * Builds the specimen end to end: demo build, rebrand, then verify.
 *
 * One command on purpose. The specimen and the college's live site are built
 * from the same repository and differ by one environment variable, so the
 * dangerous failure is a half-done demo - a build with the flag set but the
 * rebrand skipped is the real site with the real logo swapped out, and it
 * looks fine until someone reads the page title. Chaining the three steps
 * means the check cannot be forgotten, and it exits non-zero if anything of
 * the college survives, so a hosting provider fails the deploy instead of
 * publishing it.
 *
 *   npm run demo
 *
 * The env vars are set here rather than in the npm script because
 * "FOO=1 next build" is shell syntax that does not work on Windows, and this
 * has to run both on a developer's laptop and on a Linux build machine.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const env = {
  ...process.env,
  NEXT_PUBLIC_DEMO: "1",
  // Relative, like production - the specimen serves its recorded snapshot from
  // its own origin and never reaches a backend.
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "/api",
};

function run(label, command, args) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(command, args, { stdio: "inherit", env, shell: true });
  if (result.status !== 0) {
    console.error(`\n${label} failed - specimen not built.`);
    process.exit(result.status ?? 1);
  }
}

run("1/3  build (demo mode)", "npx", ["next", "build"]);
run("2/3  rebrand", "node", ["scripts/demo/rebrand.mjs"]);
run("3/3  verify", "node", ["scripts/demo/verify-demo.mjs"]);

console.log("\nSpecimen built and verified. Publish the out/ folder.\n");
