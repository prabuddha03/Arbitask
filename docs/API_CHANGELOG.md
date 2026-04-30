# API Changelog — Arbitask

All notable changes to the Arbitask API are documented in this file.

Format: `[version] - YYYY-MM-DD`

---

## [Unreleased]

### Existing Endpoints (pre-changelog — documented retroactively)

These endpoints exist in the codebase as of the initial MVP. No formal versioning was applied.

| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/projects` | List user's projects / Create a project |
| PATCH/DELETE | `/api/projects/[projectId]` | Update / Delete a project |
| POST | `/api/tasks` | Create a task |
| PATCH/DELETE | `/api/tasks/[taskId]` | Update / Delete a task |
| GET/POST/DELETE | `/api/tasks/[taskId]/assignees` | Get / Add / Remove task assignees |
| GET/POST | `/api/notes` | List notes / Create a note |
| PATCH/DELETE | `/api/notes/[noteId]` | Update / Delete a note |
| GET/POST/DELETE | `/api/members` | List / Add / Remove project members |
| PATCH | `/api/members/[memberId]` | Update member role |
| POST | `/api/invites` | Generate invite link |
| GET/POST | `/api/invites/[token]` | Validate / Accept invite |
| ALL | `/api/auth/[...nextauth]` | Auth.js handler |

> **Note**: None of the above routes have Zod validation as of this changelog entry. Adding validation is tracked as a bootstrap task.
