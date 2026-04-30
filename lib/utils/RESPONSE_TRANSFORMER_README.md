# Response Transformer - Automatic ID Transformation

## 🎯 Purpose

Automatically transforms database entities to API responses by:

- **Hiding internal database IDs** (integer primary keys)
- **Exposing `externalId` as `id`** (UUID for external use)
- **Removing internal fields** like `deletedAt`

## 🔐 Security Benefits

1. **Prevents ID Enumeration**: External UUIDs can't be guessed sequentially
2. **Database Independence**: Can change internal IDs without breaking API contracts
3. **Consistent API**: All entities expose UUIDs as their identifier

## 📦 Usage

### Simple Auto-Transform (Recommended)

Use the specialized response helpers in `lib/http/ApiResponse.ts`:

```typescript
import { entityResponse, entityListResponse, entityCreatedResponse } from "@/lib/http";

// Single entity
const topic = await topicService.getById(1);
return entityResponse(topic); // ✅ Auto-transforms to { id: "uuid-...", ... }

// List of entities
const topics = await topicService.listAll();
return entityListResponse(topics); // ✅ Auto-transforms all items

// Created entity
const newTopic = await topicService.create(data);
return entityCreatedResponse(newTopic); // ✅ 201 response with transformed entity
```

### Manual Transform

If you need custom logic, use the transformers directly:

```typescript
import { toApiResponse, toApiResponseList } from "@/lib/utils";

// Single entity
const topic = await topicService.getById(1);
const response = toApiResponse(topic);
// Before: { id: 1, externalId: "uuid-123", name: "Science", deletedAt: null }
// After:  { id: "uuid-123", name: "Science" }

// Array of entities
const topics = await topicService.listAll();
const response = toApiResponseList(topics);
```

### Custom Transformers

For models with additional custom transformation logic:

```typescript
import { createResponseTransformer } from "@/lib/utils";
import type { User } from "@/lib/generated/prisma";

// Create a custom transformer
const userTransformer = createResponseTransformer<User>((user) => {
  const base = toApiResponse(user);
  return {
    ...base,
    fullName: `${user.firstName} ${user.lastName}`, // Custom field
    avatarUrl: user.profileImage || "/default-avatar.png", // Default value
  };
});

// Use it
const user = await userService.getById(1);
return entityResponse(userTransformer.one(user));
```

## 🏗️ Architecture

### Type System

```typescript
// Input: Database entity with internal ID
interface EntityWithExternalId {
  id: number | string; // ← Hidden in API
  externalId: string; // ← Becomes 'id' in API
  deletedAt?: Date | null; // ← Removed
  [key: string]: any; // ← Other fields preserved
}

// Output: API response type
type ApiResponse<T> = Omit<T, "id" | "externalId" | "deletedAt"> & {
  id: string; // externalId mapped to id
};
```

### Example Transformation

```typescript
// Database model
const dbTopic = {
  id: 42, // ← Internal DB ID
  externalId: "01933e1a-6a5c-7890-8234-123456789abc", // ← UUID
  name: "Science",
  slug: "science",
  followerCount: 100,
  deletedAt: null, // ← Soft delete field
  createdAt: new Date(),
  updatedAt: new Date(),
};

// API response (after transformation)
const apiResponse = {
  id: "01933e1a-6a5c-7890-8234-123456789abc", // ← externalId as id
  name: "Science",
  slug: "science",
  followerCount: 100,
  createdAt: new Date(),
  updatedAt: new Date(),
  // id: 42 → HIDDEN
  // externalId → REMOVED (now 'id')
  // deletedAt → REMOVED
};
```

## 🔧 Controller Pattern

### Before (Manual Transformation)

```typescript
export const getTopic = withMiddleware(async (req, context) => {
  const topic = await topicService.getById(id);
  if (!topic) return notFoundResponse("Not found");

  // ❌ Manual transformation required
  const response = {
    id: topic.externalId,
    name: topic.name,
    slug: topic.slug,
    // ... manually map each field
  };

  return successResponse(response);
});
```

### After (Auto Transformation)

```typescript
export const getTopic = withMiddleware(async (req, context) => {
  const topic = await topicService.getById(id);
  if (!topic) return notFoundResponse("Not found");

  // ✅ Automatic transformation
  return entityResponse(topic);
});
```

## 📋 Complete Example

```typescript
// src/modules/topics/topic.controller.ts
import { withMiddleware, getValidatedBody } from "@/lib/http/withMiddleware";
import {
  entityResponse,
  entityListResponse,
  entityCreatedResponse,
  notFoundResponse,
} from "@/lib/http/ApiResponse";
import { topicService } from "./topic.service";

// List all topics
export const listTopics = withMiddleware(async () => {
  const topics = await topicService.listAll();
  return entityListResponse(topics); // ✅ Auto-transforms
});

// Get single topic
export const getTopic = withMiddleware(async (req, context, params) => {
  const topic = await topicService.getBySlug(params.slug);
  if (!topic) return notFoundResponse("Topic not found");
  return entityResponse(topic); // ✅ Auto-transforms
});

// Create topic
export const createTopic = withMiddleware(
  async (req) => {
    const body = getValidatedBody(req);
    const topic = await topicService.create(body);
    return entityCreatedResponse(topic); // ✅ Auto-transforms + 201
  },
  { auth: true, validateBody: createTopicSchema }
);

// Update topic
export const updateTopic = withMiddleware(
  async (req, context, params) => {
    const body = getValidatedBody(req);
    const topic = await topicService.update(params.id, body);
    if (!topic) return notFoundResponse("Topic not found");
    return entityResponse(topic, { message: "Updated successfully" });
  },
  { auth: true, validateBody: updateTopicSchema }
);
```

## 🎨 API Response Format

All entity responses follow this structure:

```json
{
  "success": true,
  "data": {
    "id": "01933e1a-6a5c-7890-8234-123456789abc",
    "name": "Science",
    "slug": "science",
    "description": "All about science",
    "followerCount": 0,
    "articleCount": 0,
    "createdAt": "2024-12-10T12:00:00.000Z",
    "updatedAt": "2024-12-10T12:00:00.000Z"
  }
}
```

## 🔍 Available Functions

### Response Helpers (lib/http/ApiResponse.ts)

| Function                                  | Purpose                 | Returns      |
| ----------------------------------------- | ----------------------- | ------------ |
| `entityResponse(entity, options?)`        | Transform single entity | 200 response |
| `entityListResponse(entities, options?)`  | Transform entity array  | 200 response |
| `entityCreatedResponse(entity, message?)` | Transform + 201 status  | 201 response |

### Core Transformers (lib/utils/response-transformer.ts)

| Function                               | Purpose                   | Returns                |
| -------------------------------------- | ------------------------- | ---------------------- |
| `toApiResponse(entity)`                | Transform single          | Transformed object     |
| `toApiResponseList(entities)`          | Transform array           | Transformed array      |
| `toPaginatedApiResponse(result)`       | Transform paginated       | Transformed pagination |
| `createResponseTransformer(customFn?)` | Create custom transformer | Transformer object     |
| `autoTransformResponse(data)`          | Auto-detect & transform   | Transformed data       |

## ✅ Best Practices

1. **Always use auto-transform helpers** - Don't manually map fields
2. **Never expose internal IDs** - Always use UUIDs externally
3. **Keep transformers pure** - No side effects, just data mapping
4. **Document custom transformations** - If you add custom logic
5. **Use TypeScript** - Types ensure correct transformation

## 🚫 Don't Do This

```typescript
// ❌ BAD: Exposing internal ID
return successResponse({ id: topic.id, name: topic.name });

// ❌ BAD: Manual mapping
const response = { id: topic.externalId, name: topic.name, ... };
return successResponse(response);

// ❌ BAD: Mixing internal and external IDs
return successResponse({ internalId: topic.id, id: topic.externalId });
```

## ✅ Do This Instead

```typescript
// ✅ GOOD: Auto-transform
return entityResponse(topic);

// ✅ GOOD: Custom transformation when needed
const transformed = toApiResponse(topic);
return successResponse({ ...transformed, customField: "value" });

// ✅ GOOD: Type-safe custom transformer
const transformer = createResponseTransformer((entity) => ({
  ...toApiResponse(entity),
  customField: computeValue(entity),
}));
```

## 🔗 Related Files

- `lib/utils/response-transformer.ts` - Core transformation logic
- `lib/http/ApiResponse.ts` - Response helpers with auto-transform
- `lib/utils/index.ts` - Exports
- `src/modules/topics/topic.controller.ts` - Example usage

## 📝 Notes

- **UUIDv7**: We use UUIDv7 for `externalId` (sortable, includes timestamp)
- **Caching**: Transformation is fast, no caching needed
- **Database**: Internal IDs remain unchanged in the database
- **Prisma**: Works seamlessly with Prisma models
