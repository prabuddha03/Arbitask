/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPaginationParams } from "../utils/pagination";

/**
 * Generic Prisma Delegate Interface
 * Defines the standard methods available on all Prisma models
 */
export interface PrismaDelegate<T, CreateInput, UpdateInput, WhereInput> {
  findMany(args?: {
    where?: WhereInput;
    skip?: number;
    take?: number;
    orderBy?: any;
    include?: any;
    select?: any;
  }): Promise<T[]>;

  findUnique(args: {
    where: WhereInput | { id: string | number };
    include?: any;
    select?: any;
  }): Promise<T | null>;

  findFirst(args: { where: WhereInput; include?: any; select?: any }): Promise<T | null>;

  create(args: { data: CreateInput; include?: any; select?: any }): Promise<T>;

  update(args: {
    where: WhereInput | { id: string | number };
    data: UpdateInput;
    include?: any;
    select?: any;
  }): Promise<T>;

  delete(args: {
    where: WhereInput | { id: string | number };
    include?: any;
    select?: any;
  }): Promise<T>;

  count(args?: { where?: WhereInput }): Promise<number>;
}

/**
 * Base Repository Class
 * Provides generic CRUD operations for any Prisma model
 */
export class BaseRepository<T, CreateInput = any, UpdateInput = any, WhereInput = any> {
  constructor(protected readonly model: PrismaDelegate<T, CreateInput, UpdateInput, WhereInput>) {}

  /**
   * Find many items with pagination and filters
   */
  async findMany(
    page: number,
    limit: number,
    filter?: WhereInput,
    include?: any,
    orderBy?: any
  ): Promise<{ items: T[]; total: number }> {
    const { skip, take } = getPaginationParams(page, limit);

    const [items, total] = await Promise.all([
      this.model.findMany({
        where: filter,
        skip,
        take,
        include,
        orderBy: orderBy,
      }),
      this.model.count({ where: filter }),
    ]);

    return { items, total };
  }

  /**
   * Find one item by ID
   * Uses findFirst if filter is provided (for ownership checks), findUnique otherwise
   */
  async findById(id: string | number, filter?: WhereInput, include?: any): Promise<T | null> {
    if (filter) {
      return this.model.findFirst({
        where: { ...filter, id } as any,
        include,
      });
    }

    return this.model.findUnique({
      where: { id } as any,
      include,
    });
  }

  /**
   * Find one item by generic filter
   */
  async findOne(filter: WhereInput, include?: any): Promise<T | null> {
    return this.model.findFirst({
      where: filter,
      include,
    });
  }

  /**
   * Create a new item
   */
  async create(data: CreateInput, include?: any): Promise<T> {
    return this.model.create({
      data,
      include,
    });
  }

  /**
   * Update an existing item
   */
  async update(
    id: string | number,
    data: UpdateInput,
    filter?: WhereInput,
    include?: any
  ): Promise<T | null> {
    // Check existence first if filter is provided (for security/ownership)
    if (filter) {
      const exists = await this.findById(id, filter);
      if (!exists) return null;
    }

    return this.model.update({
      where: { id } as any,
      data,
      include,
    });
  }

  /**
   * Delete an item
   */
  async delete(id: string | number, filter?: WhereInput): Promise<void> {
    // Check existence first if filter is provided
    if (filter) {
      const exists = await this.findById(id, filter);
      if (!exists) {
        throw new Error("Record not found or access denied");
      }
    }

    await this.model.delete({
      where: { id } as any,
    });
  }

  /**
   * Count items matching filter
   */
  async count(filter?: WhereInput): Promise<number> {
    return this.model.count({ where: filter });
  }
}
