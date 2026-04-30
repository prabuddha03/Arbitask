/**
 * @fileoverview Swagger/OpenAPI Configuration for Arbitask
 */

import path from "node:path";
import type { OAS3Options } from "swagger-jsdoc";

// Scan for @openapi JSDoc blocks in:
// 1. App Router API routes
// 2. Module swagger files
// 3. Legacy swagger route docs (lib/swagger/routes)
const apiDocGlobs = [
  path.join(process.cwd(), "app/api/**/*.{ts,tsx,js,jsx,mjs,cjs}"),
  path.join(process.cwd(), "src/modules/**/*.{ts,tsx,js,jsx}"),
  path.join(process.cwd(), "lib/swagger/routes/**/*.{ts,js}"),
];

export const swaggerOptions: OAS3Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Arbitask API Documentation",
      version: "1.0.0",
      description:
        "Comprehensive API documentation for Arbitask — a gamified project & idea management platform. " +
        "Provides endpoints for projects, tasks, notes, members, invites, gamification, and more.",
      contact: {
        name: "Arbitask Team",
      },
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        description: "API Server",
      },
    ],
    components: {
      securitySchemes: {
        CookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "authjs.session-token",
          description: "Auth.js v5 session cookie (set automatically on login)",
        },
      },
      schemas: {
        // ============================================
        // Common Schemas
        // ============================================
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  example: "VALIDATION_ERROR",
                },
                message: {
                  type: "string",
                  example: "Invalid request data",
                },
                details: {
                  type: "object",
                  description: "Field-level validation errors",
                },
                requestId: {
                  type: "string",
                  example: "req_abc123",
                },
              },
              required: ["code", "message"],
            },
          },
          required: ["success", "error"],
        },

        SuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              description: "Response data (varies by endpoint)",
            },
            message: {
              type: "string",
              example: "Resource created successfully",
            },
            meta: {
              type: "object",
              description: "Additional metadata (e.g., pagination)",
            },
          },
          required: ["success", "data"],
        },

        Pagination: {
          type: "object",
          properties: {
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 20 },
            total: { type: "integer", example: 42 },
            totalPages: { type: "integer", example: 3 },
            hasMore: { type: "boolean", example: true },
            hasPrevious: { type: "boolean", example: false },
          },
        },

        // ============================================
        // User Schema
        // ============================================
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "User ID",
              example: "clx1abc123",
            },
            name: {
              type: "string",
              nullable: true,
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              nullable: true,
              example: "john@example.com",
            },
            image: {
              type: "string",
              format: "uri",
              nullable: true,
              example: "https://lh3.googleusercontent.com/a/photo",
            },
          },
        },

        // ============================================
        // Project Schemas
        // ============================================
        Project: {
          type: "object",
          properties: {
            id: { type: "string", example: "clx1abc123" },
            name: { type: "string", example: "Arbitask MVP" },
            description: { type: "string", nullable: true, example: "Main product project" },
            colorId: { type: "string", example: "rocket", description: "Emoji icon identifier" },
            status: {
              type: "string",
              enum: ["backlog", "in_progress", "on_track", "at_risk", "completed", "cancelled"],
              example: "in_progress",
            },
            priority: {
              type: "string",
              enum: ["no_priority", "urgent", "high", "medium", "low"],
              example: "high",
            },
            leadName: { type: "string", nullable: true, example: "Prabuddha" },
            startDate: { type: "string", format: "date-time", nullable: true },
            targetDate: { type: "string", format: "date-time", nullable: true },
            ownerId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        ProjectCreateInput: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "New Project", minLength: 1, maxLength: 100 },
            description: { type: "string", example: "Project description" },
            colorId: { type: "string", example: "rocket" },
            status: { type: "string", example: "backlog" },
            priority: { type: "string", example: "no_priority" },
            leadName: { type: "string", example: "Team Lead" },
            startDate: { type: "string", format: "date-time" },
            targetDate: { type: "string", format: "date-time" },
          },
        },
        ProjectUpdateInput: {
          type: "object",
          properties: {
            name: { type: "string", example: "Updated Project Name" },
            description: { type: "string" },
            colorId: { type: "string" },
            status: { type: "string" },
            priority: { type: "string" },
            leadName: { type: "string" },
            startDate: { type: "string", format: "date-time" },
            targetDate: { type: "string", format: "date-time" },
          },
        },

        // ============================================
        // Task Schemas
        // ============================================
        Task: {
          type: "object",
          properties: {
            id: { type: "string", example: "clx1def456" },
            title: { type: "string", example: "Implement login flow" },
            description: { type: "string", nullable: true },
            type: {
              type: "string",
              enum: ["design", "dev", "research", "content", "marketing", "other"],
              example: "dev",
            },
            status: {
              type: "string",
              enum: ["idea", "planned", "in_progress", "blocked", "done", "archived"],
              example: "in_progress",
            },
            startDate: { type: "string", format: "date-time", nullable: true },
            dueDate: { type: "string", format: "date-time", nullable: true },
            projectId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        TaskCreateInput: {
          type: "object",
          required: ["title", "projectId"],
          properties: {
            title: { type: "string", example: "New Task" },
            description: { type: "string" },
            type: { type: "string", example: "dev" },
            status: { type: "string", example: "idea" },
            startDate: { type: "string", format: "date-time" },
            dueDate: { type: "string", format: "date-time" },
            projectId: { type: "string" },
          },
        },

        // ============================================
        // Note Schemas
        // ============================================
        Note: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string", example: "Sprint 1 Retro" },
            content: { type: "string", example: "## What went well\n- Fast iteration" },
            projectId: { type: "string", nullable: true },
            userId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // ============================================
        // Member Schemas
        // ============================================
        ProjectMember: {
          type: "object",
          properties: {
            id: { type: "string" },
            userId: { type: "string" },
            projectId: { type: "string" },
            role: {
              type: "string",
              enum: ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
              example: "MEMBER",
            },
            user: { $ref: "#/components/schemas/User" },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        // ============================================
        // Invite Schemas
        // ============================================
        Invite: {
          type: "object",
          properties: {
            id: { type: "string" },
            token: { type: "string" },
            projectId: { type: "string" },
            role: {
              type: "string",
              enum: ["ADMIN", "MEMBER", "VIEWER"],
              example: "MEMBER",
            },
            status: {
              type: "string",
              enum: ["PENDING", "ACCEPTED", "EXPIRED"],
              example: "PENDING",
            },
            expiresAt: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        // ============================================
        // Gamification Schemas
        // ============================================
        XPSummary: {
          type: "object",
          properties: {
            totalXP: { type: "integer", example: 450 },
            level: { type: "integer", example: 3 },
            levelTitle: { type: "string", example: "🏗️ Builder" },
            nextLevelXP: { type: "integer", example: 500 },
            achievements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", example: "first_blood" },
                  emoji: { type: "string", example: "⚔️" },
                  title: { type: "string", example: "First Blood" },
                  description: { type: "string", example: "Complete your first task" },
                  unlocked: { type: "boolean", example: true },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Auth",
        description: "Authentication endpoints (Auth.js v5)",
      },
      {
        name: "Projects",
        description: "Project CRUD and management endpoints",
      },
      {
        name: "Tasks",
        description: "Task CRUD, status updates, and filtering",
      },
      {
        name: "Notes",
        description: "Markdown note creation and management",
      },
      {
        name: "Members",
        description: "Project member management and role assignment",
      },
      {
        name: "Invites",
        description: "Invite link generation and acceptance",
      },
      {
        name: "Assignees",
        description: "Task assignee management (multi-assignee)",
      },
      {
        name: "Gamification",
        description: "XP, levels, achievements, and leaderboard",
      },
      {
        name: "Health",
        description: "Health check and status endpoints",
      },
    ],
  },
  apis: apiDocGlobs,
};

export default swaggerOptions;
