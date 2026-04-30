# Backend Modules — `src/modules/`

This directory contains the domain-specific backend modules for Arbitask. Each module follows a standardized 4-file pattern.

## Module Pattern

```
src/modules/<domain>/
├── <domain>.repository.ts   # Database queries — extends BaseRepository
├── <domain>.service.ts      # Business logic — extends BaseService
├── <domain>.schema.ts       # Zod validation schemas + TypeScript types
└── <domain>.swagger.ts      # @openapi JSDoc blocks for API documentation
```

## Current Modules

| Module | Description | API Routes |
|---|---|---|
| `projects/` | Project CRUD, milestones | `/api/projects`, `/api/projects/[id]` |
| `tasks/` | Task CRUD, status updates | `/api/tasks`, `/api/tasks/[id]` |
| `notes/` | Markdown note management | `/api/notes`, `/api/notes/[id]` |
| `members/` | Project member management | `/api/members`, `/api/members/[id]` |
| `invites/` | Invite link generation/acceptance | `/api/invites`, `/api/invites/[token]` |
| `assignees/` | Task assignee management | `/api/tasks/[id]/assignees` |
| `gamification/` | XP, levels, achievements | (computed, no dedicated route yet) |

## Architecture Flow

```
Request
  ↓
app/api/<domain>/route.ts          ← Thin controller (uses handler factory)
  ↓
lib/http/withMiddleware.ts         ← Auth → Rate Limit → Validation → Logging
  ↓
src/modules/<domain>/service.ts    ← Business logic (auth checks, side effects)
  ↓
src/modules/<domain>/repository.ts ← Database queries (Prisma)
  ↓
lib/db.ts → Prisma → Database
```

## Rules

1. **Route handlers are thin controllers** — use handler factories from `lib/factories/`
2. **Business logic goes in the service** — never in route handlers
3. **Database queries go in the repository** — extend `BaseRepository` from `lib/base/`
4. **Zod schemas go in the schema file** — import common schemas from `lib/validation/`
5. **OpenAPI docs go in the swagger file** — or inline in route files
6. **Each module is self-contained** — import from other modules' services, not their repositories

## Adding a New Module

1. Create `src/modules/<name>/` directory
2. Create `<name>.schema.ts` — define Zod schemas for create/update/query
3. Create `<name>.repository.ts` — extend `BaseRepository`, add custom queries
4. Create `<name>.service.ts` — extend `BaseService`, add business logic
5. Create `<name>.swagger.ts` — add `@openapi` JSDoc blocks
6. Create `app/api/<name>/route.ts` — thin controller using handler factories
7. Add schemas to `lib/swagger/config.ts` → `components.schemas` if shared
8. Add tag to `lib/swagger/config.ts` → `tags`

See `AGENTS.md` § "Backend Architecture Rules" for the complete reference with code examples.
