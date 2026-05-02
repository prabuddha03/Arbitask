# Contributing to Arbitask

## Development Workflow

### 1. Branch Setup

```bash
# One-time: create development branch from main
git checkout main
git pull origin main
git checkout -b development

# For each feature
git checkout development
git pull origin development
git checkout -b feat/<feature-name>
```

### 2. Feature Development Order

For every feature, follow this implementation order:

1. **Schema** — `prisma/schema.prisma` → `npx prisma migrate dev --name <feature>`
2. **Module** — `src/modules/<domain>/` — schema, repository, service, swagger files
3. **API** — Thin controller in `app/api/` using handler factories from `lib/factories/`
4. **Server Actions** — In `lib/actions.ts` for UI-driven mutations
5. **UI** — Components in `components/` with CSS Modules following DESIGN.md
6. **Changelog** — Update `docs/API_CHANGELOG.md`

### 3. Commit Convention

```
feat(scope): add sprint creation endpoint [linear:ARB-42]
fix(auth): handle expired session token [linear:ARB-55]
chore(deps): upgrade prisma to 5.23
test(api): add vitest coverage for task routes
docs(readme): update deployment instructions
```

### 4. Pull Request Checklist

- [ ] Branch created from `development`, PR targets `development`
- [ ] New module follows `src/modules/<domain>/` pattern (schema, repo, service, swagger)
- [ ] API route uses handler factory — no raw `NextResponse.json()` calls
- [ ] All API routes have Zod validation
- [ ] `@openapi` JSDoc blocks added/updated in `*.swagger.ts`
- [ ] Swagger UI renders correctly at `/api/docs/ui`
- [ ] UI follows DESIGN.md conventions (CSS Modules, correct colors, correct fonts)
- [ ] `docs/API_CHANGELOG.md` updated
- [ ] No `any` types
- [ ] No hardcoded secrets
- [ ] Sentry error capturing on new error paths
- [ ] Lint passes: `npm run lint`

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

PostgreSQL is required for all environments. Set `DATABASE_URL` and `DIRECT_URL` in `.env.local` / `.env` (see [`.env.local.example`](.env.local.example)).

```bash
# Preferred: apply migrations and generate client
npx prisma migrate dev --name <feature_or_init>
npx prisma generate

# Optional: schema sync without migration files (throwaway DBs only)
# npx prisma db push

# View data
npx prisma studio
```

## Architecture Decisions

### Why module pattern (`src/modules/<domain>/`)?
Separates database queries (repository), business logic (service), validation (schema), and docs (swagger). Keeps route handlers as thin controllers — no logic in `app/api/` files.

### Why CSS Modules over inline styles?
The current MVP uses inline styles, but DESIGN.md requires a complex token system (colors, radii, elevations, breakpoints) that inline styles can't ergonomically support. CSS Modules provide co-located, scoped styles with full CSS feature support.

### Why Server Actions instead of fetch()?
Server Actions run on the server, avoid an extra HTTP round-trip, and integrate seamlessly with Next.js's `revalidatePath` cache system. Use `fetch('/api/...')` only for external API consumers — all internal UI mutations go through `lib/actions.ts`.

### Why Server Components by default?
Next.js 15 App Router performance benefits come from minimizing client-side JavaScript. Only use `"use client"` when the component needs: event handlers, useState, useEffect, browser APIs, or third-party client libraries.

### Why a separate `development` branch?
The MVP was built entirely on `main`. With multiple agents and parallel feature work, a `development` integration branch prevents incomplete features from reaching production.
