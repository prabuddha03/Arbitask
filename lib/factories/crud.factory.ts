/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @fileoverview CRUD factory - generates standard CRUD endpoints
 *
 * Automatically creates:
 * - GET /resource (list with pagination)
 * - GET /resource/:id (get by ID)
 * - POST /resource (create)
 * - PUT /resource/:id (update)
 * - DELETE /resource/:id (delete)
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import {
  createGetOneHandler,
  createPostHandler,
  createPutHandler,
  createDeleteHandler,
  createPaginatedHandler,
} from "./handler.factory";
import type { HandlerConfig } from "./handler.factory";
import type { RequestContext } from "../http";
import { parsePaginationQuery, buildPaginationResult } from "../utils/pagination";

export interface CrudService<T> {
  findMany: (
    page: number,
    limit: number,
    userId?: string
  ) => Promise<{ items: T[]; total: number }>;
  findById: (id: number | string, userId?: string) => Promise<T | null>;
  create: (data: any, userId?: string) => Promise<T>;
  update: (id: number | string, data: any, userId?: string) => Promise<T | null>;
  delete: (id: number | string, userId?: string) => Promise<void>;
}

export interface CrudFactoryConfig {
  // Schemas
  createSchema?: z.Schema;
  updateSchema?: z.Schema;

  // Permissions
  listAuth?: HandlerConfig;
  getAuth?: HandlerConfig;
  createAuth?: HandlerConfig;
  updateAuth?: HandlerConfig;
  deleteAuth?: HandlerConfig;

  // Messages
  resourceName?: string;

  // Custom handlers
  beforeCreate?: (data: any, context: RequestContext) => Promise<any> | any;
  afterCreate?: (data: any, context: RequestContext) => Promise<void> | void;
  beforeUpdate?: (id: string | number, data: any, context: RequestContext) => Promise<any> | any;
  afterUpdate?: (data: any, context: RequestContext) => Promise<void> | void;
  beforeDelete?: (id: string | number, context: RequestContext) => Promise<void> | void;
  afterDelete?: (id: string | number, context: RequestContext) => Promise<void> | void;
}

/**
 * Create CRUD handlers for a resource
 */
export function createCrudHandlers<T>(service: CrudService<T>, config: CrudFactoryConfig = {}) {
  const resourceName = config.resourceName || "Resource";

  return {
    /**
     * GET /resource
     * List all resources with pagination
     */
    list: createPaginatedHandler(
      async (req: NextRequest, context: RequestContext) => {
        const url = new URL(req.url);
        const { page, limit } = parsePaginationQuery(url.searchParams);

        const userId = context.user?.id;
        const { items, total } = await service.findMany(page, limit, userId);

        const pagination = buildPaginationResult(items, total, page, limit).pagination;

        return { items, pagination };
      },
      config.listAuth || { optionalAuth: true }
    ),

    /**
     * GET /resource/:id
     * Get single resource by ID
     */
    getById: createGetOneHandler(
      async (req: NextRequest, context: RequestContext, params: any) => {
        const userId = context.user?.id;
        return await service.findById(params.id, userId);
      },
      {
        ...config.getAuth,
        notFoundMessage: `${resourceName} not found`,
      }
    ),

    /**
     * POST /resource
     * Create new resource
     */
    create: createPostHandler(
      async (req: NextRequest, context: RequestContext, validated: any) => {
        const body = validated || (await req.json());
        const userId = context.user?.id;

        // Before hook
        const processedData = config.beforeCreate ? await config.beforeCreate(body, context) : body;

        // Create
        const created = await service.create(processedData, userId);

        // After hook
        if (config.afterCreate) {
          await config.afterCreate(created, context);
        }

        return created;
      },
      {
        auth: true,
        ...config.createAuth,
        validateBody: config.createSchema,
      }
    ),

    /**
     * PUT /resource/:id
     * Update resource
     */
    update: createPutHandler(
      async (req: NextRequest, context: RequestContext, params: any) => {
        const body = await req.json();
        const userId = context.user?.id;

        // Before hook
        const processedData = config.beforeUpdate
          ? await config.beforeUpdate(params.id, body, context)
          : body;

        // Update
        const updated = await service.update(params.id, processedData, userId);

        if (!updated) {
          throw new Error(`${resourceName} not found`);
        }

        // After hook
        if (config.afterUpdate) {
          await config.afterUpdate(updated, context);
        }

        return updated;
      },
      {
        auth: true,
        ...config.updateAuth,
        validateBody: config.updateSchema,
      }
    ),

    /**
     * DELETE /resource/:id
     * Delete resource
     */
    delete: createDeleteHandler(
      async (req: NextRequest, context: RequestContext, params: any) => {
        const userId = context.user?.id;

        // Before hook
        if (config.beforeDelete) {
          await config.beforeDelete(params.id, context);
        }

        // Delete
        await service.delete(params.id, userId);

        // After hook
        if (config.afterDelete) {
          await config.afterDelete(params.id, context);
        }
      },
      {
        auth: true,
        ...config.deleteAuth,
      }
    ),
  };
}

/**
 * Example usage:
 *
 * // 1. Define your service
 * const threadService: CrudService<Thread> = {
 *   findMany: async (page, limit) => threadRepository.findMany(page, limit),
 *   findById: async (id) => threadRepository.findById(id),
 *   create: async (data) => threadRepository.create(data),
 *   update: async (id, data) => threadRepository.update(id, data),
 *   delete: async (id) => threadRepository.delete(id),
 * };
 *
 * // 2. Create CRUD handlers
 * const handlers = createCrudHandlers(threadService, {
 *   resourceName: 'Thread',
 *   createSchema: createThreadSchema,
 *   updateSchema: updateThreadSchema,
 *   createAuth: { roles: ['WRITER', 'ADMIN'] },
 *   afterCreate: async (thread, context) => {
 *     emit.threadPublished({ ...thread });
 *   },
 * });
 *
 * // 3. Use in routes
 * // app/api/v1/threads/route.ts
 * export const GET = handlers.list;
 * export const POST = handlers.create;
 *
 * // app/api/v1/threads/[id]/route.ts
 * export const GET = handlers.getById;
 * export const PUT = handlers.update;
 * export const DELETE = handlers.delete;
 */
