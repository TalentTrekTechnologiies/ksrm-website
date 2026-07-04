// Ensures the e2e suite can boot the full AppModule (and its now fail-fast
// JWT_SECRET check) without requiring real secrets or a reachable database.
// PrismaService's onModuleInit no longer crashes the app on a failed
// connection, so a placeholder DATABASE_URL is enough for the module graph
// to initialize; only DB-touching assertions would need a real database.
process.env.JWT_SECRET ??= 'e2e-test-secret-not-for-production';
process.env.DATABASE_URL ??=
  'postgresql://test:test@localhost:5432/test?schema=public';
