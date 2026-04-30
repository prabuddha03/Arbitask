/**
 * @openapi
 * /api/docs:
 *   get:
 *     tags:
 *       - Documentation
 *     summary: OpenAPI specification (JSON)
 *     description: Returns the full OpenAPI 3.0 specification for the Arbitask API. Import into Postman, Insomnia, or any OpenAPI-compatible tool. Includes all module `@openapi` definitions scanned from `app/api`, `src/modules`, and `lib/swagger/routes`.
 *     responses:
 *       200:
 *         description: OpenAPI specification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */

/**
 * @openapi
 * /api/docs/ui:
 *   get:
 *     tags:
 *       - Documentation
 *     summary: Swagger UI — interactive API explorer
 *     description: Opens the Swagger UI for exploring and testing all Arbitask API endpoints.
 *     responses:
 *       200:
 *         description: Swagger UI HTML page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */

/** Ensures this file is a valid module for tooling; OpenAPI blocks above are picked up by swagger-jsdoc. */
export const docsSwaggerModule = true;
