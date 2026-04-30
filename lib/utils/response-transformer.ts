/**
 * @fileoverview Response Transformation Utilities
 *
 * Automatically transforms database models to API responses:
 * - Hides internal 'id' field
 * - Exposes 'externalId' as 'id'
 * - Removes other internal fields (deletedAt, etc.)
 */

/**
 * Base entity with internal ID and optional external ID
 * If externalId exists, it will be used as the API 'id'
 * Otherwise, the internal 'id' will be converted to string
 */
export interface EntityWithExternalId {
  id: number | string;
  externalId?: string; // Optional - falls back to id if not present
  deletedAt?: Date | null;
  [key: string]: any;
}

/**
 * Transformed API response type
 * - 'id' becomes the externalId (UUID)
 * - Internal 'id' is removed
 * - Optional fields like 'deletedAt' are removed
 */
export type ApiResponse<T extends EntityWithExternalId> = Omit<
  T,
  "id" | "externalId" | "deletedAt"
> & {
  id: string; // externalId mapped to id
};

/**
 * Transform a single entity to API response format
 * Hides internal ID, exposes externalId as id, removes internal fields
 * Falls back to id as string if externalId doesn't exist
 */
export function toApiResponse<T extends EntityWithExternalId>(entity: T): ApiResponse<T> {
  const { id: _internalId, externalId, deletedAt: _deletedAt, ...rest } = entity;

  // Use externalId if available, otherwise use id as string (for entities without externalId)
  const apiId = externalId || String(_internalId);

  return {
    ...rest,
    id: apiId,
  } as ApiResponse<T>;
}

/**
 * Transform an array of entities to API response format
 */
export function toApiResponseList<T extends EntityWithExternalId>(entities: T[]): ApiResponse<T>[] {
  return entities.map(toApiResponse);
}

/**
 * Transform paginated result to API response format
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export function toPaginatedApiResponse<T extends EntityWithExternalId>(
  result: PaginatedResult<T>
): PaginatedResult<ApiResponse<T>> {
  return {
    items: toApiResponseList(result.items),
    total: result.total,
  };
}

/**
 * Create a response transformer for a specific model
 * Useful for creating type-safe transformers with additional logic
 */
export function createResponseTransformer<
  TEntity extends EntityWithExternalId,
  TResponse extends ApiResponse<TEntity> = ApiResponse<TEntity>,
>(customTransform?: (entity: TEntity) => TResponse) {
  return {
    one: (entity: TEntity): TResponse => {
      const base = toApiResponse(entity);
      return customTransform ? customTransform(entity) : (base as TResponse);
    },
    many: (entities: TEntity[]): TResponse[] => {
      return entities.map((entity) => {
        const base = toApiResponse(entity);
        return customTransform ? customTransform(entity) : (base as TResponse);
      });
    },
    paginated: (result: PaginatedResult<TEntity>): PaginatedResult<TResponse> => {
      return {
        items: result.items.map((entity) => {
          const base = toApiResponse(entity);
          return customTransform ? customTransform(entity) : (base as TResponse);
        }),
        total: result.total,
      };
    },
  };
}

/**
 * Helper to check if an object has externalId field
 */
export function hasExternalId(obj: any): obj is EntityWithExternalId {
  return (
    obj &&
    typeof obj === "object" &&
    "id" in obj &&
    "externalId" in obj &&
    typeof obj.externalId === "string"
  );
}

/**
 * Automatically transform response data if it contains entities with externalId
 * Works with single entities, arrays, and nested structures
 */
export function autoTransformResponse<T>(data: T): T {
  if (!data) return data;

  // Handle array
  if (Array.isArray(data)) {
    return data.map(autoTransformResponse) as T;
  }

  // Handle object
  if (typeof data === "object") {
    // If it's an entity with externalId, transform it
    if (hasExternalId(data)) {
      return toApiResponse(data) as T;
    }

    // Otherwise, recursively transform nested objects
    const transformed: any = {};
    for (const [key, value] of Object.entries(data)) {
      transformed[key] = autoTransformResponse(value);
    }
    return transformed;
  }

  return data;
}
