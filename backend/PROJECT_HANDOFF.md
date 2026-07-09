# KSRM College CMS Backend — Technical Handoff

**Prepared for:** continuation by another AI/engineer (GPT-5.5 or human) with no prior exposure to this codebase
**Prepared by:** Claude Code, read-only repository analysis
**Date of analysis:** 2026-07-04
**Repository:** `D:\ksrm-website` (monorepo) — this document covers `backend/` (NestJS/Prisma/PostgreSQL CMS). A sibling `frontend/` (Next.js) consumes/hosts the admin UI; it is referenced only where relevant to the backend's actual usage.

This document is a **verified inspection**, not a description of intent. Every claim below was confirmed by reading source files directly or by actually running `tsc`, `nest build`, and the compiled server. Where the code contradicts prior assumptions or documentation, this doc states the code's actual behavior.

---

## 0. Executive Summary

The backend is a small NestJS 11 + Prisma 5 + PostgreSQL REST API for a college CMS. It has 9 feature modules (`auth`, `faculty`, `news`, `gallery`, `placements`, `degree-verification`, `exam-notifications`, `notifications`, `audit-log`) plus a global `PrismaModule`. TypeScript compiles cleanly and `nest build` succeeds, but **the application cannot start** in its current committed state — it throws a fatal `UnknownDependenciesException` during Nest's dependency-injection bootstrap (Section 15). It has never been run successfully in this configuration as far as static evidence shows (no `.env`, no seed data beyond one admin user).

**The single most important fact for whoever picks this up:** the API is currently non-functional end-to-end, for two independent, stacked reasons:

1. **Fatal boot bug:** `FacultyModule`, `GalleryModule`, and `NewsModule` inject `AuditLogService` but never import `AuditLogModule`. Nest cannot resolve this at startup and the process crashes immediately (confirmed by actually running the built server — see Section 15).
2. **Even if #1 is fixed, nearly every permission-gated endpoint will still fail.** `JwtStrategy.validate()` only returns `{ id, email }` from the JWT payload, discarding `isSuperAdmin` and `permissions` that were signed into the token. Every route guarded by `PermissionsGuard` reads `user.permissions.includes(...)`, which throws a `TypeError` on `undefined` for every authenticated request except when the guarded permission string is falsy. Routes that manually check `req.user.isSuperAdmin` (admin registration, all audit-log reads) are always denied because that field is always `undefined`. See Section 3 and Section 8 for full detail.

Beyond these two defects, the **admin panel frontend is not implemented** — all 11 pages under `frontend/app/admin/**` are identical scaffold stubs (`<h1>Title</h1><p>Content</p>`) with no data fetching, no forms, and no calls to the backend at all (verified: zero references to the backend port, to `fetch`, or to `axios` anywhere under `frontend/app/admin`). The backend API and the admin UI have never been wired together.

The Prisma schema also does **not** contain the relational `Department`/`Lab` model structure that earlier project notes describe — it never has, across both migrations in git history. `department` is a free-text string column on each content table with no foreign key, and no `Lab` model exists at all.

---

## 1. Overall Architecture

### 1.1 Design pattern

Standard **NestJS layered/modular monolith**: one `@Module` per feature, each with `Controller → Service → PrismaService` (no repository interfaces, no CQRS, no event bus). Nest's own DI container is the only "framework" pattern in use. There is no domain layer, no use-case/interactor layer — services call Prisma directly and return Prisma's raw row shape to controllers, which return it directly to Nest (Nest JSON-serializes the return value; there are no response DTOs/serializers anywhere).

### 1.2 Folder structure (backend/)

```
backend/
├── data/
│   └── notifications.json          # DEAD FILE — not read by any code (see §12)
├── prisma/
│   ├── schema.prisma                # single schema file, 9 models, no relations
│   ├── seed.ts                      # seeds ONE super-admin user only
│   └── migrations/
│       ├── init/                        # initial schema (all 9 tables)
│       └── 20260608065410_permission_based_admin/   # Admin.role -> isSuperAdmin/permissions[]/department/isActive
├── src/
│   ├── main.ts                      # bootstrap: ValidationPipe, hardcoded CORS, port 4000
│   ├── app.module.ts                # root module, registers ConfigModule + 8 feature modules
│   ├── app.controller.ts / app.service.ts / app.controller.spec.ts   # untouched Nest boilerplate ("Hello World!")
│   ├── prisma/
│   │   ├── prisma.module.ts         # @Global() — exports PrismaService everywhere
│   │   └── prisma.service.ts        # extends PrismaClient, connects in onModuleInit
│   ├── auth/                        # login, JWT issuance, admin CRUD, permission guard/decorator
│   ├── faculty/                     # faculty directory + HOD lookup (imports AuditLogService — BROKEN)
│   ├── news/                        # news posts (imports AuditLogService — BROKEN)
│   ├── gallery/                     # gallery images (imports AuditLogService — BROKEN)
│   ├── placements/                  # placement records + stats (no audit logging)
│   ├── degree-verification/         # public verify endpoint + admin CRUD (no audit logging)
│   ├── exam-notifications/          # exam notices (no audit logging)
│   ├── notifications/               # scrolling-ticker notifications (no audit logging)
│   └── audit-log/                   # write-side used by faculty/news/gallery; read-side is its own controller (module never imported into AppModule's own import graph for cross-module use — see §12)
├── test/
│   ├── app.e2e-spec.ts              # only tests GET / ("Hello World!"); imports full AppModule so it will also crash on the DI bug
│   └── jest-e2e.json
├── nest-cli.json
├── tsconfig.json / tsconfig.build.json
├── package.json
└── README.md                        # unedited default Nest starter README
```

No `libs/`, no `apps/` (not a Nest monorepo), no `common/` or `shared/` folder, no interceptors, no filters, no middleware, no pipes beyond the single global `ValidationPipe`, no guards beyond `JwtAuthGuard`/`PermissionsGuard`.

### 1.3 Module organization

`AppModule` imports (in order): `ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' })`, `PrismaModule`, `AuthModule`, `FacultyModule`, `NewsModule`, `GalleryModule`, `PlacementsModule`, `DegreeVerificationModule`, `ExamNotificationsModule`, `NotificationsModule`.

**`AuditLogModule` is never imported into `AppModule`.** Its controller (`/audit-logs`) is therefore never registered and its routes do not exist on the running server, regardless of the DI crash — this is a second, independent reason the audit-log HTTP endpoints are unreachable (Section 6, Section 12).

### 1.4 Dependency flow

```
main.ts
  └─ AppModule
      ├─ ConfigModule (global, reads .env — file does not exist in repo)
      ├─ PrismaModule (@Global — PrismaService injectable anywhere without explicit import)
      ├─ AuthModule (PassportModule, JwtModule.registerAsync ← ConfigService)
      ├─ FacultyModule    → FacultyService(PrismaService, AuditLogService)  ⚠ AuditLogService NOT provided in this module's scope
      ├─ NewsModule       → NewsService(PrismaService, AuditLogService)     ⚠ same issue
      ├─ GalleryModule    → GalleryService(PrismaService, AuditLogService)  ⚠ same issue
      ├─ PlacementsModule → PlacementsService(PrismaService)                (no audit logging — inconsistent with faculty/news/gallery)
      ├─ DegreeVerificationModule → DegreeVerificationService(PrismaService)
      ├─ ExamNotificationsModule  → ExamNotificationsService(PrismaService)
      └─ NotificationsModule      → NotificationsService(PrismaService)

AuditLogModule (exists in src/, exports AuditLogService) — orphaned: not imported by AppModule or by any of the three modules that need it.
```

### 1.5 Global configuration (`main.ts`)

```ts
app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
app.enableCors({ origin: 'http://localhost:3000', credentials: true });
await app.listen(4000);
```

- Validation is global and reasonably strict (`whitelist` + `forbidNonWhitelisted` strips/rejects unknown body fields; `transform` auto-casts payloads to DTO classes so `class-validator` decorators actually run against typed values).
- CORS origin is a **hardcoded string**, not read from `ConfigService`/env — will silently break in any deployment where the frontend isn't `http://localhost:3000`.
- No Helmet, no global `ThrottlerModule`/rate limiting, no global exception filter, no request logging middleware, no `ServeStaticModule` for file uploads.
- Port `4000` is hardcoded (not from env either).

---

## 2. Backend Features — Module by Module

For each module: purpose, routes, guards, validation, and error handling as actually implemented.

### 2.1 `auth/`
**Purpose:** admin login, JWT issuance, and admin-account management (create/list/update permissions/deactivate).
**Files:** `auth.module.ts`, `auth.controller.ts`, `auth.service.ts`, `jwt-auth.guard.ts`, `permissions.guard.ts`, `permission.decorator.ts`, `strategies/jwt.strategy.ts`, `dto/login.dto.ts`, `dto/register.dto.ts`.

- `POST /auth/login` — public. Looks up `Admin` by email, rejects if missing/`isActive=false`, `bcrypt.compare`s the password, signs a JWT with `{ sub, email, name, isSuperAdmin, permissions, department }` (7-day expiry), returns `{ accessToken, admin }`.
- `GET /auth/profile` — `JwtAuthGuard` only. Returns the admin row by `req.user.id`. **Works correctly** (doesn't depend on the missing JWT fields).
- `POST /auth/register` — `JwtAuthGuard + PermissionsGuard` + `@RequirePermission('admins')`. Manually re-checks `req.user.isSuperAdmin` and throws a plain `Error` (not an `HttpException`) if falsy. **Always denies**, see Section 3.
- `GET /auth/admins`, `PATCH /auth/admins/:id/permissions`, `DELETE /auth/admins/:id` — same guard stack, same `RequirePermission('admins')`. All broken for the same reason (Section 3), independent of the `isSuperAdmin` re-check.
- Error handling: `UnauthorizedException` for bad credentials, `BadRequestException` for duplicate email on register. The manual `isSuperAdmin` checks throw bare `Error`, which Nest's default filter turns into a generic `500` with no meaningful body — not a `403 Forbidden` as intended.
- DTOs use `class-validator` (`IsEmail`, `IsString`, `MinLength(6)` login / `MinLength(8)` register, `IsArray` permissions, optional `department`).

### 2.2 `faculty/`
**Purpose:** public faculty directory + HOD lookup; admin CRUD.
- `GET /faculty?department=` — public, `orderBy: name asc`.
- `GET /faculty/hod/:department` — public, `findFirst({ department, isHod: true, isActive: true })`, 404 if none. **No DB constraint prevents more than one `isHod: true` row per department** — if that ever happens, an arbitrary one is returned.
- `GET /faculty/:id` — public, 404 via `NotFoundException` if missing.
- `POST /faculty`, `PATCH /faculty/:id`, `DELETE /faculty/:id` — `JwtAuthGuard + PermissionsGuard`, `@RequirePermission('faculty')`. Each writes an `AuditLogService.log()` entry with `before/after` diffs (update) or `deletedRecord` snapshot (delete). **Non-functional**: `FacultyService` constructor requires `AuditLogService`, which is not provided in `FacultyModule`'s scope — this specific module is the one whose crash was empirically reproduced in Section 15.

### 2.3 `news/`
Same shape as faculty: public `GET /news`, `GET /news/:id`; guarded `POST/PATCH/DELETE` under permission `news`, each audit-logged. Same `AuditLogService` DI defect (this module is imported *after* `FacultyModule` in `AppModule`, so in practice the app crashes on `FacultyModule` first and this module's identical defect never even gets a chance to run — but it has the exact same bug if `FacultyModule` were fixed in isolation).

### 2.4 `gallery/`
Public `GET /gallery?category=` (filters `isActive: true`, `orderBy: date desc`). Guarded `POST /gallery`, `DELETE /gallery/:id` under permission `gallery`, audit-logged. Same `AuditLogService` DI defect.

### 2.5 `placements/`
Public `GET /placements?year=`, `GET /placements/stats` (computes `totalPlacements`, `uniqueCompanies` via `Set`, `byDepartment`/`byYear` via manual `reduce` — all computed in Node from a full `findMany()`, no SQL aggregation/`groupBy`). Guarded `POST /placements`, `DELETE /placements/:id` under permission `placements`. **This module does not call `AuditLogService` at all** — inconsistent with faculty/news/gallery, and notably it's the only one of the four CRUD modules without the DI bug (because it simply doesn't do audit logging).

### 2.6 `degree-verification/`
- `POST /degree-verification/verify` — **public**, intended for external/student use. Takes `{ hallTicketNo, studentName }`, does a `findFirst` match on both fields, 404 if no match. This is the "vendor replacement" verification endpoint referenced in prior project notes; it exists and is simple, but has no rate limiting (susceptible to enumeration/brute-forcing hall ticket numbers) and no CAPTCHA.
- `GET /degree-verification`, `POST /degree-verification` — guarded, permission `degree_verification`. `create()` checks `hallTicketNo` uniqueness first and throws `BadRequestException` if it already exists (redundant with the DB `@unique` constraint, but provides a nicer error than a raw Prisma `P2002` violation would).
- No audit logging on this module either.

### 2.7 `exam-notifications/`
Public `GET /exam-notifications?category=`. Guarded `POST/PATCH/DELETE` under permission `exam`. No audit logging.

### 2.8 `notifications/`
Public `GET /notifications` (the scrolling ticker/banner notices — distinct from `ExamNotification`). Guarded `POST/PATCH/DELETE` under permission `notifications`. No audit logging. Note: `data/notifications.json` at the repo root looks like it was meant to seed/back this model but is **never read by any code** (Section 12) — the actual data source is exclusively the `Notification` Postgres table via Prisma.

### 2.9 `audit-log/`
**Purpose:** write path (`AuditLogService.log()`) used by faculty/news/gallery; read path (`AuditLogController`, routes under `/audit-logs`) for viewing the trail.
- `AuditLogModule` is **not imported anywhere** (not in `AppModule`, not in the three consumer modules — see Section 1.4/1.3). Consequence: its own `/audit-logs` HTTP routes never get registered on the live server (they don't exist at runtime even ignoring the crash), and its `AuditLogService` export is unreachable to the modules that `import`-statement it at the TypeScript level but never wire at the Nest-module level.
- All three of its controller methods (`getAll`, `getByAdminId`, `getByModule`) manually check `if (!req.user.isSuperAdmin) throw new Error(...)`. Since `JwtStrategy` never populates `isSuperAdmin` onto `req.user` (Section 3), **these checks always fail** — even for a genuine super admin — and always throw a bare `Error` (again, a `500`, not `403`).
- `getByAdminId(@Query('limit') limit, @Request() req)` has **no `:adminId` route-param binding** in its signature despite the route being `@Get('admin/:adminId')` — it silently ignores the URL's `:adminId` and always queries `req.user.id` instead. Even after fixing the auth bugs, calling `/audit-logs/admin/42` would return the logs of the *currently authenticated* admin, not admin `42`.
- `getByModule` similarly has no `@Param('module')` in its signature; it reads `req.params.module` directly off the raw Express request object, which happens to work because Express always populates `req.params` regardless of Nest decorators — functional, but not idiomatic and easy to break if the method signature is refactored.

### 2.10 `prisma/`
`PrismaModule` is `@Global()`, so `PrismaService` needs no explicit import elsewhere. `PrismaService extends PrismaClient`, connects in `onModuleInit`, disconnects in `onModuleDestroy`. No custom middleware/`$use`, no soft-delete hooks, no query logging config.

### 2.11 `app.controller.ts` / `app.service.ts`
Untouched Nest starter boilerplate: `GET /` returns `"Hello World!"`. Never replaced with a health-check or API-info endpoint.

### Cross-cutting: Guards, Interceptors, Middleware, Pipes
- **Guards:** `JwtAuthGuard` (thin wrapper over Passport's `AuthGuard('jwt')`), `PermissionsGuard` (reads `@RequirePermission` metadata via `Reflector`, checks `user.isSuperAdmin` then `user.permissions.includes(...)`).
- **Interceptors:** none.
- **Middleware:** none (no `configure(consumer: MiddlewareConsumer)` anywhere).
- **Pipes:** the one global `ValidationPipe`, plus per-route `ParseIntPipe` on numeric `:id` params.
- **Exception filters:** none custom — Nest's built-in default filter handles everything, which is why the several `throw new Error(...)` call sites surface as opaque `500`s instead of proper `403`s.

---

## 3. Authentication — Detailed Flow

### 3.1 Login flow
1. Client `POST /auth/login` with `{ email, password }` (validated by `LoginDto`).
2. `AuthService.login`: fetch `Admin` by unique email → 401 if missing or `isActive=false` → `bcrypt.compare(password, admin.password)` → 401 if mismatch.
3. On success, sign a JWT via `@nestjs/jwt`'s `JwtService.sign(payload, { expiresIn: '7d' })` with payload `{ sub: id, email, name, isSuperAdmin, permissions, department }`.
4. Response: `{ accessToken, admin: { id, name, email, isSuperAdmin, permissions } }`. Password hash is never returned (selective `select` used throughout).

### 3.2 JWT implementation
- `AuthModule` registers `JwtModule.registerAsync({ secret: configService.get('JWT_SECRET'), signOptions: { expiresIn: '7d' } })`. **No fallback** if `JWT_SECRET` is unset — `secret` would be `undefined`.
- `JwtStrategy` (Passport) is configured with `secretOrKey: configService.get('JWT_SECRET') || 'default-secret'` — **it has a fallback, the signer does not.**
- **Critical mismatch:** if `JWT_SECRET` is not set in the environment (which is the current repo state — no `.env` file exists at all), tokens are *signed* with `secret: undefined` but *verified* against the literal string `'default-secret'`. Depending on how the underlying `jsonwebtoken` library treats an `undefined` secret, this either throws at sign-time or produces tokens that can never successfully verify. Either way, **login is broken whenever `JWT_SECRET` is absent**, which today it always is.
- `JwtStrategy.validate(payload)` — **only returns `{ id: payload.sub, email: payload.email }`.** This is the root cause of the RBAC failure described below: everything else that was signed into the token (`isSuperAdmin`, `permissions`, `department`, `name`) is discarded and never reaches `req.user`.

### 3.3 Refresh token strategy
**None exists.** There is no refresh-token model, endpoint, or rotation logic anywhere in the codebase. Sessions are a single 7-day access token with no revocation mechanism (deactivating an admin via `isActive: false` does not invalidate already-issued tokens, since `JwtStrategy.validate` never re-checks the DB — it trusts the JWT payload alone, and a deactivated admin's still-valid 7-day token would continue to authenticate against `JwtAuthGuard`, though `getProfile` would still return their now-inactive record since it does not itself check `isActive`).

### 3.4 Password hashing
`bcrypt` (the compiled/native package, not `bcryptjs`) with a cost factor of `10`, used consistently in `AuthService.login` (compare) and `AuthService.registerAdmin`/`seed.ts` (hash). No dedicated password-reset or change-password endpoint exists.

### 3.5 Roles / Permissions / RBAC implementation
- No formal "roles" table/enum. Two-tier model on `Admin`:
  - `isSuperAdmin: Boolean` — bypasses all permission checks in `PermissionsGuard` (`if (user.isSuperAdmin) return true;`).
  - `permissions: String[]` — free-text permission keys (`"faculty" | "news" | "gallery" | "placements" | "exam" | "notifications" | "research" | "degree_verification" | "admins"` per the schema comment — **note `"research"` is listed as a valid permission string even though no `research` module/controller exists to gate**, and the real modules use the key `"degree_verification"` and `"exam"`, not `"exam_notifications"`).
  - `@RequirePermission(key)` decorator (`SetMetadata`) + `PermissionsGuard` (`Reflector.get`) implement the check.
- **This entire RBAC layer is non-functional as shipped**, because `PermissionsGuard` reads `user.permissions` and `user.isSuperAdmin` off `req.user`, and `JwtStrategy.validate` never puts those fields there (Section 3.2). In practice: `user.isSuperAdmin` is `undefined` (falsy, so the bypass never triggers) and `user.permissions` is `undefined`, so `user.permissions.includes(requiredPermission)` throws `TypeError: Cannot read properties of undefined (reading 'includes')` for **every** request to a `@RequirePermission`-guarded route. This is not a logic edge case — it fires on every single call, for every admin, super or not.
- **Fix sketch (documentation only, not applied):** `JwtStrategy.validate` must return the full set of fields the guards and controllers rely on, e.g. `return { id: payload.sub, email: payload.email, name: payload.name, isSuperAdmin: payload.isSuperAdmin, permissions: payload.permissions, department: payload.department };`. Whoever picks this up should also decide whether to re-fetch the admin from the DB inside `validate()` (safer — reflects live `isActive`/permission changes and revocation) versus trusting the JWT payload (current apparent intent, faster, but stale until token expiry).

---

## 4. Prisma

### 4.1 Full schema (verbatim, `prisma/schema.prisma`)

9 models, no enums, **zero `@relation` declarations anywhere in the schema** — every cross-entity reference (`department` strings, `adminId` on `AuditLog`) is a plain scalar column with no foreign key.

| Model | Fields | Constraints/Indexes |
|---|---|---|
| `Notification` | id, text, isActive (default true), createdAt, updatedAt | none beyond PK |
| `News` | id, title, content, category, imageUrl?, date, isPublished (default true), createdAt, updatedAt | none beyond PK |
| `Faculty` | id, name, designation, qualification, department, specialization?, experience?, email?, photoUrl?, isHod (default false), isActive (default true), createdAt, updatedAt | none beyond PK; **no index on `department` despite being the primary filter column** |
| `Placement` | id, studentName, company, package, department, year, imageUrl?, createdAt | none beyond PK |
| `GalleryImage` | id, title, imageUrl, category, date?, isActive (default true), createdAt | none beyond PK |
| `DegreeVerification` | id, studentName, hallTicketNo (**@unique**), department, yearOfPassing, degree, isVerified (default true), createdAt | unique index on `hallTicketNo` |
| `Admin` | id, email (**@unique**), password, name, isSuperAdmin (default false), permissions `String[]`, department?, isActive (default true), createdAt, updatedAt | unique index on `email` |
| `Research` | id, title, authors, journal?, year, department, type, isActive (default true), createdAt | none — **and no NestJS module consumes this model at all (see §12)** |
| `ExamNotification` | id, title, fileUrl?, category, date, isActive (default true), createdAt | none beyond PK |
| `AuditLog` | id, adminId (Int, **not a relation**), adminName, adminEmail, action, module, targetId?, details? (String, JSON-stringified by the service), ipAddress?, createdAt | `@@index([adminId])`, `@@index([module])`, `@@index([createdAt])` |

`AuditLog.ipAddress` is a schema column, but **no controller ever populates it** — every `AuditLogService.log()` call site omits `ipAddress`, so it's always `null` in practice. Capturing the real client IP would need `@Ip()` (or `req.ip`) threaded through each controller into the service call.

### 4.2 Relationships
None. This is a flat, denormalized schema by construction — there is no `Department` table, so `department` is just a repeated free-text string on `Faculty`, `News` (indirectly via category, not department), `Placement`, `DegreeVerification`, `Research`, and `Admin.department`. Nothing prevents typos/inconsistent casing across tables (e.g., `"CSE"` vs `"cse"` vs `"Computer Science"` would all be treated as different departments by any exact-match `WHERE` filter).

### 4.3 Missing models (relative to the flat structure that does exist, and relative to what the CMS's stated feature set implies)
- **`Department`** — no relational entity; confirmed absent from both migrations in git history. Every "department" is a bare string.
- **`Lab`** — does not exist. No table, no module, no seed data. (Department pages presumably render lab info from hardcoded frontend content, not this backend.)
- **`Downloads`** — no model/module for department "downloads" (question papers, syllabi, brochures) despite this being a typical department-page feature.
- **HOD as an entity** — not modeled; it's `Faculty.isHod: Boolean` with no DB-level uniqueness constraint per department.
- **Refresh tokens / sessions** — no model (see §3.3).
- **Committee/anti-ragging data** — no backend model at all; that content (flagged elsewhere as having placeholder names) is presumably frontend-only static content, entirely outside this backend's scope.

### 4.4 Seed script (`prisma/seed.ts`)
Seeds **exactly one row**: a super-admin (`superadmin@ksrm.edu` / `SuperAdmin@123`, bcrypt-hashed, `isSuperAdmin: true`, `permissions: []`, `isActive: true`), using `upsert` so it's idempotent. **No faculty, gallery, news, placement, or any other content is seeded.** `npm run seed` runs it via `ts-node prisma/seed.ts`.

### 4.5 Migrations
Two migrations exist, in order:
1. `init/` — creates all 9 current tables as they exist today (this already includes `DegreeVerification`, `Research`, `Admin`, etc. — i.e., the "broad but flat" shape is the *original* shape, not something added later).
2. `20260608065410_permission_based_admin/` — `ALTER TABLE "Admin" DROP COLUMN "role", ADD COLUMN "department" TEXT, ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true, ADD COLUMN "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false, ADD COLUMN "permissions" TEXT[]`. This confirms the admin model used to be a simple `role` string/enum and was deliberately migrated to the current super-admin + permissions-array design — i.e., the RBAC redesign was intentional and recent, which likely explains why `JwtStrategy` (Section 3) was never updated to match the new payload shape.

There is no `DATABASE_URL` configured anywhere in the repo (no `.env`, no `.env.example`); `npx prisma validate` fails with `P1012: Environment variable not found: DATABASE_URL` (empirically confirmed, Section 15). Migrations cannot be applied nor can the app connect to a database without an operator supplying this externally.

---

## 5. Database

### 5.1 Table relationships
None enforced at the DB level (Section 4.2). Logical relationships (e.g., "this `Faculty.department` should correspond to some canonical department") exist only in the minds of whoever enters the data.

### 5.2 Cascade rules
Not applicable — no foreign keys means no `ON DELETE`/`ON UPDATE` cascade behavior exists anywhere.

### 5.3 Normalization
The schema is **deliberately denormalized / flat** — every table repeats department as a string rather than referencing a shared table. This is simple to seed and query per-table but:
- allows silent data-quality drift (typos, casing) across "the same" department referenced from six different tables (`Faculty`, `Placement`, `DegreeVerification`, `Research`, `Admin`, and implicitly the frontend's own department list),
- makes it impossible to enforce "department X exists" at the DB layer,
- makes renaming a department a manual multi-table string-replace instead of a single-row update.

### 5.4 Potential improvements
- Introduce a real `Department` table (id, code, name) and FK it from `Faculty`, `Placement`, `DegreeVerification`, `Research`, `Admin`. This also directly resolves the "missing Department model" gap noted in prior project docs.
- Add an explicit `Lab` table (department FK, name, description, images) if labs are meant to be backend-managed rather than static frontend content.
- Index the columns every list endpoint filters on: `Faculty.department`, `News.category`, `GalleryImage.category`, `Placement.department`/`year`, `ExamNotification.category`.
- Give `AuditLog.adminId` a real FK to `Admin.id` (with `onDelete: SetNull` or similar) so the trail survives/behaves predictably if an admin row is ever deleted rather than deactivated.
- Consider a proper `enum` for `AuditLog.action` (`CREATE|UPDATE|DELETE`) at the Prisma/Postgres level instead of a free `String` (the TypeScript union in `AuditLogData` is not enforced by the database).

---

## 6. Admin Panel APIs — Full Endpoint List

"Admin panel APIs" here means every endpoint intended for authenticated admin use (as opposed to the small set of genuinely public endpoints). Full method/route/auth/authz table is consolidated in Section 16; this section calls out request/response shape and auth specifics per group.

- **Auth group** (`/auth/register`, `/auth/admins`, `/auth/admins/:id/permissions`, `/auth/admins/:id`): all require `JwtAuthGuard + PermissionsGuard('admins')`, all currently unreachable in practice (Section 3.5). Request/response bodies are plain JSON matching the DTOs/`select` projections shown in Section 2.1.
- **Content CRUD groups** (`faculty`, `news`, `gallery`, `placements`, `exam-notifications`, `notifications`, `degree-verification`): writes require `JwtAuthGuard + PermissionsGuard('<module-key>')`; reads are public with the sole exception of `GET /degree-verification` and `GET /faculty` (public) vs. mutation routes (guarded). Response bodies are raw Prisma rows (no DTO/serializer shaping, so internal fields like `password` would leak if ever added to a `select`-less query — currently avoided by explicit `select` only in `auth.service.ts`; other services return full rows, which is fine today since none of those models carry secrets).
- **Audit-log group** (`/audit-logs*`): guarded by `JwtAuthGuard` only (no `PermissionsGuard`/`@RequirePermission`), with a hand-rolled `isSuperAdmin` check inside each handler instead. Never reachable at all because `AuditLogModule` isn't registered in `AppModule` (Section 2.9) — independent of the auth bugs, the routes don't exist on the running server.

---

## 7. Department Module (as a concept spanning multiple real modules)

There is no single `department` module — department-scoped features are spread across the flat tables described in Section 4:

- **Faculty:** `GET /faculty?department=X` and `GET /faculty/hod/:department` (Section 2.2). This is the only genuinely "department-aware" read API with dedicated support (HOD lookup).
- **Labs:** **not implemented** — no model, no module, no endpoint.
- **Gallery:** filterable by `category`, not by department — there is no `department` field on `GalleryImage` at all, so gallery images cannot currently be scoped to a department through this API.
- **Research:** the `Research` Prisma model has a `department` column, but **there is no controller/service/module for it** — it is entirely dead schema with no code path that ever reads or writes it (Section 12).
- **Downloads:** not implemented — no model, no module.
- **HOD:** `Faculty.isHod` boolean flag, looked up via `findHodByDepartment` (Section 2.2); not a distinct entity.
- **Department information (name, description, established year, vision/mission, etc.):** **entirely absent from the backend.** This content, per prior project notes, currently lives hardcoded in the frontend's self-contained `page.tsx` files rather than being backend-driven at all — consistent with what this repository actually contains.

---

## 8. Security Review

| Area | Status | Detail |
|---|---|---|
| JWT secret handling | **Broken** | Sign path has no fallback secret; verify path falls back to `'default-secret'`. Mismatched when `JWT_SECRET` env var is unset (currently always, since no `.env` exists). See §3.2. |
| JWT payload → `req.user` | **Broken** | `JwtStrategy.validate` drops `isSuperAdmin`/`permissions`/`department`/`name`, breaking every permission check downstream. See §3.2/§3.5. |
| Input validation | Solid | Global `ValidationPipe({ whitelist, forbidNonWhitelisted, transform })`, per-field `class-validator` decorators on every DTO. |
| SQL injection | Not a concern | 100% Prisma Client query-builder usage; grepped the entire `src/` tree for `$queryRaw`/`$executeRaw` — zero occurrences. No raw SQL anywhere. |
| XSS | Not directly applicable | Pure JSON REST API, no server-rendered HTML from this backend. Stored free-text fields (`News.content`, etc.) are not sanitized before storage, so responsibility for escaping on render falls entirely to whatever frontend consumes this API — worth flagging to whoever builds that integration. |
| CORS | Weak/hardcoded | `origin: 'http://localhost:3000'` is a literal string in `main.ts`, not env-driven. Will need a code change (not just an env var) to support any other frontend origin/environment. |
| Helmet | **Absent** | Not in `package.json` dependencies, not used in `main.ts`. No security headers (`X-Content-Type-Options`, `X-Frame-Options`, CSP, etc.) are set. |
| Rate limiting | **Absent** | No `@nestjs/throttler` (or any equivalent) in dependencies. `POST /auth/login` and `POST /degree-verification/verify` (a hall-ticket/name lookup — an enumeration vector) are both unprotected against brute force. |
| File upload security | **N/A — no upload exists** | See §9. |
| CSRF | Not applicable | Stateless bearer-token API, no cookie-based session, so CSRF is not a relevant threat model here — acceptable as-is. |
| Password storage | Solid | `bcrypt` cost factor 10, never returned in any API response (explicit `select` in `auth.service.ts`). |
| Error handling / info leakage | Weak | Several handlers `throw new Error(...)` directly instead of an `HttpException` subtype, which surfaces as a generic Nest `500` — not a security leak per se, but poor API ergonomics and it masks what should be `403 Forbidden` responses as opaque server errors. |
| Secrets in repo | Clean | No `.env` committed (correctly gitignored via `.env*` in `backend/.gitignore`), no hardcoded secrets found in source beyond the `'default-secret'` JWT fallback string, which is a code smell but not a "checked in prod secret" since it's a fallback rather than the working key. |

---

## 9. File Upload

**There is no file upload functionality in this backend at all.** Confirmed:
- `multer` is not a direct dependency in `package.json` (only transitively available via `@nestjs/platform-express`, but never invoked).
- No `FileInterceptor`/`FilesInterceptor`/`@UseInterceptors` referencing file handling anywhere in `src/`.
- No `ServeStaticModule` or static-file-serving middleware.
- Every "image" field (`Faculty.photoUrl`, `GalleryImage.imageUrl`, `News.imageUrl`, `Placement.imageUrl`, `ExamNotification.fileUrl`) is a plain `string` column populated by whatever URL/path string the client sends in the DTO (validated only as `IsString`/`IsOptional`). There is no server-side mechanism to actually upload a binary file, store it, validate its type/size, or serve it back.

**Consequence:** the admin panel (if it existed functionally — see §6) would have no way to let a user pick a photo from disk; it would have to already know a hosted URL to type in. Adding real upload support is a from-scratch feature (Multer disk/S3 storage config, MIME/size validation, a static-serving route or CDN, and DTO/service changes to accept `multipart/form-data`), not a bug fix.

---

## 10. Logging

- **Audit logs:** `AuditLogService.log()` writes to the `AuditLog` table for `faculty`, `news`, and `gallery` mutations only (not `placements`, `degree-verification`, `exam-notifications`, or `notifications` — inconsistent coverage). The read API for these logs is unreachable (Section 2.9/6). `ipAddress` is a schema column but is never populated by any call site.
- **Request logging:** none. No `morgan`, no custom `LoggerMiddleware`, no interceptor logging method/path/duration. Nest's built-in `Logger` is only used implicitly for its own framework startup messages (`[Nest] ... LOG [InstanceLoader] ...`), not for application requests.
- **Error logging:** none beyond Nest's default `ExceptionHandler` console output (visible in the crash trace captured in Section 15) and two bare `console.log` statements (`main.ts` startup banner, `prisma.service.ts` `"Prisma connected"`). No structured logger (Pino/Winston), no log levels, no external log shipping.

---

## 11. Configuration

### 11.1 Environment variables the code reads
| Variable | Read where | Required? | Currently set? |
|---|---|---|---|
| `DATABASE_URL` | `prisma/schema.prisma` datasource block | Yes — Prisma refuses to validate/generate/migrate without it | **No** — no `.env` file exists in the repo at all |
| `JWT_SECRET` | `AuthModule` (`JwtModule.registerAsync`), `JwtStrategy` | Yes, functionally (no safe default — see §3.2/§8) | **No** |

No other `process.env`/`ConfigService.get` calls exist anywhere in `src/`. No `PORT` env var is read (port `4000` is hardcoded in `main.ts`), no `CORS_ORIGIN` env var (hardcoded), no `NODE_ENV` branching anywhere.

### 11.2 Config files
- `nest-cli.json` — default Nest CLI config, `deleteOutDir: true`, no custom asset copying.
- `tsconfig.json` — `target: ES2023`, `module`/`moduleResolution: nodenext`, `strictNullChecks: true` but `noImplicitAny: false` (partial strict mode), `emitDecoratorMetadata`/`experimentalDecorators` on (required for Nest DI).
- `tsconfig.build.json` — extends the above, excludes `test/**` and `**/*spec.ts`. **Note:** `nest build`'s output preserves the `src/` folder inside `dist/` (i.e., the entry point is `dist/src/main.js`, not `dist/main.js`) — see Section 15 for why this matters.
- `.prettierrc` — `singleQuote: true`, `trailingComma: 'all'`.
- `eslint.config.mjs` — not read in detail for this pass beyond confirming it exists; standard `@eslint/js` + `typescript-eslint` + `eslint-config-prettier` flat config.
- `.gitignore` — ignores `/dist`, `/node_modules`, `.env*`, `/coverage`, `/generated/prisma`. That last entry (`/generated/prisma`) doesn't correspond to anything in the current schema (the schema uses Prisma Client's default output location, not a custom `generated/prisma` output path) — likely a leftover from an earlier Prisma config or a copy-pasted `.gitignore` template; harmless but worth pruning.

### 11.3 Secrets required to run this project
At minimum, an operator needs to supply (via a real `.env`, which does not exist and is not tracked):
```
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<db>?schema=public"
JWT_SECRET="<any-sufficiently-random-string>"
```
No `.env.example` exists in the repo to document this for future contributors — worth adding.

---

## 12. Missing Features / Dead Code / Incomplete Modules

- **Fatal:** `FacultyModule`/`GalleryModule`/`NewsModule` don't import `AuditLogModule` → app cannot boot (Sections 1.3, 15). This is the top-priority fix.
- **Fatal (functional, not boot-level):** `JwtStrategy.validate` drops JWT claims → all RBAC-gated routes 500 (Section 3.5).
- **Dead file:** `data/notifications.json` at the repo root — not imported, required, or read by any TypeScript file. The live `Notification` Prisma table is the actual data source for `GET /notifications`. This JSON file appears to be leftover seed/mock data that was superseded by the DB-backed implementation and never deleted.
- **Dead schema/model:** `Research` — exists in `schema.prisma` (with `department`, `type`, `year`, `journal?`, `isActive`) but has **no NestJS module, controller, service, or DTO at all**. It is schema-only; nothing in the application ever creates, reads, updates, or deletes a `Research` row. If department "research" content is meant to be backend-driven, this module needs to be built from scratch (it isn't a bug fix — no partial implementation exists to repair).
- **Orphaned module:** `AuditLogModule`/`AuditLogController` — written, but never registered in `AppModule`, so its own `/audit-logs*` HTTP surface never exists on the running server, independent of every other bug (Section 2.9).
- **Unimplemented admin UI:** all 11 pages under `frontend/app/admin/**` (`login`, `dashboard`, `admins`, `audit-logs`, `faculty`, `gallery`, `news`, `notifications`, `placements`, `exam-notifications`, `degree-verification`) are identical scaffold stubs:
  ```tsx
  export default function SubPage() {
    return <main><h1>{Title}</h1><p>Content</p></main>
  }
  ```
  No forms, no tables, no `fetch`/`axios` calls, no auth/session handling on the frontend side at all. Grepped the entire `frontend/app/admin` tree for `4000`, `fetch(`, and `axios` — zero matches. **The backend and the admin frontend have never been connected.**
- **No pagination anywhere.** Every list endpoint (`faculty`, `news`, `gallery`, `placements`, `exam-notifications`, `notifications`) does an unbounded `findMany()` (only `AuditLogService` uses `take`). Fine at current data volumes, will not scale.
- **No `PlacementsService`/others audit logging** — inconsistent with faculty/news/gallery, which do log. Either those three are over-scoped or the other four are under-scoped, depending on intent.
- **No health-check endpoint** (`GET /` still returns the default Nest "Hello World!" string — never customized into a real root/health route).
- **Only default Nest boilerplate tests exist** — `app.controller.spec.ts` and `test/app.e2e-spec.ts` both just assert `GET /` returns `"Hello World!"`. **Zero test coverage for any actual feature module** (auth, faculty, news, gallery, placements, degree-verification, exam-notifications, notifications, audit-log). Additionally, `test/app.e2e-spec.ts` imports the *entire* `AppModule`, so `npm run test:e2e` will also currently fail with the same `UnknownDependenciesException` as the real server (Section 15) — the one e2e test that exists cannot currently pass.
- **`README.md` is the unedited default `nest new` starter README** — no project-specific setup instructions, no mention of Prisma, seeding, or required env vars.
- **No `.env.example`** committed, despite two required env vars (Section 11.3).
- **Stray `.gitignore` entry** for `/generated/prisma`, which doesn't correspond to any current Prisma output config (Section 11.2) — minor, but signals possible drift from an earlier/different Prisma setup.

---

## 13. Code Quality

- **Architecture:** consistent, if minimal — every feature module follows the same `Module → Controller → Service → Prisma` shape. Easy to read, easy to onboard onto, but currently missing a shared layer for things every module reinvents individually (see Reusability, below).
- **Naming:** clear and conventional throughout (`FacultyService.findHodByDepartment`, `CreateFacultyDto`, etc.) — no naming complaints.
- **Reusability:** Weak in one specific way — the "look up existing row or throw `NotFoundException`" pattern (`findOne` in faculty/news/gallery/placements/exam-notifications/notifications, `findUnique` + manual null-check inline in several others) is duplicated near-verbatim seven-plus times instead of factored into a shared base service/helper. Similarly, the `JwtAuthGuard + PermissionsGuard + @RequirePermission(...)` triple is repeated on every single mutating route — a custom composed decorator (e.g., `@AdminOnly('faculty')`) would remove a lot of repetition, though this is a stylistic improvement, not a defect.
- **SOLID:** Single Responsibility is respected at the module level. Open/Closed and Dependency Inversion are weak by construction — services depend directly on the concrete `PrismaService`/`PrismaClient` rather than a repository abstraction, which is a defensible choice for a project this size but does mean swapping ORMs or unit-testing services without a real/mocked Prisma client would require touching every service.
- **Performance:** `PlacementsService.getStats()` pulls every `Placement` row into Node memory and aggregates with `.reduce()`/`Set` instead of using `groupBy`/`count` at the database level (Section 2.5) — fine at small scale, won't scale linearly with placement history growth.
- **Security:** covered exhaustively in Section 8 — the two fatal auth defects are the standout quality issue in the entire codebase.
- **Maintainability:** the codebase is small and uniform enough to be easy to maintain *once the two fatal bugs are fixed* — the bigger maintainability risk is that **the app has apparently never been successfully booted with real data** (no `.env`, seed only creates one admin, and the DI crash would have surfaced the moment anyone tried), meaning none of this has been exercised end-to-end even by its own author since the RBAC redesign migration landed.

---

## 14. Git

- **Current branch:** `main`.
- **Repo-wide `git status`:** ahead of `origin/main` by 61 commits; two unstaged modifications, both under `frontend/` and unrelated to the backend (`frontend/next-env.d.ts`, `frontend/public/ksrm-logo.mp4`). **Nothing uncommitted under `backend/`** — the entire backend tree is clean and fully committed.
- **`backend/` git history (all commits ever touching the directory, oldest first):**
  1. `cfd3e662` — Task 1: Complete project setup - frontend and backend
  2. `9519ef59` — Add all 7 navbar pages for KSRM College website (unrelated frontend commit, backend untouched)
  3. `d055d106` — **feat: backend modules - auth, faculty, news, gallery, placements, audit logs, permission-based access** (the commit that actually built out everything described in this document)
  4. `04a8c518` / `6192b28e` — init: scaffold clean Next.js project (frontend-only, unrelated)
  5. `023de8b4` — Fix backend TypeScript errors: import Request decorator from @nestjs/common
  6. `df51b407` — untracked files on main: (merge/tracking commit around the earlier drive-migration recovery)
  7. `14d2fbc7` — On main: migration:main-agents/backend-cms-status-handoff-verification
  8. `a27b9fe0` — Session checkpoint commit (this analysis session's own environment bookkeeping commit, not a feature change)
- **Other local branches present:** `agents/backend-cms-status-handoff-verification` (current worktree's own branch), `before-netlify-demo`, `demo-ready`, `june-28-working`, `recovered-2030-2100`, `recovered-original-source`, `recovery-from-out`, `recovery-rebuild` — names strongly suggest this repo has been through at least one prior data-loss/recovery incident, consistent with prior project notes about a drive-migration crisis. **Not investigated further in this pass** — out of scope for a backend-only technical audit, but worth knowing these branches exist if backend history ever looks inconsistent (there may be an alternate/older version of the backend on one of the `recovered-*`/`recovery-*` branches worth diffing against, if this version turns out to be missing something a recovery branch has).
- **Remote:** `origin` → `https://github.com/TalentTrekTechnologiies/ksrm-website.git`.

---

## 15. Build Status (empirically verified, not assumed)

All commands below were actually executed against the repository as it exists on disk. No source files were modified to make any of this pass.

| Step | Command | Result |
|---|---|---|
| Dependencies | (pre-existing `node_modules`, 474 packages, not reinstalled to avoid lockfile churn) | Present and appears intact; Prisma Client already generated under `node_modules/.prisma/client`. |
| Prisma schema validation | `npx prisma validate` | **FAILED** — `P1012: Environment variable not found: DATABASE_URL.` No `.env` exists. |
| Prisma generate | (not run standalone — client already present from a prior generate; blocked the same way `validate` is if attempted fresh without `DATABASE_URL`) | N/A |
| Prisma migrate | Not attempted — would fail immediately without `DATABASE_URL` and a reachable Postgres instance. | N/A |
| TypeScript type-check | `npx tsc -p tsconfig.build.json --noEmit` | **PASSED** — zero output, zero errors. |
| Build | `npx nest build` | **PASSED** — zero output, zero errors. Produced `dist/src/**` (see note below). |
| Start (built server) | `node dist/src/main.js` (see note) | **CRASHED at boot.** Full captured output: |

```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] AppModule dependencies initialized
[Nest] LOG [InstanceLoader] PrismaModule dependencies initialized
[Nest] LOG [InstanceLoader] PassportModule dependencies initialized
[Nest] ERROR [ExceptionHandler] UnknownDependenciesException [Error]:
Nest can't resolve dependencies of the FacultyService (PrismaService, ?).
Please make sure that the argument AuditLogService at index [1] is available
in the FacultyModule module.

Potential solutions:
- Is FacultyModule a valid NestJS module?
- If AuditLogService is a provider, is it part of the current FacultyModule?
- If AuditLogService is exported from a separate @Module, is that module
  imported within FacultyModule?
```

This is the empirical proof behind Section 1.3/2.2's claim: **the compiled server cannot start**, full stop, regardless of database availability — the crash happens during Nest's DI graph resolution, before the app ever attempts `PrismaService.onModuleInit()`'s `$connect()`.

**Packaging bug found along the way:** `package.json`'s `start:prod` script is `node dist/main`, but `nest build`'s actual output entry point is `dist/src/main.js` (the compiler preserves the `src/` folder under `dist/`, it does not flatten it). So `npm run start:prod` would additionally fail with `MODULE_NOT_FOUND: Cannot find module 'dist/main'` even if the DI bug above were fixed — confirmed by literally trying `node dist/main.js` first and getting exactly that error before finding the real path. Either add a `"rootDir": "src"` (or use `tsconfig-paths`/adjust `outDir` handling) so `dist/main.js` is the real path, or fix the npm script to point at `dist/src/main.js`.

**Summary:** `npm install` → assumed fine (pre-existing, intact `node_modules`). `prisma generate`/`migrate` → blocked on missing `DATABASE_URL`. `npm run build` → passes cleanly. `npm run start`/`start:dev`/`start:prod` → **all would crash identically** on the `AuditLogService` DI error the moment Nest tries to instantiate `FacultyModule`, and `start:prod` specifically would additionally hit the wrong-entry-path bug even after that.

---

## 16. API Inventory (complete)

"Auth required" = needs a valid Bearer JWT (`JwtAuthGuard`). "Authz" = additionally needs `PermissionsGuard` + the named permission key, or a manual check as noted. "Works today" reflects the bugs documented above, assuming the DI crash (Section 15) were fixed first so the process could even run — i.e., this column answers "if the app could boot, would this specific route work?"

| Method | Route | Module | Auth Required | Authz | Description | Works today? |
|---|---|---|---|---|---|---|
| GET | `/` | App (root) | No | — | Default Nest boilerplate, returns `"Hello World!"` | Yes (trivial) |
| POST | `/auth/login` | Auth | No | — | Verify credentials, issue 7-day JWT | **No** — JWT secret sign/verify mismatch when `JWT_SECRET` unset (always, today) |
| GET | `/auth/profile` | Auth | Yes | — | Return authenticated admin's profile by `id` | Yes (doesn't need the missing JWT fields) |
| POST | `/auth/register` | Auth | Yes | `admins` + manual `isSuperAdmin` check | Create a new admin account | **No** — `isSuperAdmin` always undefined, always denied; also `PermissionsGuard` would throw first |
| GET | `/auth/admins` | Auth | Yes | `admins` | List all admins | **No** — same `PermissionsGuard` crash |
| PATCH | `/auth/admins/:id/permissions` | Auth | Yes | `admins` | Update an admin's permission array | **No** |
| DELETE | `/auth/admins/:id` | Auth | Yes | `admins` | Deactivate (`isActive: false`) an admin | **No** |
| GET | `/faculty` | Faculty | No | — | List faculty, optional `?department=` | Yes |
| GET | `/faculty/hod/:department` | Faculty | No | — | Find the HOD for a department | Yes (returns arbitrary match if data has >1 `isHod`) |
| GET | `/faculty/:id` | Faculty | No | — | Get one faculty record | Yes |
| POST | `/faculty` | Faculty | Yes | `faculty` | Create faculty record + audit log | **No** — DI crash + permission crash |
| PATCH | `/faculty/:id` | Faculty | Yes | `faculty` | Update faculty record + audit log | **No** |
| DELETE | `/faculty/:id` | Faculty | Yes | `faculty` | Delete faculty record + audit log | **No** |
| GET | `/news` | News | No | — | List news, optional `?category=` | Yes |
| GET | `/news/:id` | News | No | — | Get one news item | Yes |
| POST | `/news` | News | Yes | `news` | Create news + audit log | **No** |
| PATCH | `/news/:id` | News | Yes | `news` | Update news + audit log | **No** |
| DELETE | `/news/:id` | News | Yes | `news` | Delete news + audit log | **No** |
| GET | `/gallery` | Gallery | No | — | List gallery images, optional `?category=` | Yes |
| POST | `/gallery` | Gallery | Yes | `gallery` | Create gallery image + audit log | **No** |
| DELETE | `/gallery/:id` | Gallery | Yes | `gallery` | Delete gallery image + audit log | **No** |
| GET | `/placements` | Placements | No | — | List placements, optional `?year=` | Yes |
| GET | `/placements/stats` | Placements | No | — | Aggregate placement stats (computed in Node) | Yes |
| POST | `/placements` | Placements | Yes | `placements` | Create placement record | **No** — permission crash (no DI issue here, but app never gets this far anyway) |
| DELETE | `/placements/:id` | Placements | Yes | `placements` | Delete placement record | **No** |
| POST | `/degree-verification/verify` | Degree Verification | No | — | Public verify by hall-ticket + name | Yes (no rate limiting though — see §8) |
| GET | `/degree-verification` | Degree Verification | Yes | `degree_verification` | List all degree records | **No** |
| POST | `/degree-verification` | Degree Verification | Yes | `degree_verification` | Create a degree record | **No** |
| GET | `/exam-notifications` | Exam Notifications | No | — | List, optional `?category=` | Yes |
| POST | `/exam-notifications` | Exam Notifications | Yes | `exam` | Create | **No** |
| PATCH | `/exam-notifications/:id` | Exam Notifications | Yes | `exam` | Update | **No** |
| DELETE | `/exam-notifications/:id` | Exam Notifications | Yes | `exam` | Delete | **No** |
| GET | `/notifications` | Notifications | No | — | List active scrolling notifications | Yes |
| POST | `/notifications` | Notifications | Yes | `notifications` | Create | **No** |
| PATCH | `/notifications/:id` | Notifications | Yes | `notifications` | Update | **No** |
| DELETE | `/notifications/:id` | Notifications | Yes | `notifications` | Delete | **No** |
| GET | `/audit-logs` | Audit Log | Yes | manual `isSuperAdmin` check only | List all audit logs, filterable | **No** — route doesn't even exist (module unregistered) *and* the manual check always denies |
| GET | `/audit-logs/admin/:adminId` | Audit Log | Yes | manual `isSuperAdmin` check only | Logs for one admin (bug: ignores `:adminId`, always uses caller's own id) | **No** |
| GET | `/audit-logs/module/:module` | Audit Log | Yes | manual `isSuperAdmin` check only | Logs for one module | **No** |

**Total: 34 routes across 10 controllers** (including the untouched root `AppController`). 15 are public/unauthenticated, 19 require a JWT, of which 3 additionally use a hand-rolled `isSuperAdmin` check instead of the standard guard.

---

## 17. Future Work / Recommendations

### Immediate (must-fix before anything else is usable)
1. Import `AuditLogModule` into `FacultyModule`, `GalleryModule`, and `NewsModule` (or make `AuditLogModule` `@Global()` like `PrismaModule`, which would be simpler given it's used the same way). Without this the server cannot start.
2. Fix `JwtStrategy.validate` to return the full set of claims (`isSuperAdmin`, `permissions`, `department`, `name`) the rest of the codebase already assumes are on `req.user`. Decide deliberately whether to trust the JWT payload as-is or re-fetch the admin row from the DB on every request (the latter is slightly slower but makes deactivation/permission changes take effect immediately instead of waiting up to 7 days for token expiry).
3. Give `JwtModule.registerAsync`'s `secret` the same non-empty guarantee `JwtStrategy` has (or better: fail fast at boot if `JWT_SECRET` is missing, via `ConfigModule.forRoot({ validationSchema: ... })` or a manual check in `main.ts`, rather than silently signing with `undefined`).
4. Replace every bare `throw new Error(...)` (in `auth.controller.ts` and `audit-log.controller.ts`) with `throw new ForbiddenException(...)` so denials return `403` with a real error body instead of an opaque `500`.
5. Fix `package.json`'s `start:prod` script to point at `dist/src/main.js` (or adjust the build config so the compiled entry lands at `dist/main.js` as the script currently assumes).
6. Fix `getByAdminId` in `AuditLogController` to actually bind and use the `:adminId` route param instead of silently substituting the caller's own id.
7. Add a `.env.example` documenting `DATABASE_URL` and `JWT_SECRET` so the next person doesn't have to reverse-engineer this from `schema.prisma`/`auth.module.ts`.

### Architecture / folder structure
- Introduce a `Department` Prisma model and FK it from `Faculty`, `Placement`, `DegreeVerification`, `Research`, `Admin`. This is the biggest structural gap relative to what a "college CMS" implies and what prior project notes assumed already existed.
- Add the missing `Lab` and (if department-scoped downloads/research are actually wanted as backend features rather than static frontend content) build out real modules for them — `Research` currently has schema with no code at all, so this is a from-scratch build, not a fix.
- Extract the repeated "`findOneOrThrow`" pattern and the `JwtAuthGuard + PermissionsGuard + @RequirePermission` guard triple into shared helpers/decorators to cut duplication across the 7 CRUD modules.
- Consider a thin repository/service-base class if the number of near-identical CRUD modules keeps growing.

### Performance
- Move `PlacementsService.getStats()`'s aggregation into Prisma's `groupBy`/`count`/`aggregate` instead of pulling every row into Node and reducing in memory.
- Add pagination (`skip`/`take`, or cursor-based) to every unbounded `findMany()` list endpoint before real data volume arrives.
- Index `Faculty.department`, `News.category`, `GalleryImage.category`, `Placement.department`/`year`, `ExamNotification.category` at the Prisma/Postgres level.

### Security
- Add `helmet()` in `main.ts`.
- Add `@nestjs/throttler` (or equivalent) globally, and specifically rate-limit `POST /auth/login` and `POST /degree-verification/verify`.
- Make CORS origin env-driven (`ConfigService.get('CORS_ORIGIN')`) instead of a hardcoded string, so the same build can run in dev/staging/prod without a code change.
- Decide on and implement a real revocation story for JWTs (refresh tokens, a token-version/`tokenVersion` column bumped on deactivation and checked in `validate()`, or a denylist) — right now deactivating an admin does not invalidate their still-valid token.
- Populate `AuditLog.ipAddress` (thread `@Ip()`/`req.ip` from each controller through to the service call) since the column already exists and is currently always null.

### Production readiness
- Build actual file-upload support (Multer + disk/S3 storage + MIME/size validation) if the admin panel is meant to let users upload images directly rather than paste hosted URLs — currently there is no upload path at all (Section 9).
- Write real tests for every feature module — currently only the two default Nest-generated "Hello World" tests exist, and one of those (`test/app.e2e-spec.ts`) can't even pass today because it imports the full, currently-crashing `AppModule`.
- Replace `console.log` with a structured logger, and add basic request logging (method/path/status/duration) — there is currently no observability into what the API is doing.
- Decide the frontend↔backend integration strategy explicitly (per prior project notes' open question) — right now the admin frontend is pure unstyled scaffolding with zero backend calls, so this integration hasn't started in either direction yet, and the two sides of the stack have not been validated to actually work together even once.

---

## 18. Deployment Guide (as the code currently expects to be run — not yet verified to actually work end-to-end, given §15)

```bash
# 1. Install dependencies (already present in this checkout; only needed fresh)
cd backend
npm install

# 2. Create backend/.env with (values are examples — supply real ones):
DATABASE_URL="postgresql://user:password@host:5432/ksrm_cms?schema=public"
JWT_SECRET="replace-with-a-long-random-string"

# 3. Apply migrations to a real Postgres instance
npx prisma migrate deploy      # or `migrate dev` in local development

# 4. Generate Prisma Client (only needed if schema changes or node_modules is fresh)
npx prisma generate

# 5. Seed the super-admin account
npm run seed
# -> creates superadmin@ksrm.edu / SuperAdmin@123 (change this password after first login manually — there is no forced-change flow)

# 6. Fix the two fatal bugs in Section 15/17 before proceeding, or the next step will crash:
#    - import AuditLogModule into FacultyModule/GalleryModule/NewsModule
#    - fix JwtStrategy.validate to return the full JWT payload

# 7a. Development
npm run start:dev              # watches src/, serves on http://localhost:4000

# 7b. Production
npm run build                  # emits dist/src/main.js (NOT dist/main.js — see §15/§17 packaging bug)
node dist/src/main.js          # start:prod's own script currently points at the wrong path; run this directly, or fix package.json first
```

No Dockerfile, docker-compose, CI pipeline, or process manager (PM2, systemd unit) config exists anywhere in the repo for this backend — deployment tooling is entirely unbuilt.

### Environment variables (repeat, consolidated)
| Variable | Purpose | Required |
|---|---|---|
| `DATABASE_URL` | Postgres connection string, standard Prisma format | Yes |
| `JWT_SECRET` | HMAC secret for signing/verifying admin JWTs | Yes (no safe default exists today) |

### Commands (consolidated)
| Command | What it does |
|---|---|
| `npm install` | Install dependencies |
| `npm run seed` | Seed one super-admin account (`ts-node prisma/seed.ts`) |
| `npx prisma migrate dev` / `migrate deploy` | Apply schema migrations |
| `npx prisma generate` | Regenerate Prisma Client |
| `npx prisma validate` | Validate `schema.prisma` (requires `DATABASE_URL` to be set even just to validate syntax against the datasource block) |
| `npm run start` / `start:dev` / `start:debug` | Run the Nest app (plain / watch / watch+debugger) |
| `npm run build` | Compile TypeScript via `nest build` → `dist/src/**` |
| `npm run start:prod` | **Currently broken** — runs `node dist/main`, but the real compiled entry is `dist/src/main.js` |
| `npm run lint` | ESLint with `--fix` |
| `npm run test` / `test:watch` / `test:cov` | Jest unit tests (only default boilerplate tests exist today) |
| `npm run test:e2e` | Jest e2e tests (the one test that exists will currently fail — see §12/§15) |
