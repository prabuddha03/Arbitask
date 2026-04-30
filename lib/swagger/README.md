# API Documentation with Swagger/OpenAPI — Arbitask

This directory contains the Swagger/OpenAPI documentation infrastructure for the Arbitask API.

## 📚 Overview

We use **Swagger UI** to provide interactive API documentation. The documentation is auto-generated from `@openapi` JSDoc blocks placed in API route files and module swagger files.

## 🚀 Access Documentation

### Development

- **Swagger UI**: http://localhost:3000/api/docs/ui
- **Raw OpenAPI JSON**: http://localhost:3000/api/docs

### Production

- **Swagger UI**: https://your-domain.com/api/docs/ui
- **Raw OpenAPI JSON**: https://your-domain.com/api/docs

## 📁 Structure

```
lib/swagger/
├── config.ts          # Main Swagger configuration (schemas, tags, security)
├── routes/            # Legacy route documentation (being migrated to modules)
├── index.ts           # Exports
└── README.md          # This file

src/modules/<domain>/
└── <domain>.swagger.ts  # Module-level OpenAPI docs (preferred location)
```

## 🔧 How It Works

1. **`@openapi` JSDoc blocks** are written in API route files or module swagger files
2. **`swagger-jsdoc`** parses the blocks and generates an OpenAPI 3.0 spec
3. **Swagger UI** renders interactive documentation at `/api/docs/ui`
4. **Raw JSON spec** available at `/api/docs` for import into Postman/Insomnia

## 📂 Paths Scanned for Docs

The following directories are scanned for `@openapi` JSDoc blocks:

- `app/api/**/*.{ts,tsx,js,jsx}` — API route handlers
- `src/modules/**/*.{ts,tsx,js,jsx}` — Module swagger files
- `lib/swagger/routes/**/*.{ts,js}` — Legacy doc modules (deprecated)

## ✏️ Adding New Documentation

### Preferred: Inline in API route files

Add `@openapi` blocks directly above the handler:

```typescript
// app/api/projects/route.ts

/**
 * @openapi
 * /api/projects:
 *   get:
 *     tags:
 *       - Projects
 *     summary: List all projects
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 */
export const GET = createPaginatedHandler(/* ... */);
```

### Alternative: Module swagger file

For complex endpoints with many schemas, create a dedicated swagger file:

```typescript
// src/modules/projects/project.swagger.ts

/**
 * @openapi
 * /api/projects:
 *   get:
 *     tags:
 *       - Projects
 *     summary: List all projects
 *     ...
 */
export {};
```

## 🔐 Authentication

Arbitask uses Auth.js v5 with cookie-based sessions. In Swagger UI:

1. Login to the app in a separate tab (same domain)
2. The session cookie will be automatically sent with Swagger UI requests
3. No manual token entry needed for local development

## 🎯 Conventions

1. **Document all endpoints** — every public API route must have `@openapi` documentation
2. **Use tags** — match the module domain: Projects, Tasks, Notes, Members, Invites, Assignees, Auth, Gamification, Health
3. **Use `$ref`** — reference shared schemas from `lib/swagger/config.ts` → `components.schemas`
4. **Include examples** — provide realistic example requests and responses
5. **Document errors** — include 400, 401, 403, 404, 500 responses where applicable
6. **Keep docs with code** — prefer inline `@openapi` in route files over separate doc files

## 🔗 Resources

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc)
