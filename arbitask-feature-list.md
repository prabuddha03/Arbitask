# Arbitask — Feature List
## Phase 1 & Phase 2

---

## Phase 1: PM + Time Tracking
> The Linear + Clockify convergence layer. Every feature a product team needs to plan, execute, and account for work — in one tool.

---

### 1.1 Issue & Task Management

| Feature | Description |
|---|---|
| Issue creation | Create tasks with title, description, priority, labels, assignee, due date, and story point estimate |
| Sub-issues | Break any issue into child tasks. Parent issue shows aggregate completion progress |
| Issue dependencies | Mark issues as "blocked by" or "blocking" other issues. Cascading overdue alerts propagate upstream |
| Issue templates | Pre-defined issue structures for recurring work types: bug report, feature request, tech debt, incident |
| Custom labels & tags | Workspace-wide and project-scoped labels for filtering and categorization |
| Issue status lifecycle | Fully customizable status columns per team: e.g. Backlog → Todo → In Progress → Review → Done |
| Issue priority levels | Four levels: Urgent, High, Medium, Low. Sortable and filterable across all views |
| Multi-assignee support | Assign multiple team members to one issue. Time logs split contribution per person |
| Issue linking | Link related issues across projects with a relationship type: duplicate, reference, follow-up |
| Issue comments & threads | Threaded discussion on each issue with @mentions, reactions, and file attachments |
| Activity log per issue | Full immutable history of every field change: who changed what and when |
| Issue changelog / audit trail | Workspace-level audit log of all issue mutations. Used for post-mortems and compliance |
| Bulk actions | Select multiple issues to bulk-update status, assignee, priority, or label |
| Issue search | Full-text search across title, description, and comments with filter chaining |
| Natural language search | Query issues in plain English: "show me all overdue bugs assigned to Priya" |
| Saved filters / custom views | Save any filter combination as a named view. Share views with team or keep personal |
| Issue archiving | Archive completed or cancelled issues without deletion. Retrievable at any time |

---

### 1.2 Project Management

| Feature | Description |
|---|---|
| Projects | Group related issues under a project with lead owner, status, start date, and target date |
| Project emoji & icon picker | Visual identity per project for quick recognition in sidebar and views |
| Project milestones | Define key delivery checkpoints within a project. Track % completion toward each milestone |
| Initiative layer | Strategic grouping of multiple projects under a theme or quarter goal. Used for roadmap planning |
| OKR linking | Link initiatives and projects to quarterly OKRs. Auto-compute OKR % completion from issue throughput |
| Kanban board view | Drag-and-drop cards across status columns. Available per-project and globally across all projects |
| List view | Sortable, filterable table of issues with inline status editing. Global view includes project column |
| Timeline / Gantt view | Bar chart of tasks with dates. Visualize project schedule and milestone overlap |
| Global cross-project views | Kanban, list, and timeline views spanning all projects — for CTO-level visibility |
| Shipped / Done view | Dedicated view of all completed tasks. Used for retrospectives and proof-of-work reporting |
| Project notes & docs | Embedded markdown editor per project for briefs, specs, and decision logs |
| External doc linking | Link Notion, Google Docs, Figma, or any URL inside a project for context |
| Client / guest view | Read-only shareable project view for external stakeholders. Configurable visibility per section |
| Project templates | Reusable project structures with pre-defined tasks, milestones, and workflow states |
| Delivery risk score | Auto-computed 0–100 risk score per project from overdue rate, velocity vs target, and blocker count |
| Scope creep detector | Flags when logged time exceeds 130% of estimate or sub-tasks are added after sprint start |

---

### 1.3 Sprint & Cycle Management

| Feature | Description |
|---|---|
| Sprint creation | Define time-boxed sprints with name, start date, end date, and a sprint goal statement |
| Sprint backlog | Dedicated view separating sprint issues from the full backlog. Drag-to-add issues to sprint |
| Auto-rollover | Incomplete issues at sprint end are automatically surfaced for rollover into the next sprint |
| Burn-down chart | Visual progress of remaining work vs ideal pace across the sprint timeline |
| Velocity tracking | Historical sprint velocity chart showing story points completed per sprint over time |
| Sprint planning view | Side-by-side: sprint board and backlog with workload capacity per member visible |
| Sprint goal tracking | Sprint goal statement shown on board. % of goal-linked issues completed shown as progress ring |
| Sprint retrospective doc | Structured template for What went well / What didn't / Improvements. Linked to sprint data |

---

### 1.4 Time Tracking & Work Logging

| Feature | Description |
|---|---|
| Timer per issue | One-click start/stop timer on any task card. Auto-logs duration to the issue worklog on stop |
| Manual time entry | Log hours retroactively with date, duration, and a description note |
| Pomodoro timer | Built-in 25-min focus session from any task. Auto-logs time on session end. Break prompts after 4 sessions |
| Billable / non-billable toggle | Mark each time entry as billable or non-billable. Project-level default setting |
| Worklog per issue | Full log on each issue: who worked, when, for how long, with a note. Visible to team leads |
| Estimate vs actual tracking | Set hour/story-point estimate at creation. Compare against total logged time per issue and per sprint |
| Weekly timesheet view | Calendar-style grid showing each employee's logged hours per day. Editable before submission |
| Timesheet submission | Employee submits weekly timesheet for approval. Submitted timesheets lock for editing |
| Timesheet approval workflow | Manager or CTO approves or rejects submitted timesheets with a reason. Full audit trail |
| Concurrent timer guard | Prevents two timers running simultaneously. Prompts user to stop active timer before starting new one |
| Time entry reminders | Configurable reminders to log time if no entry exists by a set time of day |
| Time audit report | Weekly / monthly breakdown per employee: billable vs non-billable, feature vs bug vs meeting vs overhead |
| Export timesheets | Export timesheet data as PDF or CSV for payroll processing or client invoicing |

---

### 1.5 Analytics & Reporting

| Feature | Description |
|---|---|
| CTO dashboard | Command-center view: team velocity, project health, workload distribution, delivery risk, open blockers |
| Cycle time analytics | Average time from issue creation to Done per team, per sprint, and per issue type |
| Throughput chart | Issues completed per week/sprint over time. Trend line shows team productivity trajectory |
| Workload distribution | Per-member assigned hours vs capacity this sprint. Visual indicator of over/under-allocation |
| Estimate accuracy report | How close each team member's estimates are to actuals. Improves planning over time |
| Project burnup chart | Cumulative work completed vs scope added over a project's lifetime. Scope creep made visible |
| Time distribution report | Where hours are going: breakdown by project, issue type, and team member |
| Sprint comparison report | Side-by-side metrics across sprints: velocity, completion rate, rollover count, scope changes |

---

### 1.6 Collaboration & Communication

| Feature | Description |
|---|---|
| @mentions | Tag any team member in a comment or description. Triggers an in-app and email notification |
| In-app notifications | Real-time notification center: assignments, mentions, status changes, approvals, blocker alerts |
| Email digest | Daily or weekly summary email of activity relevant to the user. Frequency configurable |
| Slack integration | Send notifications to Slack channels. Create issues from Slack messages. Daily digest to Slack |
| GitHub / GitLab integration | Auto-link pull requests to issues. Auto-close issues on PR merge. Branch name convention enforcement |
| Webhook API | Outbound webhooks for any issue event: status change, assignment, comment, worklog entry |
| Review & approval workflow | Issues can require approval before closing. Reviewer notified; rejected issues auto-reopen with reason |
| Async standup digest | Auto-generated morning card per employee: yesterday's work, today's tasks, current blockers |
| Task discussion threads | Threaded comments on issues with file attachments, emoji reactions, and @mentions |
| Async voice/screen notes | Record a short screen + voice note in a task comment. Useful for bug reports and design feedback |

---

### 1.7 Focus & Personal Productivity

| Feature | Description |
|---|---|
| Focus filter — My Lens | One-click view: your assigned tasks due today + tasks you're blocking others on + items needing your review. Urgency-scored |
| Focus mode | Full-screen single-task view with description, comments, timer, and worklog. Everything else hidden |
| Smart next task | After completing a task, suggests the best next task based on priority, sprint, and dependencies unblocked |
| Personal task inbox | Private scratchpad for todos and notes that don't belong on team boards. Separate from company tasks |
| Keyboard-first navigation | Full keyboard shortcut coverage for issue creation, navigation, status changes, and timer control |
| Recurring task templates | Tasks auto-create on schedule: daily, weekly, monthly. Pre-filled with assignee, checklist, and estimate |

---

### 1.8 Workspace & Access Control

| Feature | Description |
|---|---|
| Multi-team workspace | Workspace → Teams → Projects → Issues hierarchy. Each team has its own backlog, sprints, and workflow states |
| Role-based permissions | Roles: Owner, Admin, Member, Viewer. Granular control over who can create, edit, assign, and approve |
| Invite management | Invite via email or shareable link. Set role on invite. Revoke access at any time |
| SSO / OAuth login | Google OAuth login. SAML SSO for enterprise workspaces |
| Personal preferences | Each user configures: theme, notification settings, default view, timezone, and working hours |
| Theming | Three modes: Dark, Light, Eye Protection (warm sepia). Per-user setting |
| Mobile apps | iOS and Android apps with full issue management, timer, and notification support |
| Desktop app | macOS and Windows native app with offline draft support |

---
---

## Phase 2: People Ops & Compensation
> The Lattice layer. Performance intelligence derived from real work data — not surveys. Built for HR, managers, and leadership.

---

### 2.1 Team Structure & People Management

| Feature | Description |
|---|---|
| Org chart (live from roles) | Auto-generated org chart from workspace member roles and team assignments. Clickable nodes show profile, load, and active issues |
| Employee profile page | Per-member page: role, team, XP level, skill tags, active issues, velocity, estimate accuracy, hours this month, badges |
| Team configuration | Create named teams with a lead, members, and a team description. Each team owns its backlog and sprint cadence |
| Cross-team issue routing | Route issues from one team to another with a handoff note. Origin context preserved. Cross-team dependencies tracked |
| Headcount planning | Track open roles, target headcount per team, and planned hire dates. Visible alongside current team workload |
| Hiring pipeline tracker | Candidate pipeline as issues: Application → Interview → Offer → Hired. Linked to the role it fills |
| Onboarding task templates | Auto-assign onboarding checklist to new members on join: environment setup, handbook reading, first issue |
| Offboarding workflow | Offboarding checklist: access revocation, knowledge transfer tasks, final timesheet approval, document archiving |
| Working hours configuration | HR sets expected hours/week per employee. Feeds capacity calculation in workload balancer and overtime detection |
| Holiday calendar | HR configures national and company holidays. Sprint velocity and capacity planning auto-adjust for holiday weeks |

---

### 2.2 Attendance & Leave

| Feature | Description |
|---|---|
| Attendance tracking | First worklog entry of the day marks attendance. Optional manual check-in for hybrid or office-first teams |
| Attendance report | Monthly per-employee attendance log: days present, absent, on leave, and late check-ins |
| Leave application | Employee applies for leave from the same interface. Specifies type: annual, sick, unpaid, comp-off |
| Leave approval workflow | Manager approves or rejects leave requests with reason. Approved leave blocks capacity in the workload balancer |
| Leave balance tracker | HR-configured leave entitlements per role. Running balance visible to employee and manager |
| Overtime tracking | Auto-detects when logged hours exceed configured weekly limit. Alerts HR and employee. Overtime rate configurable |
| Absent alert | HR and manager notified if an employee has no worklog entry by a configured time of day |
| Multi-region timezone support | Each employee has a configured timezone. Attendance and working hours respect local time |

---

### 2.3 Performance Scoring

| Feature | Description |
|---|---|
| Issue-level contribution score | Each completed issue generates a score: story points × quality multiplier × speed bonus. Multi-assignee issues split by % time logged per person |
| Quality multiplier | Score modifier based on issue quality: re-opened after Done = penalty, passed review first time = bonus |
| Speed bonus | Bonus score for completing an issue under its time estimate. Scaled proportionally to how much under |
| Monthly performance score | Aggregate of all issue scores in the period + estimate accuracy score + collaboration score + attendance consistency |
| Estimate accuracy score | Measures how closely an employee's estimates match actuals over time. Improves as a personal metric |
| Collaboration score | Derived from: peer recognitions given and received, review approvals completed, @mention response rate |
| Consistency bonus | Bonus applied for maintaining a work streak: logging work every day for N consecutive days |
| Sprint performance snapshot | End-of-sprint report per employee: tasks committed vs delivered, hours logged vs estimated, blockers created vs resolved |
| Rolling performance trend | 6-month rolling chart of performance score per sprint. Trend line shows improving / declining / stable trajectory |
| Team performance leaderboard | Optional cross-team ranking by aggregate performance score. CTO-toggled. Shows team health at a glance |
| Performance score transparency | Each employee can see their own score and the formula behind it. No black boxes |

---

### 2.4 Compensation & Bonus Intelligence

| Feature | Description |
|---|---|
| Compensation band configuration | HR sets salary bands per role and level: base range and bonus range. Configured per team or workspace-wide |
| Performance-to-band mapping | Each employee's performance score maps to a position within their compensation band. Live view for HR and CTO |
| Bonus eligibility report | Period report: each employee's total score, team rank, percentile, and recommended bonus tier. HR-configured formula |
| Bonus tier configuration | HR defines bonus tiers: e.g. Top 20% → Tier 1 (20% of base), Top 40% → Tier 2 (10% of base) |
| Pay-per-output modeling | Optional mode: issue scores directly translate to a variable pay component. Suitable for contract or gig-style roles |
| Compensation history log | Immutable record of all compensation changes per employee: salary updates, bonus payouts, effective dates |
| Salary review triggers | System flags employees whose performance score has consistently exceeded their band ceiling for N sprints |
| Export compensation report | Export bonus eligibility and compensation data as CSV for payroll or finance team processing |

---

### 2.5 Appraisal & Reviews

| Feature | Description |
|---|---|
| Appraisal cycle management | HR defines appraisal cycles: quarterly, half-yearly, or annual. System opens and closes cycles automatically |
| Auto-generated appraisal report | Cycle end: system compiles performance scores, attendance, peer recognition, and 1:1 notes into a structured report |
| AI performance narrative | AI drafts a plain-English performance summary from data. HR edits and personalizes before sharing with employee |
| Manager review layer | Manager adds qualitative commentary and final rating to the auto-generated report before it's shared |
| Employee self-review | Employee completes a structured self-assessment linked to the same appraisal cycle. Visible to manager |
| 360-degree peer review | Configurable peer feedback form sent to selected colleagues. Responses anonymized and included in appraisal |
| 1:1 meeting notes | Structured 1:1 notes logged against an employee record. Private between manager and employee. Linked to appraisal period |
| PIP tracking | Performance Improvement Plan issued as a structured set of issues with defined targets and a review date |
| Promotion recommendation | Manager can raise a promotion recommendation during an appraisal cycle. Routes to CTO / HR for approval |

---

### 2.6 AI-Powered People Intelligence

| Feature | Description |
|---|---|
| Worklog summarizer | Week-end AI reads all worklogs per employee and produces a plain-English summary for manager and CTO digest |
| Performance narrative generator | AI drafts appraisal narrative from scores, logs, peer feedback, and 1:1 notes. HR edits before sharing |
| Sprint retrospective AI | Post-sprint AI generates a retrospective: what went well, what didn't, suggested improvements from data |
| Anomaly detection | AI flags unusual patterns: 3+ days with zero logs (burnout risk), spike in re-opened issues (quality drop), hours 3× estimate (risk signal) |
| Skill gap analysis | AI compares current team skill tags against open role requirements and active project demands. Surfaces hiring or training needs |
| Team mood aggregation | Daily optional mood check-in (3 states). Anonymously aggregated. CTO alerted when multiple members flag overload same day |

---

### 2.7 HR Document & Compliance

| Feature | Description |
|---|---|
| Document vault per employee | Secure per-employee folder: offer letter, contract, ID, performance reviews, PIP docs. HR-only access. Encrypted at rest |
| Signed document tracking | Track which employees have signed required documents: policy acknowledgements, NDAs, updated contracts |
| Compliance checklist | HR-managed checklist of required actions per employee per year: training completion, document renewal, background check |
| Data retention policies | Configurable retention periods for worklog data, appraisal records, and compensation history. GDPR-aware |
| Role-based data visibility | Salary and compensation fields visible only to HR and CTO. Performance scores visible to direct manager and above |

---

*This document covers Phase 1 (PM + Time Tracking) and Phase 2 (People Ops + Compensation) of the Arbitask Work OS. Phase 3 (MCP + AI Agent Workforce) and Phase 4 (Full Work OS with payroll integration) are documented separately.*
