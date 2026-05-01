import { createGetHandler, createPostHandler } from "@/lib/factories";
import { workspaceService } from "@/src/modules/workspaces/workspace.service";
import { createWorkspaceSchema } from "@/src/modules/workspaces/workspace.schema";

/**
 * @openapi
 * /api/workspaces:
 *   get:
 *     tags: [Workspaces]
 *     summary: List workspaces you belong to
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Workspaces with teams
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export const GET = createGetHandler(
  async (_req, context) => workspaceService.listForUser(String(context.user!.id)),
  { auth: true }
);

/**
 * @openapi
 * /api/workspaces:
 *   post:
 *     tags: [Workspaces]
 *     summary: Create a workspace (you become OWNER)
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created workspace
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export const POST = createPostHandler(
  async (_req, context, validated) =>
    workspaceService.create(validated!, String(context.user!.id)),
  { auth: true, validateBody: createWorkspaceSchema }
);
