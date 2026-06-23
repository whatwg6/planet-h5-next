# Business Migration V2 Tracker

Use this file to track migration task status, pending work, route-mode coverage, and evidence
produced while executing `docs/migration-v2/plan.md`.

Allowed status values: `Not started`, `In progress`, `Completed`, `Blocked`, `Skipped`.

## Status Summary

| Task | Status      | Updated    | Notes                                                   |
| ---- | ----------- | ---------- | ------------------------------------------------------- |
| 1    | Completed   | 2026-06-23 | Tracker skeleton created.                               |
| 2    | Not started | N/A        | Lock the `/ops/client...` route contract.               |
| 3    | Not started | N/A        | Migrate client list.                                    |
| 4    | Not started | N/A        | Migrate client detail default page.                     |
| 5    | Not started | N/A        | Migrate one client detail route mode.                   |
| 6    | Not started | N/A        | Migrate plan detail default page.                       |
| 7    | Not started | N/A        | Migrate plan settings route and first editor.           |
| 8    | Not started | N/A        | Migrate one plan settings route mode.                   |
| 9    | Not started | N/A        | Migrate client order detail default page.               |
| 10   | Not started | N/A        | Migrate client order member list route mode.            |
| 11   | Not started | N/A        | Migrate shared business capabilities on demand.         |
| 12   | Not started | N/A        | Migrate shared UI primitives and assets on demand.      |
| 13   | Not started | N/A        | Run final migration audit and record completion status. |

## Route Mode Status

| Area | Route mode | Target | Status | Updated | Notes |
| ---- | ---------- | ------ | ------ | ------- | ----- |

## Evidence Template

- Task:
- Status:
- Legacy source inspected:
- Tests added or updated:
- Behavior covered:
- Commands run:
- Result:
- Playwright coverage:
- Skipped or N/A items:

## Entries

### Task 1: Create Tracker And Baseline Guardrails

- Task: 1
- Status: Completed
- Legacy source inspected: N/A; documentation guardrail task only.
- Tests added or updated: N/A; no runtime behavior changed.
- Behavior covered: Created the migration v2 tracker skeleton, added status tracking, added route mode status tracking, and kept `docs/migration-v2/plan.md` aligned with `tracker.md`.
- Commands run:
  - `pnpm format:check docs/migration-v2/plan.md docs/migration-v2/tracker.md`
- Result: PASS
- Playwright coverage: N/A; no browser-level route flow changed.
- Skipped or N/A items: Runtime tests, build, and e2e are N/A for this documentation-only baseline task.
