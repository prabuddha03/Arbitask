import { createRawResponseHandler } from "@/lib/factories";
import { docsService } from "@/src/modules/docs/docs.service";

export const dynamic = "force-dynamic";

/**
 * @fileoverview Thin controller — OpenAPI JSON (`GET /api/docs`).
 * Spec fragments live in `src/modules/docs/docs.swagger.ts` and other module `*.swagger.ts` files.
 */
export const GET = createRawResponseHandler(async () => docsService.getOpenApiJsonResponse());
