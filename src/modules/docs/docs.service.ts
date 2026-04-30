import { NextResponse } from "next/server";
import { docsRepository } from "./docs.repository";

/** CSS module class map for the Swagger UI shell (see `app/api/docs/ui/swagger-shell.module.css`). */
export type SwaggerUiShellClasses = Readonly<Record<string, string>>;

export class DocsService {
  getOpenApiJsonResponse(): NextResponse {
    const spec = docsRepository.getOpenApiSpecification();
    return NextResponse.json(spec, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300",
      },
    });
  }

  getSwaggerUiHtmlResponse(shell: SwaggerUiShellClasses): NextResponse {
    const pageClass = shell.page;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Arbitask API Docs</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Sofia+Sans:ital,wght@0,450;0,500;1,450&display=swap" rel="stylesheet" />
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
</head>
<body class="${pageClass}">
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

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}

export const docsService = new DocsService();
