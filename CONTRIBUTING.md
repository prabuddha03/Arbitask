# Contributing to Arbitask

## Development Workflow

### 1. Branch Setup

```bash
# One-time: create dev branch from main
git checkout main
git pull origin main
git checkout -b dev

# For each feature
git checkout dev
git pull origin dev
git checkout -b feat/<feature-name>
```

### 2. Feature Development Order

For every feature, follow this implementation order:

1. **Schema** — `prisma/schema.prisma` → `npx prisma migrate dev --name <feature>`
2. **Validation** — Zod schemas co-located with API routes
3. **API** — Route handlers in `app/api/`
4. **Server Actions** — In `lib/actions.ts` or feature-specific files
5. **UI** — Components in `components/` with CSS Modules following DESIGN.md
6. **Postman** — Update `docs/arbitask-api.postman_collection.json`
7. **Changelog** — Update `docs/API_CHANGELOG.md`

### 3. Commit Convention

```
feat(scope): add sprint creation endpoint [linear:ARB-42]
fix(auth): handle expired session token [linear:ARB-55]
chore(deps): upgrade prisma to 5.23
test(api): add vitest coverage for task routes
docs(readme): update deployment instructions
```

### 4. Pull Request Checklist

- [ ] Branch created from `dev`, PR targets `dev`
- [ ] All API routes have Zod validation
- [ ] UI follows DESIGN.md conventions (CSS Modules, correct colors, correct fonts)
- [ ] Postman collection updated for API changes
- [ ] API_CHANGELOG.md updated
- [ ] No `any` types
- [ ] No hardcoded secrets
- [ ] Sentry error capturing on new error paths
- [ ] Lint passes: `npx next lint`

### 5. Testing

```bash
# Unit + integration tests
npx vitest run

# Watch mode during development
npx vitest

# Coverage report
npx vitest run --coverage
```

### 6. Database

```bash
# Local dev (SQLite)
npx prisma db push
npx prisma generate

# With migrations (PostgreSQL)
npx prisma migrate dev --name <feature>

# View data
npx prisma studio
```

## Architecture Decisions

### Why CSS Modules over inline styles?
The current MVP uses inline styles, but DESIGN.md requires a complex token system (colors, radii, elevations, breakpoints) that inline styles can't ergonomically support. CSS Modules provide co-located, scoped styles with full CSS feature support.

### Why Zod on every API route?
The MVP has zero input validation. Any malformed request body hits Prisma directly, risking database errors and potential injection. Zod provides type-safe validation with clear error messages.

### Why Server Components by default?
Next.js 15 App Router performance benefits come from minimizing client-side JavaScript. Only use `"use client"` when the component needs: event handlers, useState, useEffect, browser APIs, or third-party client libraries.

### Why separate `dev` branch?
The MVP was built entirely on `main`. With multiple agents and parallel feature work, a `dev` integration branch prevents incomplete features from reaching production.
