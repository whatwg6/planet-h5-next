# Planet H5 Business Migration Execution

## Purpose

This document is the execution entry point for business migration work.

Use it together with:

- `specs.md` for migration constraints and acceptance rules.
- `plan.md` for milestone order, current status, and historical slice notes.
- `../architecture-design.md` for long-term architecture boundaries.

## Current Route Standard

Migrated production business flows should use the `/ops` route shape:

```txt
/ops/client
/ops/client/$clientId
/ops/client/$clientId/plan/$planId
/ops/client/$clientId/plan/$planId/setting
/ops/client/$clientId/plan/$planId/order/$orderParams
```

Development-friendly `/client/...` routes may exist for local compatibility, but do not use them as the target shape for newly migrated production business flows.

## Current Migration Status

The early client migration slices are no longer blank starting points. Before adding a new slice, inspect the current code first.

Already represented in the current app:

- Client list route and mock-backed query.
- Client detail route and detail query.
- Client detail same-URL modes through `RouteModeSwitch`.
- Client meal plans mode.
- Client settings hub mode.
- Client name and remark edit mode.
- Client support, login, password, notification, app version, manager, department, cost center, field, meal point, meal type, and meal group settings views.
- Plan detail, plan settings, and client order production-shaped routes.

For client detail same-resource pages, keep using `routeModeState(...)` and `RouteModeSwitch`. Do not add separate URLs for those modes, and do not let feature views read `location.state`.

## Slice Workflow

For each remaining business slice:

1. Read the relevant legacy files under `/Users/yxc/code/planet-h5`.
2. Confirm the target `/ops` route and route metadata when the slice changes routing.
3. Extend domain entities and repository contracts only for real business concepts.
4. Add deterministic mock data and mock repository behavior.
5. Add or update application use cases.
6. Add centralized query keys in `src/infrastructure/query/queryKeys.ts`.
7. Add feature query or mutation hooks that call use cases through mock repositories.
8. Keep route components thin and put page composition in feature views.
9. Add the narrowest useful tests for the changed behavior.

## Verification

Before handing back a migrated business slice, run:

```bash
pnpm lint
pnpm format:check
pnpm test
```

For broad route, shared UI, rule-editor, or high-risk flow changes, also run:

```bash
pnpm build
```
