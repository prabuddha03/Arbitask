# Project Requirements — Arbitask

> Arbitask is a gamified project & idea management web app that converges Linear-style issue tracking, Clockify-style time tracking, and Lattice-style people ops into a single product. Turn raw ideas into shipped work with Kanban boards, timelines, notes, sprints, and an XP leveling system.

---

## Current State (v1 — MVP Shipped)

The following features are **already implemented and working** on the `main` branch. Agents MUST NOT rebuild these from scratch — extend and improve them.

- ✅ Google OAuth + demo credentials login (Auth.js v5)
- ✅ Route protection via middleware
- ✅ Project CRUD with emoji icon, status, priority, lead, dates
- ✅ Task CRUD with types (Design, Dev, Research, Content, Marketing, Other)
- ✅ Task status lifecycle: Idea → Planned → In Progress → Blocked → Done → Archived
- ✅ Kanban board (per-project and global) with drag-and-drop
- ✅ List view (per-project and global) with inline status editing
- ✅ Timeline / Gantt view (per-project and global)
- ✅ Notes with markdown editor, slash commands, formatting toolbar, fullscreen mode
- ✅ Shipped (Done) view
- ✅ Collaboration: invite links (7-day expiry), role-based access (Owner/Admin/Member/Viewer)
- ✅ Multi-assignee tasks with avatar chips on cards
- ✅ Gamification: XP system, 8 levels, 15 achievement badges
- ✅ Three theme modes: Dark, Light, Eye Protection
- ✅ Collapsible sidebar with icon-only mode
- ✅ Dashboard with XP bar, level progress, achievement badges, stats

---

## Functional Requirements

### Phase 1: PM + Time Tracking

> The Linear + Clockify convergence layer. All the features a product team needs to plan, execute, and account for work — in one tool.

#### 1.1 Issue & Task Management

- Users can create tasks with title, rich-text description, priority (Urgent/High/Medium/Low), custom labels, assignees, due date, and story point estimate
- Users can break any issue into sub-issues; parent issues show aggregate completion progress
- Users can mark issue dependencies: "blocked by" or "blocking" with cascading overdue alerts
- Admins can create issue templates for recurring work types: bug report, feature request, tech debt, incident
- Workspace-wide and project-scoped custom labels and tags for filtering and categorization
- Fully customizable status columns per team (not hardcoded)
- Multi-assignee support with per-person time-log contribution split
- Issue linking across projects with relationship types: duplicate, reference, follow-up
- Threaded comments per issue with @mentions, emoji reactions, and file attachments (R2)
- Immutable activity log per issue: full history of every field change (who, what, when)
- Workspace-level audit trail of all issue mutations for compliance
- Bulk actions: select multiple issues and bulk-update status, assignee, priority, or label
- Full-text search across title, description, and comments with filter chaining
- Natural language search: "show me all overdue bugs assigned to Priya"
- Saved filters / custom views: save any filter combination as a named view, shareable or personal
- Issue archiving: archive completed/cancelled issues without deletion, retrievable

#### 1.2 Project Management

- Projects group related issues with lead owner, status, start date, and target date
- Project emoji & icon picker for quick visual identification
- Project milestones: define key delivery checkpoints, track % completion per milestone
- Initiative layer: strategic grouping of projects under a theme or quarter goal for roadmap planning
- OKR linking: link initiatives and projects to quarterly OKRs, auto-compute % from issue throughput
- All views (Kanban, List, Timeline) available per-project and globally across all projects
- Shipped / Done view for retrospectives and proof-of-work reporting
- Embedded project notes & docs (markdown) for briefs, specs, decision logs
- External doc linking: attach Notion, Google Docs, Figma, or any URL to a project
- Client / guest read-only shareable project view with configurable section visibility
- Reusable project templates with pre-defined tasks, milestones, and workflow states
- Auto-computed delivery risk score (0–100) from overdue rate, velocity, and blocker count
- Scope creep detector: flags when logged time exceeds 130% of estimate or tasks added post-sprint-start

#### 1.3 Sprint & Cycle Management

- Sprint creation with name, start date, end date, and sprint goal statement
- Sprint backlog: dedicated view separating sprint issues from the full backlog with drag-to-add
- Auto-rollover: incomplete issues at sprint end are surfaced for rollover to next sprint
- Burn-down chart: remaining work vs ideal pace across sprint timeline
- Velocity tracking: historical story points completed per sprint over time
- Sprint planning view: side-by-side sprint board and backlog with per-member workload capacity
- Sprint goal tracking: progress ring showing % of goal-linked issues completed
- Sprint retrospective doc: structured template (What went well / What didn't / Improvements) linked to sprint data

#### 1.4 Time Tracking & Work Logging

- One-click start/stop timer on any task card; auto-logs duration on stop
- Manual time entry: log hours retroactively with date, duration, and description
- Built-in Pomodoro timer (25-min sessions) from any task; auto-logs time, break prompts after 4 sessions
- Billable / non-billable toggle per time entry; project-level default
- Full worklog per issue: who worked, when, duration, note — visible to team leads
- Estimate vs actual tracking: set hour/story-point estimate, compare against total logged time
- Weekly timesheet view: calendar-style grid of logged hours per day, editable before submission
- Timesheet submission: employee submits weekly for approval; locks on submit
- Timesheet approval workflow: manager approves/rejects with reason and full audit trail
- Concurrent timer guard: prevent two timers running simultaneously
- Configurable time-entry reminders if no entry by a set time of day
- Time audit report: weekly/monthly breakdown — billable vs non-billable, feature vs bug vs meeting
- Export timesheets as PDF or CSV for payroll/invoicing

#### 1.5 Analytics & Reporting

- CTO dashboard: team velocity, project health, workload distribution, delivery risk, open blockers
- Cycle time analytics: average time from creation to Done per team, sprint, and issue type
- Throughput chart: issues completed per week/sprint over time with trend line
- Workload distribution: per-member assigned hours vs capacity with over/under-allocation indicator
- Estimate accuracy report: how close each member's estimates are to actuals
- Project burnup chart: cumulative work completed vs scope added over project lifetime
- Time distribution report: hours breakdown by project, issue type, and team member
- Sprint comparison report: side-by-side metrics across sprints

#### 1.6 Collaboration & Communication

- @mentions in comments and descriptions with in-app + email notifications
- Real-time in-app notification center: assignments, mentions, status changes, approvals, blockers
- Configurable daily/weekly email digest of relevant activity
- Slack integration: send notifications, create issues from Slack messages, daily digest
- GitHub / GitLab integration: auto-link PRs to issues, auto-close on merge, branch name enforcement
- Webhook API: outbound webhooks for any issue event
- Review & approval workflow: issues can require approval before closing; rejected issues auto-reopen
- Async standup digest: auto-generated morning card per employee (yesterday, today, blockers)
- Threaded task discussion with file attachments, reactions, @mentions
- Async voice/screen notes in task comments for bug reports and design feedback

#### 1.7 Focus & Personal Productivity

- Focus filter (My Lens): one-click view of your assigned tasks due today, items blocking others, review needed — urgency-scored
- Focus mode: full-screen single-task view with description, comments, timer, worklog
- Smart next task: after completing a task, suggest the best next task based on priority, sprint, and unblocked dependencies
- Personal task inbox: private scratchpad for personal todos separate from team boards
- Keyboard-first navigation: full keyboard shortcut coverage
- Recurring task templates: auto-create tasks on schedule (daily, weekly, monthly) with pre-filled assignee and checklist

#### 1.8 Workspace & Access Control

- Multi-team workspace: Workspace → Teams → Projects → Issues hierarchy
- Granular role-based permissions: Owner, Admin, Member, Viewer
- Invite management: invite via email or link, set role on invite, revoke at any time
- Google OAuth login; SAML SSO for enterprise workspaces (Phase 1 stretch)
- Personal preferences: theme, notification settings, default view, timezone, working hours

### Phase 2: People Ops & Compensation

> The Lattice layer. Performance intelligence derived from real work data — not surveys.

#### 2.1 Team Structure & People Management

- Live org chart auto-generated from roles and team assignments
- Employee profile page: role, team, XP level, skill tags, active issues, velocity, estimate accuracy, hours, badges
- Team configuration: named teams with lead, members, description; each team owns its backlog/sprint cadence
- Cross-team issue routing with handoff notes and preserved context
- Headcount planning: open roles, target headcount per team, planned hire dates
- Hiring pipeline tracker as issues: Application → Interview → Offer → Hired
- Onboarding task templates auto-assigned on join
- Offboarding workflow checklist
- Working hours configuration per employee feeding capacity calculations
- Holiday calendar affecting sprint velocity and capacity planning

#### 2.2 Attendance & Leave

- Attendance tracking from first worklog entry or manual check-in
- Monthly attendance report: present, absent, on leave, late
- Leave application (annual, sick, unpaid, comp-off) from the same interface
- Leave approval workflow: manager approves/rejects, blocks capacity in workload balancer
- Leave balance tracker with HR-configured entitlements per role
- Overtime detection: alerts when hours exceed weekly limit
- Absent alerts to HR/manager if no worklog by configured time
- Multi-region timezone support for attendance

#### 2.3 Performance Scoring

- Issue-level contribution score: story points × quality multiplier × speed bonus
- Quality multiplier: re-opened = penalty, passed review first time = bonus
- Speed bonus for completing under estimate
- Monthly aggregate performance score: issue scores + estimate accuracy + collaboration + attendance
- Collaboration score: peer recognitions, review approvals, @mention response rate
- Consistency bonus for maintaining work streaks
- Sprint performance snapshot per employee
- Rolling 6-month performance trend chart
- Optional team performance leaderboard (CTO-toggled)
- Transparent scoring: every employee sees their score and the formula

#### 2.4 Compensation & Bonus Intelligence

- Compensation band configuration per role and level
- Performance-to-band mapping: live view for HR and CTO
- Bonus eligibility report: score, rank, percentile, recommended tier
- Configurable bonus tier formula
- Pay-per-output modeling for contract/gig roles
- Immutable compensation history log
- Salary review triggers when score exceeds band ceiling for N sprints
- Export compensation report as CSV

#### 2.5 Appraisal & Reviews

- Appraisal cycle management: quarterly, half-yearly, or annual
- Auto-generated appraisal report from scores, attendance, peer recognition, 1:1 notes
- AI performance narrative drafting from data (HR edits before sharing)
- Manager qualitative review layer
- Employee self-review linked to appraisal cycle
- 360-degree peer review with anonymized responses
- Structured 1:1 meeting notes linked to appraisal period
- PIP (Performance Improvement Plan) tracking as structured issues
- Promotion recommendation workflow

#### 2.6 AI-Powered People Intelligence

- Worklog summarizer: AI weekly summary per employee for manager/CTO digest
- Performance narrative generator for appraisals
- Sprint retrospective AI: auto-generated from data
- Anomaly detection: burnout risk (0 logs 3+ days), quality drops (re-opened spikes), risk signals (hours 3× estimate)
- Skill gap analysis: compare team skills against open roles and project demands
- Team mood aggregation: optional daily mood check-in, anonymized, CTO alerted on overload

#### 2.7 HR Document & Compliance

- Secure per-employee document vault: offer letters, contracts, IDs, reviews (encrypted at rest, R2)
- Signed document tracking per employee
- HR compliance checklist per year per employee
- Configurable data retention policies (GDPR-aware)
- Role-based data visibility: salary visible only to HR/CTO, performance to direct manager+

---

## Non-Functional Requirements

### Performance
- API response time < 200ms at p95
- Page load (LCP) < 2.5s on 3G
- Client-side navigation < 100ms (App Router soft nav)
- Prisma queries must avoid N+1 patterns — use `include` and `select`

### Security
- All API routes validate input with Zod before touching the database
- Never put secrets in code — use environment variables exclusively
- CSRF protection via Auth.js
- Rate limiting on auth and invite endpoints
- Row-level authorization: every API call checks project membership and role
- File uploads validated for type, size (max 100MB), and scanned before R2 storage

### Reliability
- Sentry for error tracking: every unhandled exception and rejected promise captured
- Sentry source maps uploaded on build for readable stack traces
- Structured error responses: `{ error: string, code: string }` on all API errors
- Database migrations via Prisma Migrate (never `db push` in production)

### Observability
- Sentry performance monitoring: transaction traces on all API routes
- API documentation via Postman: every endpoint documented with request/response examples
- Postman collection exported to `docs/arbitask-api.postman_collection.json`
- API changelog maintained in `docs/API_CHANGELOG.md`

### Testing
- Every utility function has a Vitest unit test
- Every API route handler has a Vitest integration test (mock Prisma)
- Every Zod schema has validation tests (valid + invalid inputs)
- Every user-visible flow has a Browserbase E2E test
- Coverage target: 80%+ for `lib/` and `app/api/`

### Accessibility
- All interactive elements have ARIA labels
- Keyboard navigation for all views
- Color contrast ratio ≥ 4.5:1 (WCAG AA)
- Focus indicators on all interactive elements

### Code Quality
- TypeScript strict mode enabled
- No `any` types — use proper typing throughout
- ESLint + Prettier enforced
- Every new file gets a corresponding test file
- Commit messages follow conventional commits: `feat(scope): description [linear:ID]`

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 15, App Router, Server Actions, Server Components preferred |
| Language | TypeScript 5 (strict mode) |
| Auth | Auth.js v5 (Google OAuth + Credentials) |
| Database | PostgreSQL via Prisma ORM (local and production) |
| File Storage | Cloudflare R2 (attachments, documents, screen recordings) |
| Deployment | DigitalOcean App Platform |
| Error Tracking | Sentry (errors + performance) |
| Unit/Integration Tests | Vitest |
| E2E Tests | Browserbase (cloud browsers, no local instance) |
| API Documentation | Postman (collection + environment exported to repo) |
| Styling | CSS Modules + CSS custom properties following DESIGN.md |
| Fonts | Sofia Sans (Google Fonts) — substitute for MarkForMC per DESIGN.md |
| Input Validation | Zod on all API routes |

---

## Git Branching Strategy

- **`main`** — production-ready code only; protected branch
- **`dev`** — integration branch; all feature PRs target `dev`
- **`feat/<feature-name>`** — feature branches created from `dev`
- **`fix/<bug-description>`** — bugfix branches created from `dev`
- **`hotfix/<description>`** — critical fixes branched from `main`, merged back to both `main` and `dev`

**Rules:**
- Never push directly to `main` or `dev`
- All changes go through PRs with at least one review
- Squash merge to `dev`; merge commit from `dev` to `main` on release

---

## Out of Scope (for now)

- Mobile apps (iOS/Android) — Phase 1.8 stretch goal, not blocking
- Desktop native app (macOS/Windows)
- SAML SSO — enterprise feature, Phase 1 stretch
- Payroll integration — Phase 3+
- MCP + AI Agent Workforce — Phase 3+
- Full Work OS with payroll — Phase 4

---

## Known Pain Points & Technical Debt (to fix first)

> These should be the first issues created in Linear before any new features.

1. **No Zod validation on any API route** — all routes accept raw input without validation
2. **No Sentry integration** — zero error tracking, zero performance monitoring
3. **No tests at all** — zero unit, integration, or E2E tests exist
4. **Inline CSS styles everywhere** — no CSS modules, no design system compliance; current UI uses warm orange theme with Outfit font, not the Mastercard-inspired DESIGN.md system
5. **Legacy `/src/` directory** — contains old Vite SPA JSX files (`src/components/`, `src/constants/`, `src/utils/`, `src/styles/`); should be cleaned up or migrated
6. **Postgres parity in dev** — use a real PostgreSQL instance locally (or Docker) so dev matches production; keep schema and queries portable to PostgreSQL only
7. **No input sanitization** — markdown rendering could be XSS-vulnerable
8. **No rate limiting** — auth and invite endpoints are unprotected
9. **Hardcoded demo credentials in source** — `demo@arbitask.app` / `demo1234` is in `lib/auth.ts`
10. **No API documentation** — no Postman collection, no OpenAPI spec
11. **No `.env.local.example` for new env vars** — R2, Sentry DSN, Browserbase keys missing
12. **No ESLint/Prettier config** — no code formatting enforcement
13. **No conventional commits** — commit messages are unstructured
14. **No dev branch** — all development has been on `main`
