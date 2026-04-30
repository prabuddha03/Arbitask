# Factories — `lib/factories/`

Reusable factory patterns to reduce boilerplate and ensure consistency across API routes.

## Handler Factory

**Purpose**: Create API handlers with less boilerplate. All route handlers in `app/api/` should use these factories.

### Simple GET Handler

```typescript
import { createGetHandler } from "@/lib/factories";
import { projectService } from "@/src/modules/projects/project.service";

export const GET = createGetHandler(
  async (req, context) => {
    return await projectService.getProjectsForUser(context.user!.id);
  },
  {
    auth: true,
    rateLimit: { max: 100, window: "1m" },
  }
);
```

### POST Handler with Validation

```typescript
import { createPostHandler } from "@/lib/factories";
import { createProjectSchema } from "@/src/modules/projects/project.schema";
import { projectService } from "@/src/modules/projects/project.service";

export const POST = createPostHandler(
  async (req, context, validated) => {
    return await projectService.createProject(validated, context.user!.id);
  },
  {
    auth: true,
    validateBody: createProjectSchema,
    rateLimit: { max: 10, window: "1h" },
  }
);
```

### Paginated Handler

```typescript
import { createPaginatedHandler } from "@/lib/factories";
import { projectService } from "@/src/modules/projects/project.service";
import { buildPaginationResult, parsePaginationQuery } from "@/lib/utils/pagination";

export const GET = createPaginatedHandler(
  async (req, context) => {
    const url = new URL(req.url);
    const { page, limit } = parsePaginationQuery(url.searchParams);

    const { items, total } = await projectService.findMany(page, limit, context.user?.id);
    const pagination = buildPaginationResult(items, total, page, limit).pagination;

    return { items, pagination };
  },
  { auth: true }
);
```

## CRUD Factory

**Purpose**: Generate complete CRUD endpoints with one function call.

### Basic Usage

```typescript
import { createCrudHandlers } from "@/lib/factories";
import { projectService } from "@/src/modules/projects/project.service";
import { createProjectSchema, updateProjectSchema } from "@/src/modules/projects/project.schema";

const handlers = createCrudHandlers(projectService, {
  resourceName: "Project",
  createSchema: createProjectSchema,
  updateSchema: updateProjectSchema,
  createAuth: { auth: true },
  updateAuth: { auth: true },
  deleteAuth: { auth: true },
});

// app/api/projects/route.ts
export const GET = handlers.list;
export const POST = handlers.create;

// app/api/projects/[id]/route.ts
export const GET = handlers.getById;
export const PUT = handlers.update;
export const DELETE = handlers.delete;
```

### With Hooks

```typescript
const handlers = createCrudHandlers(projectService, {
  resourceName: "Project",

  beforeCreate: async (data, context) => ({
    ...data,
    ownerId: context.user!.id,
  }),

  afterCreate: async (project, context) => {
    // Trigger gamification XP
  },

  beforeDelete: async (id, context) => {
    // Verify owner permission
  },
});
```

## Architecture Pattern

```
Route Handler (app/api/route.ts)
  ↓ uses handler factory (lib/factories/)
  ↓ withMiddleware applies: auth → rate limit → validation → logging
Service (src/modules/<domain>/service.ts)
  ↓ business logic, auth checks, side effects
Repository (src/modules/<domain>/repository.ts)
  ↓ database queries
Database (lib/db.ts → Prisma)
```

## Benefits

1. **Consistency**: All endpoints follow the same pattern
2. **Less Boilerplate**: Write 90% less code per route
3. **Type Safety**: Full TypeScript support
4. **Maintainability**: Change once, apply everywhere
5. **Best Practices**: Baked-in auth, validation, rate limiting, error handling, logging
