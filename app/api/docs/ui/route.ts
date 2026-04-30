import { NextResponse } from "next/server";

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Arbitask API Docs</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
  <style>
    body { margin: 0; background: #0f0f0f; }
    .swagger-ui .topbar { background: #1a1a1a; border-bottom: 1px solid #2a2a2a; }
    .swagger-ui .topbar .download-url-wrapper { display: none; }
    .swagger-ui .info .title { color: #f97316; }
    .swagger-ui .info { margin: 20px 0; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: "/api/docs",
      dom_id: "#swagger-ui",
      deepLinking: true,
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: "BaseLayout",
      persistAuthorization: true,
    });
  </script>
</body>
</html>`;

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
export async function GET() {
  return new NextResponse(HTML, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
