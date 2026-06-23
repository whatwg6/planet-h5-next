# Business Migration Execution V2

Use this when executing an approved migration plan.

## Overview

Load the plan, review it critically, execute one bounded slice at a time, verify the slice, and record the result.

Use subagents for large phases when independent investigation or implementation slices can run in parallel. The main agent remains responsible for final integration, validation, and status updates.

## Start Of Session

Before changing code:

1. Read the approved plan.
2. Read any source-of-truth architecture or policy document referenced by the plan.
3. Identify the plan section and the smallest useful slice to execute.
4. Review the slice critically.
5. Raise blocking questions before implementation.
6. If there are no blockers, create or update todos for the slice.

Do not start implementation when:

- The expected behavior is unclear.
- The ownership boundary is unclear.
- The migration policy is unclear.
- The slice would require behavior the plan excludes.
- The slice would cross an architectural boundary without an explicit decision.
- Validation expectations are missing for risky behavior.

## Slice Definition

A good slice is small enough to review independently and large enough to leave a coherent behavior behind.

Prefer slices shaped around one of:

- One route or route mode.
- One query/use case/repository path.
- One mutation/use case/repository path.
- One validation-bearing form flow.
- One reusable capability integration.
- One shared primitive or asset migration.
- One focused validation or cleanup pass.

Avoid slices that mix route contract changes, data modeling, UI migration, mutation behavior, and shared abstraction work unless those changes are inseparable.

Before coding a slice, write down:

- The source files or old behavior inspected.
- The behavior confirmed.
- The field, enum, or data-shape mapping, if any.
- The exclusions checked.
- The validation that will prove the slice.

## Subagent Use

Use subagents sparingly. Delegate only when the work is large enough that a separate agent will reduce risk or unblock meaningful parallel progress.

Good delegation cases:

- Old source inspection.
- Field, enum, or data-shape mapping for a large source area.
- Independent risk review before editing a broad or sensitive slice.
- Focused test review after implementation.
- Isolated implementation only when the write scope is narrow and clearly owned.

Prefer not to delegate:

- Small slices that fit in one focused edit pass.
- Work that requires frequent judgment calls.
- Work with overlapping file ownership.
- Work where the subagent would need to infer product decisions.

Do not delegate:

- Scope or contract decisions.
- Plan phase status updates.
- Final architecture approval.
- Final validation.
- Decisions that change persistence policy.
- Decisions that create new shared abstractions or ownership boundaries.

Each subagent must report:

```md
### Subagent Handoff: <slice>

- Plan section:
- Scope:
- Files inspected:
- Files changed:
- Decisions needed:
- Tests added:
- Risks:
```

## Execution Loop

For each slice:

1. Mark the owning task, route mode, or capability row in `plan.md` as `In progress`; mirror the
   slice in working todos if useful.
2. Confirm the slice belongs to the approved plan.
3. Follow the plan exactly unless a deviation is recorded.
4. Keep edits limited to the slice.
5. Run the narrowest useful tests while developing.
6. Run required validation before handoff.
7. Update the owning task, route mode, or capability row in `plan.md` when the slice status changes.
8. Record the result in the execution log.
9. Propose phase-level status updates only when the phase summary status actually changes.

## Boundary Check

Before implementation, identify the source documents that govern the slice and enforce them directly. Do not restate their rules here.

If a governing constraint is unclear, stop and revisit the source document before coding.

## Verification

Run the plan's specified tests for the slice.

For route, route mode, or cross-page navigation slices, also run the manual H5 stack checks:

- Open the route directly with required params.
- Navigate forward from the owning list or detail page.
- Push a same-URL route mode through `routeModeState`.
- Use browser or H5 back navigation and verify the previous stack entry is restored.
- Verify replace navigation does not leave stale stack entries.

Before handing back migrated code, run:

```bash
pnpm lint
pnpm format:check
pnpm test
```

For route, route mode, cross-page navigation, shared UI, or browser-interaction changes, also run:

```bash
pnpm e2e
```

Also run this for broad route, shared UI, build, or cross-module changes:

```bash
pnpm build
```

Do not skip verification silently. If a command is not run, record why.

## When To Stop

Stop and ask for help when:

- The plan has a critical gap.
- A contract or ownership decision is ambiguous.
- Source behavior contradicts the plan.
- A test fails repeatedly and the cause is not clear.
- A required dependency or source file is missing.
- The implementation would require excluded scope.
- The slice needs a new shared abstraction or ownership boundary not described by the plan.
- Continuing would require widening scope.

Do not guess through blockers.

## When To Revisit The Plan

Return to plan review when:

- The user updates the plan.
- A subagent finds old-source behavior that changes scope.
- A route contract decision changes the contract.
- A planned mode, subflow, or behavior is discovered to be unreachable or newly required.
- Persistence needs differ from the plan.
- The architecture boundary needed by the slice differs from the plan.

Do not change approved plan scope, inventories, target files, ownership, or validation expectations unless the user or repository convention allows it. Otherwise, record the proposed change and ask before implementation continues.

## Blocker Record

Record blockers as soon as continuing would require guessing through an unclear decision or missing
source behavior:

When recording a blocker, update the owning task, route mode, or capability row in `plan.md` to
`Blocked` and include the blocker title or evidence in the status note.

```md
### Blocker: <short title>

- Plan phase:
- Slice:
- Blocking question:
- Evidence:
- Impacted files:
- Options:
- Required decision:
```

## Deviation Record

Record deviations before or with the code change:

When a deviation is recorded, reference the deviation title from the owning task, route mode, or
capability row in `plan.md` so the current status points back to the decision record.

```md
### Deviation: <short title>

- Plan phase:
- Plan reference:
- Decision:
- Reason:
- Scope impact:
- Validation impact:
- Plan update required:
```

## Completion

A slice is complete only when:

- The implemented behavior matches the plan or has a recorded deviation referenced from the owning
  `plan.md` task, route mode, or capability row.
- Applicable tests were added or explicitly deemed unnecessary.
- Required validation ran or skipped commands are documented.
- Required Playwright checks ran for route, route mode, cross-page navigation, shared UI, or
  browser-interaction changes, or the manual fallback reason is documented.
- Subagent handoffs, if any, were reviewed by the main agent.
- The owning task, route mode, or capability row in `plan.md` is updated with the current status and evidence.
- The execution log records the result.

Record slice results in this execution document unless the current task explicitly names a different
log location, such as a PR description or issue comment. `plan.md` remains the current status index;
`execution.md` is the historical evidence log.

Record completed slices:

```md
### <YYYY-MM-DD> <Phase> <Slice>

- Result:
- Files changed:
- Tests:
- Validation:
- Subagents:
- Risks:
```
