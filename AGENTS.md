# AGENTS.md

## Project Overview

Arbitask is a gamified project & idea management web app that converges Linear-style issue tracking, Clockify-style time tracking, and Lattice-style people ops into a single product. It currently has a working MVP with basic task/project management (Kanban, List, Timeline, Notes), collaboration (invites, RBAC), and gamification (XP, levels, achievements). The roadmap expands it into a full Work OS with sprints, time tracking, analytics, performance scoring, and compensation intelligence across two major phases. See `REQUIREMENTS.md` for the full feature list and `arbitask-feature-list.md` for the product vision document.

## Current State

The `main` branch contains a working MVP with:
- Auth (Google OAuth + demo credentials via Auth.js v5)
- Project CRUD with emoji icons, statuses, priorities
- Task CRUD with 6 status columns, 6 types, multi-assignee
- Kanban, List, Timeline, Notes, Shipped views (per-project + global)
- Collaboration: invite links, RBAC (Owner/Admin/Member/Viewer)
- Gamification: XP system, 8 levels, 15 achievement badges
- Three theme modes: Dark, Light, Eye Protection

**What does NOT exist yet:** Sentry, Vitest, Browserbase, R2 integration, ESLint/Prettier, CSS Modules, `development` branch. All of these must be set up before building new features.

**Infrastructure already set up:**
- `lib/base/` — BaseRepository + BaseService for generic CRUD
- `lib/factories/` — Handler + CRUD factories for standardized API route creation
- `lib/http/` — ApiResponse helpers, withMiddleware pipeline
- `lib/middlewares/` — Auth, rate limiting, logging, error handling, request ID
- `lib/swagger/` — OpenAPI/Swagger config + JSDoc-based spec generation
- `lib/utils/` — Logger, pagination, crypto, date, string, response-transformer, Cloudflare R2/Images/Stream
- `lib/validation/` — Zod validation utilities + common schemas
- `lib/cache/` — Cache service with memory + Redis strategies

## Stack

- Next.js 15, App Router, Server Actions, Server Components preferred, TypeScript strict mode
- PostgreSQL via Prisma ORM (all environments)
- Cloudflare R2 for file storage (attachments, documents, screen recordings)
- DigitalOcean App Platform for deployment
- Sentry for error tracking and performance monitoring
- Vitest for unit and integration tests
- Browserbase for browser-based E2E tests (cloud browsers, no local instance needed)
- OpenAPI 3.0 + Swagger UI for API documentation (served at `/api/docs/ui`)
- Zod for input validation on all API routes
- CSS Modules + CSS custom properties following DESIGN.md

## Repository Structure

> **IMPORTANT**: The actual codebase currently has TWO directory structures due to a legacy Vite SPA migration. The canonical structure is listed below. The legacy `/src/components/`, `/src/constants/`, `/src/utils/`, `/src/styles/` directories contain old JSX files and must NOT be used for new work. The new `src/modules/` directory IS the correct location for new backend modules.

### Current (canonical — use these paths)

```
/
├── app/                         # Next.js pages and API routes (App Router)
│   ├── (app)/                   # Auth-protected route group
│   ├── api/                     # REST API routes — thin controllers only
│   │   ├── auth/[...nextauth]/  # Auth.js handler
│   │   ├── docs/                # Swagger UI + OpenAPI JSON (to be created)
│   │   ├── projects/            # Project endpoints
│   │   ├── tasks/               # Task endpoints
│   │   ├── notes/               # Note endpoints
│   │   ├── members/             # Member endpoints
│   │   └── invites/             # Invite endpoints
│   ├── login/                   # Sign-in page
│   └── invite/[token]/          # Invite accept page
│
├── src/modules/                 # ⭐ Backend domain modules (NEW)
│   ├── projects/                # Project module
│   │   ├── project.repository.ts
│   │   ├── project.service.ts
│   │   ├── project.schema.ts   # Zod schemas + types
│   │   └── project.swagger.ts  # @openapi JSDoc blocks
│   ├── tasks/
│   ├── notes/
│   ├── members/
│   ├── invites/
│   ├── assignees/
│   └── gamification/
│
├── components/                  # React components
│   ├── AppShell.tsx
│   ├── Sidebar.tsx
│   ├── views/                   # View components (Kanban, List, Timeline, etc.)
│   ├── modals/                  # Modal components
│   ├── ui/                      # Reusable UI primitives
│   └── providers/               # Context providers
│
├── lib/                         # Shared infrastructure (NOT business logic)
│   ├── base/                    # BaseRepository + BaseService
│   ├── factories/               # Handler + CRUD factories
│   ├── http/                    # ApiResponse, withMiddleware
│   ├── middlewares/             # Auth, rate limiting, logging, error handling
│   ├── swagger/                 # OpenAPI/Swagger config
│   ├── utils/                   # Logger, pagination, crypto, etc.
│   ├── validation/              # Zod validation utilities + common schemas
│   ├── cache/                   # Cache service (memory + Redis)
│   ├── db.ts                    # Prisma singleton
│   ├── db.config.ts             # Database connection config
│   ├── auth.ts                  # Auth.js v5 config
│   ├── auth-helpers.ts          # requireProjectMember/Admin helpers
│   ├── constants.ts             # App constants (roles, statuses, types, levels, achievements)
│   ├── gamification.ts          # XP calculation (to be migrated to src/modules/gamification/)
│   ├── actions.ts               # Server actions
│   ├── helpers.ts               # Generic helpers
│   ├── markdown.ts              # Markdown utilities
│   ├── theme.ts                 # Theme configuration
│   └── fonts.ts                 # Font configuration
│
├── prisma/
│   └── schema.prisma            # Database schema
├── middleware.ts                 # Route protection
├── REQUIREMENTS.md
├── DESIGN.md
├── AGENTS.md                    # This file
└── arbitask-feature-list.md     # Full product vision
```

### To be created (by Builder/Planner)
- `tests/unit/` — Vitest test files (*.test.ts)
- `tests/e2e/` — Browserbase E2E specs (*.e2e.ts)
- `.agent-traces/` — Agent Trace records (JSON, one per commit)
- `docs/` — API changelog, exported Postman collections
- `.cursor/tasks.json` — Task list for agent orchestration

### Legacy (DO NOT USE for new code)
- `src/components/` — Old Vite SPA JSX components (to be removed)
- `src/constants/` — Old constants (migrated to `lib/constants.ts`)
- `src/utils/` — Old utilities (migrated to `lib/`)
- `src/styles/` — Old font config (migrated to `lib/fonts.ts`)

## Git Branching Rules

**All development MUST happen on the `development` branch or feature branches created from `development`.**

- `main` — Production-ready code only. Protected. Never push directly.
- `development` — Integration branch. All feature PRs target `development`.
- `feat/<feature-name>` — Feature branches from `development`.
- `fix/<bug-description>` — Bugfix branches from `development`.
- `hotfix/<description>` — Critical fixes from `main`, merged back to both `main` and `development`.

**Branch creation flow:**
1. Before any work, ensure the `development` branch exists: `git checkout -b development main` (one-time)
2. For each feature: `git checkout -b feat/<name> development`
3. All PRs target `development`, never `main`
4. `development` → `main` only on verified releases

## Backend Architecture Rules

> **CRITICAL**: All backend features MUST follow the modular architecture pattern. No business logic in route handlers.

### Module Pattern

Every backend domain lives in `src/modules/<domain>/` with these files:

| File | Purpose | Extends |
|---|---|---|
| `<domain>.repository.ts` | Database queries, Prisma operations | `BaseRepository` from `lib/base/` |
| `<domain>.service.ts` | Business logic, authorization, side effects | `BaseService` from `lib/base/` |
| `<domain>.schema.ts` | Zod validation schemas (create, update, query) | Uses schemas from `lib/validation/` |
| `<domain>.swagger.ts` | OpenAPI `@openapi` JSDoc blocks | — |

### Architecture Flow

```
Request → app/api/route.ts (thin controller)
           ↓ uses handler factory from lib/factories/
           ↓ withMiddleware applies: auth → rate limit → validation → logging
           ↓
         src/modules/<domain>/service.ts (business logic)
           ↓
         src/modules/<domain>/repository.ts (database queries)
           ↓
         lib/db.ts → Prisma → Database
```

### Rules

1. **Route handlers are thin controllers** — they ONLY wire up the factory, schema, and service. No business logic.
2. **Use handler factories** from `lib/factories/` — never write raw `NextRequest`/`NextResponse` handlers.
   - `createGetHandler()`, `createPostHandler()`, `createPutHandler()`, `createDeleteHandler()`
   - `createPaginatedHandler()`, `createGetOneHandler()`
   - `createCrudHandlers()` for full CRUD with one call
3. **Use `ApiResponse` helpers** from `lib/http/` — never use raw `NextResponse.json()`.
   - `successResponse()`, `createdResponse()`, `errorResponse()`, `notFoundResponse()`, `paginatedResponse()`
4. **Use `ApiError` / `ApiErrors`** from `lib/middlewares/` for error throwing.
   - `ApiErrors.NotFound()`, `ApiErrors.Unauthorized()`, `ApiErrors.BadRequest()`, etc.
5. **Use `withMiddleware`** from `lib/http/` for auth, validation, rate limiting, error handling.
6. **Business logic goes in the service layer** — authorization checks, side effects, gamification triggers.
7. **Database queries go in the repository layer** — extend `BaseRepository` for custom queries.
8. **Zod schemas go in `*.schema.ts`** — import common schemas from `lib/validation/schemas/`.
9. **All request/response types export from the schema file** — never define types inline in routes.

### Example Module: Projects

```typescript
// src/modules/projects/project.repository.ts
import { BaseRepository } from "@/lib/base";
import { db } from "@/lib/db";

export class ProjectRepository extends BaseRepository<Project> {
  constructor() {
    super(db.project);
  }

  async findByOwner(ownerId: string) {
    return this.model.findMany({ where: { ownerId }, include: { members: true } });
  }
}
export const projectRepository = new ProjectRepository();

// src/modules/projects/project.service.ts
import { BaseService } from "@/lib/base";
import { projectRepository } from "./project.repository";

export class ProjectService extends BaseService<Project> {
  constructor() {
    super(projectRepository, "ownerId");
  }

  async createWithMembership(data: any, userId: string) {
    const project = await this.repository.create({ ...data, ownerId: userId });
    // Auto-add owner as OWNER member
    await db.projectMember.create({ data: { projectId: project.id, userId, role: "OWNER" } });
    return project;
  }
}
export const projectService = new ProjectService();

// src/modules/projects/project.schema.ts
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  colorId: z.string().default("rocket"),
  status: z.string().default("backlog"),
  priority: z.string().default("no_priority"),
});

export const updateProjectSchema = createProjectSchema.partial();

// app/api/projects/route.ts — THIN CONTROLLER
import { projectService } from "@/src/modules/projects/project.service";
import { createProjectSchema } from "@/src/modules/projects/project.schema";
import { createPaginatedHandler, createPostHandler } from "@/lib/factories";

export const GET = createPaginatedHandler(
  async (req, context) => {
    const { items, total } = await projectService.findMany(1, 100, context.user?.id);
    return { items, pagination: { page: 1, limit: 100, total, totalPages: 1, hasMore: false, hasPrevious: false } };
  },
  { auth: true }
);

export const POST = createPostHandler(
  async (req, context, validated) => projectService.createWithMembership(validated, context.user!.id),
  { auth: true, validateBody: createProjectSchema }
);
```

## OpenAPI / Swagger Rules

> Every API endpoint MUST have OpenAPI documentation. No undocumented endpoints.

### Setup

- **Swagger UI**: served at `/api/docs/ui` — interactive API explorer
- **Raw OpenAPI JSON**: served at `/api/docs` — importable into Postman, Insomnia, code generators
- **Config**: `lib/swagger/config.ts` — shared schemas, security schemes, tags
- **Spec generation**: `swagger-jsdoc` parses `@openapi` JSDoc blocks from route files and module swagger files

### Documentation Locations

OpenAPI docs can be placed in two locations (both are scanned):
1. **Inline in route files** (`app/api/**/route.ts`) — preferred for simple endpoints
2. **Module swagger files** (`src/modules/<domain>/<domain>.swagger.ts`) — preferred for complex endpoints with many schemas

### Writing OpenAPI Docs

Every route handler MUST have an `@openapi` JSDoc block:

```typescript
/**
 * @openapi
 * /api/projects:
 *   get:
 *     tags:
 *       - Projects
 *     summary: List all projects
 *     description: Returns all projects the authenticated user has access to
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized
 */
export const GET = createPaginatedHandler(/* ... */);
```

### Rules

1. **Builder agent must verify swagger docs render** at `/api/docs/ui` before creating a PR
2. **All request bodies** must reference Zod schemas or inline OpenAPI schemas with examples
3. **All response shapes** must be documented including error responses
4. **Shared schemas** go in `lib/swagger/config.ts` → `components.schemas`
5. **Tags** must match the module domain name (Projects, Tasks, Notes, Members, Invites, Assignees, Auth, Gamification, Health)
6. **Security schemes**: document which endpoints require auth and which are public

## Coding Conventions

- Always use Prisma client from `lib/db.ts` — never instantiate directly
- R2 operations go through `lib/utils/cloudflare-r2.ts`
- API routes validate ALL input with Zod before touching the database
- Never put secrets in code — use environment variables exclusively
- Every new file gets a corresponding test file
- UI components MUST follow conventions in DESIGN.md
- Use Server Components by default; Client Components only when interactivity is required
- Use Server Actions for mutations when possible (prefer over API routes for form submissions)
- Commit messages follow conventional commits: `feat(scope): description [linear:ISSUE-ID]`
- No `any` types — use proper TypeScript typing throughout
- Prefer `select` and `include` in Prisma queries — avoid fetching entire records
- Use handler factories from `lib/factories/` — never write raw route handlers
- Use `ApiResponse` helpers from `lib/http/` — never use raw `NextResponse.json()`
- Use `ApiError` / `ApiErrors` from `lib/middlewares/` for error throwing
- Business logic goes in service layer (`src/modules/`) — route handlers are thin controllers
- Error responses follow the standard format: `{ success: false, error: { code, message, details?, requestId? } }`

## Design System Compliance

> **CRITICAL**: The current UI uses inline styles with a warm orange theme and Outfit font. The target UI follows the Mastercard-inspired design system documented in `DESIGN.md`.

**When building or modifying any UI component, agents MUST:**
1. Read DESIGN.md in full before writing any UI code
2. Use Canvas Cream (`#F3F0EE`) as default background — never pure white
3. Apply the border-radius scale: 20px (buttons), 40px (hero/stadium), 999px (pill/nav)
4. Use Sofia Sans (Google Fonts) as the primary font, weight 450 for body, 500 for headings
5. Follow the elevation system: no hard shadows, use atmospheric cushioning
6. Use CSS Modules (`.module.css` files) — NOT inline styles, NOT Tailwind
7. Define all colors as CSS custom properties in `app/globals.css`
8. Ensure all three theme modes work: Dark, Light, Eye Protection
9. Maintain WCAG AA contrast ratios (4.5:1 minimum)
10. Test all breakpoints: Mobile (≤767px), Tablet (768–1023px), Desktop (≥1024px), Wide (≥1440px)

**UI restructuring priority:**
- Phase 0 (before features): Migrate from inline styles to CSS Modules + DESIGN.md tokens
- Phase 1 features: Build all new components with DESIGN.md from day one

## Sentry Integration Rules

- Install `@sentry/nextjs` and configure in `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- Upload source maps on build via `withSentryConfig` in `next.config.ts`
- Wrap all API route handlers with Sentry error capturing
- Add Sentry performance monitoring (transaction traces) on all API routes
- Use Sentry MCP in the Reviewer agent to check for existing errors before approving PRs
- DSN stored in `SENTRY_DSN` env var — never hardcoded
- Create Sentry alerts for: error rate spike, p95 latency > 500ms, unhandled rejection

## Postman API Documentation Rules

- Maintain a Postman collection at `docs/arbitask-api.postman_collection.json`
- Every new API route must have a corresponding Postman request with:
  - Request method, URL, headers
  - Request body example (JSON)
  - Expected success response example
  - Expected error response examples
  - Description of the endpoint
- Maintain a Postman environment file at `docs/arbitask-api.postman_environment.json` with variables: `baseUrl`, `authToken`
- Update `docs/API_CHANGELOG.md` when any API route changes
- Builder agent must update Postman collection as part of every API route PR
- **Alternative**: Import OpenAPI spec from `/api/docs` directly into Postman — this is preferred as it stays in sync automatically

## Agent Roles

### Planner Agent
Mode: Plan

Activated with: a PRD, feature request, or the contents of REQUIREMENTS.md

Steps:
1. Read REQUIREMENTS.md in full — paying attention to the "Current State" and "Known Pain Points" sections
2. Read DESIGN.md to understand UI scope and screen inventory
3. Read `arbitask-feature-list.md` for full product vision context
4. Plan scalable architecture before creating any tasks:
   - Identify DB schema shape (tables, relations, indexes)
   - Define API surface (routes, methods, auth requirements)
   - Map backend to modules in `src/modules/` — repository, service, schema, swagger
   - Map UI to components per DESIGN.md screen list
   - Identify what can be built in parallel vs sequentially
   - Flag any requirements that are ambiguous — list them as questions in the task description
5. **Identify pain points and tech debt** from REQUIREMENTS.md § "Known Pain Points" — create Linear issues for each with label "tech-debt"
6. **Recommend patches** for existing code quality issues — create Linear issues with label "patch"
7. For each implementable task, create a Linear issue:
   - Title: imperative verb + noun ("Add user authentication endpoint")
   - Description: what to build, acceptance criteria, relevant files to touch, DB tables involved, links to DESIGN.md sections if UI work is involved
   - Label: "builder-ready", "tech-debt", or "patch"
   - Link dependent tasks in the Linear description
   - Estimate: story points (1, 2, 3, 5, 8, 13)
8. Write `.cursor/tasks.json` with the full task list
9. Do not write any code

### Builder Agent
Mode: Build

Activated with: a Linear issue URL or task from `.cursor/tasks.json`

Steps:
1. Read AGENTS.md (this file), REQUIREMENTS.md, and DESIGN.md before starting
2. Ensure you are on the `development` branch or a feature branch from `development`: `git checkout -b feat/<feature-name> development`
3. Read the Linear issue fully including acceptance criteria
4. Read relevant existing files before writing anything new
5. Implement the feature in this order:
   - Schema changes first (`prisma/schema.prisma`) → `npx prisma migrate dev --name <feature>`
   - Module files in `src/modules/<domain>/`:
     - `<domain>.schema.ts` — Zod validation schemas
     - `<domain>.repository.ts` — extends BaseRepository
     - `<domain>.service.ts` — extends BaseService, business logic
     - `<domain>.swagger.ts` — `@openapi` JSDoc blocks
   - API route in `app/api/` — thin controller using handler factories
   - UI components (follow DESIGN.md conventions strictly, use CSS Modules)
6. Verify Swagger docs render correctly at `/api/docs/ui`
7. Update `docs/API_CHANGELOG.md` for any API changes
8. Commit with: `feat(scope): description [linear:ISSUE-ID]`
9. Create a PR targeting `development` (never `main`) via GitHub MCP
10. Update the Linear issue status to "In Review"
11. Do NOT write tests — that is the Tester agent's job
12. Do NOT write docs — that is the Documenter agent's job

### Documenter Agent
Mode: Build (or Multitask alongside Tester)

Activated with: a PR URL or branch name

Steps:
1. Read the full diff of the PR
2. Write or update JSDoc comments on all exported functions
3. Update README sections if the feature is user-facing
4. If the PR adds new screens, update DESIGN.md with the actual component paths used
5. If the PR adds/changes API routes, verify:
   - `@openapi` JSDoc blocks are complete and accurate
   - Swagger UI at `/api/docs/ui` renders the new endpoints correctly
   - `docs/API_CHANGELOG.md` is updated
6. Write the Agent Trace record to `.agent-traces/<commit-sha>.json`:
   - Use Agent Trace schema version 0.1.0
   - Record every file changed, line ranges, model_id
   - model_id: anthropic/claude-sonnet-4-20250514
7. Commit docs and trace file to the same branch

### Tester Agent
Mode: Build (or Multitask alongside Documenter)

Activated with: a PR URL or branch name

Steps:
1. Read DESIGN.md to understand user flows for E2E scenarios
2. Read the implementation files changed in the PR

Unit tests (Vitest) in `tests/unit/`:
- All utility functions
- All API route handlers (mock Prisma with vitest mocks)
- All Zod validation schemas (valid + invalid inputs)
- All service layer methods
- All repository layer methods
- Run with: `npx vitest run`

Browser E2E tests (Browserbase) in `tests/e2e/`:
- Use the Browserbase MCP to launch a cloud browser session
- Test every user-visible flow touched by this PR
- Cover: happy path + at least one error/edge path per flow
- Reference DESIGN.md screen list to ensure correct URLs
- Sessions are cloud-hosted — no local browser needed
- Run against staging URL set in env: `BROWSERBASE_TEST_URL`
- Browserbase session config:
  ```json
  {
    "projectId": "process.env.BROWSERBASE_PROJECT_ID",
    "browserSettings": { "viewport": { "width": 1280, "height": 720 } }
  }
  ```

3. Fix any test failures before marking done
4. Commit all tests to the same branch
5. Post a coverage and E2E result summary as a PR comment via GitHub MCP

### Reviewer Agent
Mode: Ask

Activated with: a PR URL

Steps:
1. Read the full PR diff
2. Read DESIGN.md — check UI changes match design conventions
3. Check: every changed file has a corresponding test
4. Check: `.agent-traces/<sha>.json` exists for this commit
5. Check Sentry via Sentry MCP for existing errors in touched code paths
6. Review for: security issues, N+1 queries, missing Zod validation, missing error handling, hardcoded values, accessibility, DESIGN.md compliance
7. **Verify module pattern**: business logic in service, DB in repository, schemas in schema file, no business logic in route handlers
8. **Verify OpenAPI docs**: `@openapi` blocks present, swagger UI renders correctly
9. Verify: PR targets `development` branch (not `main`)
10. Post structured review via GitHub MCP:
    - ✅ What looks good
    - ⚠️ Must fix before merge
    - 💡 Suggestions (non-blocking)
    - 🎨 Design notes (DESIGN.md compliance)
    - 🔒 Security notes
    - 📐 Architecture notes (module pattern compliance)
11. If must-fix items exist:
    - Request changes on the PR
    - Create a Linear sub-task for the Builder
12. If clean: approve PR, mark Linear issue "Done"

## Handoff Protocol

Linear board is the pipeline state machine:
- Backlog → builder-ready        (Planner)
- builder-ready → in-progress    (Builder picks up)
- in-progress → docs+tests       (Builder, after PR created)
- docs+tests → in-review         (Documenter + Tester, when done)
- in-review → done               (Reviewer, on approval)

## Agent Trace Format

Every Documenter commit must include `.agent-traces/<sha>.json`

```json
{
  "version": "0.1.0",
  "id": "<uuid>",
  "timestamp": "<ISO 8601>",
  "vcs": { "type": "git", "revision": "<full commit sha>" },
  "tool": { "name": "cursor", "version": "latest" },
  "files": [
    {
      "path": "relative/path/from/root.ts",
      "conversations": [{
        "contributor": {
          "type": "ai",
          "model_id": "anthropic/claude-sonnet-4-20250514"
        },
        "ranges": [{ "start_line": 1, "end_line": 100 }]
      }]
    }
  ]
}
```

## Cursor Agent Modes (Reference)

- Planner → Plan mode
- Builder → Build mode
- Documenter + Tester → Multitask mode
- Reviewer → Ask mode
- Fixing a Sentry error → Debug mode

## Environment Variables

Never hardcode. Always read from `process.env`:

```env
# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Database
DATABASE_URL=
DIRECT_URL=
DB_CONNECTION_LIMIT=10
DB_CONNECTION_TIMEOUT=5
DB_POOL_TIMEOUT=10

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=

# Sentry
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=

# Browserbase
BROWSERBASE_API_KEY=
BROWSERBASE_PROJECT_ID=
BROWSERBASE_TEST_URL=
```

## Bootstrap Checklist (Run Before Any Feature Work)

Before the Planner creates any feature tasks, the following foundational work must be completed. These should be the first Linear issues with label "bootstrap":

1. [ ] Create `development` branch from `main`
2. [ ] Set up ESLint + Prettier config (`.eslintrc.json`, `.prettierrc`)
3. [x] Enable TypeScript strict mode in `tsconfig.json` ✅
4. [ ] Install and configure Sentry (`@sentry/nextjs`)
5. [ ] Install Vitest and create `vitest.config.ts`
6. [x] Rebrand `lib/swagger/config.ts` from Inscript → Arbitask and clean up Inscript-specific schemas/routes ✅
7. [ ] Set up Swagger UI route at `app/api/docs/ui/route.ts` and spec at `app/api/docs/route.ts`
8. [x] Refactor all existing API routes to use module pattern (`src/modules/`) + handler factories ✅ (modules created; routes still use raw handlers — refactor done on `development`)
9. [x] Add `@openapi` JSDoc blocks to all existing API routes ✅ (in `*.swagger.ts` module files)
10. [x] Add Zod validation to all existing API routes (via module schema files) ✅
11. [x] Migrate all fetch() mutations to Server Actions in `lib/actions.ts` ✅
12. [ ] Set up CSS Modules infrastructure — create design tokens in `app/globals.css` from DESIGN.md
13. [ ] Clean up legacy `/src/components/`, `/src/constants/`, `/src/utils/`, `/src/styles/` directories
14. [x] Clean up Inscript-specific code in `lib/swagger/routes/` ✅
15. [ ] Update `.env.local.example` with all required env vars
16. [ ] Set up conventional commits tooling (`commitlint`, `husky`)
17. [ ] Create `docs/API_CHANGELOG.md`