import { createRawResponseHandler } from "@/lib/factories";
import { docsService } from "@/src/modules/docs/docs.service";
import shell from "./swagger-shell.module.css";

export const dynamic = "force-dynamic";

/**
 * @fileoverview Thin controller — Swagger UI HTML (`GET /api/docs/ui`).
 */
export const GET = createRawResponseHandler(async () => docsService.getSwaggerUiHtmlResponse(shell));
