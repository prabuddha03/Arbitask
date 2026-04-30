import type { NextRequest } from "next/server";
import { projectService } from "@/src/modules/projects/project.service";
import { createProjectSchema } from "@/src/modules/projects/project.schema";
import { withMiddleware, successResponse, createdResponse } from "@/lib/http";

/**
 * @openapi
 * /api/projects:
 *   get:
 *     tags: [Projects]
 *     summary: List all projects for the authenticated user
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Array of projects
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export function GET(req: NextRequest) {
  return withMiddleware(
    async (_r, context) => {
      const projects = await projectService.getProjectsForUser(String(context.user!.id));
      return successResponse(projects);
    },
    { auth: true }
  )(req);
}

/**
 * @openapi
 * /api/projects:
 *   post:
 *     tags: [Projects]
 *     summary: Create a new project
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectRequest'
 *     responses:
 *       201:
 *         description: Created project
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export function POST(req: NextRequest) {
  return withMiddleware(
    async (_r, context) => {
      const validated = createProjectSchema.parse((_r as any).__validatedBody);
      const project = await projectService.createProject(validated, String(context.user!.id));
      return createdResponse(project);
    },
    { auth: true, validateBody: createProjectSchema }
  )(req);
}
