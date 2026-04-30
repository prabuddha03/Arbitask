# Validation Layer

All validation logic is centralized in this directory.

## File Structure

```
lib/validation/
├── validation.ts           # Core validation logic
├── schemas/
│   └── common.schema.ts   # Shared Zod schemas
├── index.ts               # Barrel exports
└── README.md              # This file
```

## Core Functions

### `validate(schema, data)`

Validates data against a Zod schema (throws on error)

```typescript
import { validate } from "@/lib/validation";
import { z } from "zod";

const userSchema = z.object({ name: z.string(), email: z.string().email() });
const user = validate(userSchema, data); // Throws ValidationError if invalid
```

### `validateSafe(schema, data)`

Safe validation that returns result object (doesn't throw)

```typescript
import { validateSafe } from "@/lib/validation";

const result = validateSafe(userSchema, data);
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.errors);
}
```

### `validateRequestBody(req, schema)`

Validates request body from Next.js Request

```typescript
import { validateRequestBody } from "@/lib/validation";

const data = await validateRequestBody(req, createUserSchema);
```

**Used in:** `lib/http/withMiddleware.ts` for automatic body validation

### `validateQueryParams(req, schema)`

Validates URL query parameters

```typescript
import { validateQueryParams } from "@/lib/validation";

const params = validateQueryParams(req, paginationSchema);
// params = { page: 1, limit: 20 }
```

### `validateRouteParams(params, schema)`

Validates route parameters (e.g., `[id]`)

```typescript
import { validateRouteParams } from "@/lib/validation";

const { id } = validateRouteParams(
  params,
  z.object({
    id: z.coerce.number(),
  })
);
```

## Common Schemas

Pre-built validation schemas for common use cases:

```typescript
import {
  emailSchema,
  phoneSchema,
  paginationSchema,
  passwordSchema,
  usernameSchema,
  otpSchema,
} from "@/lib/validation/schemas/common.schema";

const createUserSchema = z.object({
  email: emailSchema,
  phone: phoneSchema.optional(),
  password: passwordSchema,
  username: usernameSchema,
});
```

## Error Handling

All validation functions throw `ValidationError` on failure:

```typescript
import { ValidationError, formatValidationErrors } from "@/lib/validation";

try {
  const data = validate(schema, input);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(error.errors);
    // { "email": ["Invalid email format"], "age": ["Must be positive"] }
  }
}
```

The `ValidationError` is automatically caught and formatted by `withMiddleware` in API routes.

## Usage in API Routes

### Automatic Validation with `withMiddleware`

```typescript
import { withMiddleware, successResponse } from "@/lib/http";
import { z } from "zod";

const createThreadSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
});

export const POST = withMiddleware(
  async (req, context) => {
    const body = await req.json(); // Body is automatically validated
    const thread = await threadService.create(body);
    return successResponse(thread);
  },
  {
    auth: true,
    validateBody: createThreadSchema, // ← Automatic validation
  }
);
```

### Manual Validation

```typescript
import { validateRequestBody } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const data = await validateRequestBody(req, createThreadSchema);
  // data is typed and validated
}
```

## Import Paths

Both import paths work:

```typescript
// From validation layer (recommended)
import { validateRequestBody, ValidationError } from "@/lib/validation";

// From middleware layer (for convenience)
import { validateRequestBody, ValidationError } from "@/lib/middlewares/validate.middleware";
```

## Best Practices

1. **Use common schemas** - Reuse `emailSchema`, `phoneSchema`, etc.
2. **Define schemas near usage** - Domain-specific schemas go in service files
3. **Use `withMiddleware`** - Let it handle validation automatically
4. **Type your data** - Let Zod infer types: `type User = z.infer<typeof userSchema>`

## See Also

- [Common Schemas](./schemas/common.schema.ts) - All reusable validation schemas
- [Middleware Documentation](../middlewares/README.md) - How validation fits into middleware pipeline
