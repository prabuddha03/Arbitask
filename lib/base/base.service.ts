import type { CrudService } from "../factories/crud.factory";
import { BaseRepository } from "./base.repository";

/**
 * Base Service Class
 * Implements standard CRUD operations expected by CrudFactory
 * Wraps BaseRepository and handles userId filtering automatically
 */
export class BaseService<T, CreateInput = any, UpdateInput = any, WhereInput = any>
  implements CrudService<T>
{
  /**
   * @param repository The repository instance
   * @param userIdField The field name for user ownership (default: 'userId')
   */
  constructor(
    protected readonly repository: BaseRepository<T, CreateInput, UpdateInput, WhereInput>,
    protected readonly userIdField: string = "userId"
  ) {}

  /**
   * Find many items with pagination and optional user filter
   */
  async findMany(
    page: number,
    limit: number,
    userId?: string
  ): Promise<{ items: T[]; total: number }> {
    const filter: any = {};

    if (userId) {
      filter[this.userIdField] = userId;
    }

    return this.repository.findMany(page, limit, filter);
  }

  /**
   * Find one item by ID with optional user filter
   */
  async findById(id: string | number, userId?: string): Promise<T | null> {
    const filter: any = {};

    if (userId) {
      filter[this.userIdField] = userId;
    }

    return this.repository.findById(id, userId ? filter : undefined);
  }

  /**
   * Create a new item
   * Automatically injects userId if provided
   */
  async create(data: any, userId?: string): Promise<T> {
    const createData = { ...data };

    if (userId) {
      createData[this.userIdField] = userId;
    }

    return this.repository.create(createData as CreateInput);
  }

  /**
   * Update an item
   * Enforces ownership check if userId is provided
   */
  async update(id: string | number, data: any, userId?: string): Promise<T | null> {
    const filter: any = {};

    if (userId) {
      filter[this.userIdField] = userId;
    }

    // Strip ID from update data to prevent Prisma errors
    const { id: _, ...updateData } = data;

    return this.repository.update(
      id,
      updateData as unknown as UpdateInput,
      userId ? filter : undefined
    );
  }

  /**
   * Delete an item
   * Enforces ownership check if userId is provided
   */
  async delete(id: string | number, userId?: string): Promise<void> {
    const filter: any = {};

    if (userId) {
      filter[this.userIdField] = userId;
    }

    await this.repository.delete(id, userId ? filter : undefined);
  }
}
