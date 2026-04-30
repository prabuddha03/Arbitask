import swaggerJsdoc from "swagger-jsdoc";
import { swaggerOptions } from "@/lib/swagger/config";

/**
 * Materializes the OpenAPI document from {@link swaggerOptions} (swagger-jsdoc scan).
 * No persisted entity — does not extend BaseRepository (no Prisma model).
 */
export class DocsRepository {
  getOpenApiSpecification(): object {
    return swaggerJsdoc(swaggerOptions) as object;
  }
}

export const docsRepository = new DocsRepository();
