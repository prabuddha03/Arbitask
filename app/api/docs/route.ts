import swaggerJsdoc from "swagger-jsdoc";
import { swaggerOptions } from "@/lib/swagger/config";
import { NextResponse } from "next/server";

/**
 * @openapi
 * /api/docs:
 *   get:
 *     tags:
 *       - Documentation
 *     summary: OpenAPI specification (JSON)
 *     description: Returns the full OpenAPI 3.0 specification for the Arbitask API. Import into Postman, Insomnia, or any OpenAPI-compatible tool.
 *     responses:
 *       200:
 *         description: OpenAPI specification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
export async function GET() {
  const spec = swaggerJsdoc(swaggerOptions);
  return NextResponse.json(spec, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300",
    },
  });
}
