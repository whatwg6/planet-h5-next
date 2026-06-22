# Planet H5 Business Migration Specs

## Purpose

This document defines the business migration constraints for rewriting `/Users/yxc/code/planet-h5` on top of this project.

The rewrite is business-first and mock-first:

- Migrate business pages, business rules, page flows, and interaction behavior.
- Use deterministic mock data for all migrated business behavior.
- Do not depend on the legacy API being reachable.
- Do not make legacy API integration, Orval generation, token refresh, SSO, or hybrid request behavior a prerequisite for business migration.

`../architecture-design.md` remains the source of truth for architecture boundaries. This document defines migration constraints, order, and acceptance criteria under those boundaries.

Migration docs are split by role:

- `specs.md`: migration constraints and acceptance rules.
- `plan.md`: migration priority, milestone plan, and current migration status.
- `execution.md`: executable slice guidance for agents.

## Source Project Scope

The legacy business source is `/Users/yxc/code/planet-h5`.

Primary legacy locations:

- `src/apps/client/client-list`
- `src/apps/client/client-detail`
- `src/apps/client/plan-detail`
- `src/apps/client/plan-setting`
- `src/apps/client/client-order`
- `src/biz/features`

Legacy API and platform locations are reference-only for this migration:

- `src/apis`
- `src/apis-gen`
- `src/apis-legacy`
- `src/utils/sso.ts`
- `src/utils/hybrid.ts`
- `src/utils/sentry.ts`

## Non-Goals

The following are intentionally out of scope for the business migration:

- Restoring legacy API connectivity.
- Migrating Orval as a required part of business delivery.
- Rebuilding token refresh, SSO, hybrid request, or deployment upload behavior.
- Copying legacy `apps` files wholesale into the new project.
- Moving business-aware components into `shared/ui`.
- Using real backend data as an acceptance condition.

Future real API integration can be added by replacing mock repository implementations with HTTP repository implementations behind the same domain contracts.

## Architecture Rules For Migration

Every migrated business module should follow this shape:

```txt
pages/<module>
  Thin TanStack Router route entries.

features/<module>
  Views, feature components, queries, mutations, stores, and UI state.

application/<module>
  Use cases that coordinate business operations.

domain/<module>
  Entities, repository contracts, and pure business rules.

infrastructure/mock
  Deterministic mock data.

infrastructure/repositories/<module>
  Mock repository implementations for current delivery.
```

Dependency direction must remain:

```txt
pages -> features -> application -> domain
infrastructure -> domain
```

Feature query and mutation hooks should import use cases and mock repositories directly. They should not call Axios, legacy generated API clients, or browser platform adapters.

## Mock-First Data Strategy

All migrated business behavior should be backed by mock repositories.

For each migrated module:

1. Define or extend the domain entity and repository contract.
2. Add deterministic mock records under `src/infrastructure/mock`.
3. Implement the repository under `src/infrastructure/repositories/<module>/<module>Repository.mock.ts`.
4. Add use cases under `src/application/<module>`.
5. Add TanStack Query keys in `src/infrastructure/query/queryKeys.ts`.
6. Add feature queries or mutations under `src/features/<module>/queries` or `src/features/<module>/mutations`.
7. Cover list, detail, edit, empty, and error states in mock data where the UI needs them.

Mock repositories may mutate in-memory mock data for edit flows. Keep mutations deterministic and scoped to the module.

## Route Strategy

The new project may keep development-friendly routes such as `/client`, but migrated production business routes should preserve the legacy URL shape when the route is migrated:

```txt
/ops/client
/ops/client/$clientId
/ops/client/$clientId/plan/$planId
/ops/client/$clientId/plan/$planId/setting
/ops/client/$clientId/plan/$planId/order/$orderParams
```

Route metadata belongs in `src/app/router/routeMeta.ts`.

Route definitions belong in `src/app/router/routeTree.tsx`.

Route entry components belong in `src/pages/<module>`.

Feature views must not read `location.state` directly. Same-URL page modes should continue to use:

- `src/app/router/historyState.ts`
- `src/app/router/RouteModeSwitch.tsx`

Route stack navigation should remain centralized in `src/app/router/RouteStack.tsx`.

## Migration Priority

### P0: Core Business Navigation

Migrate the main business path first:

1. Client list
2. Client detail
3. Plan detail
4. Plan settings

Acceptance:

- The main route flow can be completed using mock data.
- H5 stack navigation remains correct.
- List and detail pages support loading, empty, error, and success states.
- `pnpm lint`, `pnpm format:check`, and `pnpm test` pass.

### P1: Client Detail Business Settings

Migrate the client detail sub-businesses in batches:

1. Name and remark
2. Support configuration
3. Manager
4. Department
5. Cost center
6. Field setting
7. Login setting
8. Password setting
9. Notification
10. Meal point
11. Meal type
12. Meal group
13. App version

Acceptance:

- Each setting page or mode has a domain model or explicit application command.
- Edit flows use mock mutations and update related query caches.
- Business validation lives in domain rules, application use cases, or Zod schemas, not inline in route components.
- Feature views receive normal props and callbacks and remain unaware of route state.

### P1: Plan Business Settings

Migrate plan detail and settings from `src/apps/client/plan-detail` and `src/apps/client/plan-setting`.

Suggested order:

1. Plan detail summary
2. Plan settings list
3. Base info
4. Open times
5. Operation day
6. Occupation time
7. Restriction
8. Order rule
9. Order transfer
10. Manually confirm order
11. Menu style
12. Hide price
13. Hide price and meal point
14. Dish remark
15. Delivery remark
16. Pick up setting
17. Pick up meal code
18. Finance config
19. Maximum order amount
20. Merchant order verification
21. Hidden account types
22. Disable append dish
23. Location setting

Acceptance:

- Rules with reusable meaning are modeled in `domain/plan` or `features/setting-rule`.
- Form validation uses React Hook Form and Zod where structured input is involved.
- Save flows use mock mutations and invalidate or update query cache with centralized query keys.

### P1: Client Order

Migrate order pages from `src/apps/client/client-order`.

Target module:

```txt
src/domain/order
src/application/order
src/infrastructure/mock/orderMockData.ts
src/infrastructure/repositories/order/orderRepository.mock.ts
src/features/order
src/pages/order
```

Scope:

- Client member order list
- Client order detail
- Merchant schedule info
- Price summary
- Default time schedule behavior

Acceptance:

- `orderParams` parsing is handled at the page or application boundary.
- Order status, amount, schedule, and display rules are not duplicated across views.
- Mock data covers multiple order statuses and price summary cases.

### P2: Shared Business Capabilities

Migrate reusable business capabilities from `src/biz/features`.

Candidates:

- Select merchant
- Select Mc staff
- Payment method
- Client member
- Card setting

Placement rule:

- Business-aware reusable flows should live under `src/features/<business>`.
- Only business-agnostic primitives should live under `src/shared/ui`.

Acceptance:

- Shared business features expose clear component or hook entry points.
- They still use application use cases and mock repositories for data access.
- They do not import legacy API clients.

## UI Migration Guidance

Do not copy all legacy components at once. Migrate shared UI only when a migrated business page needs it.

Suggested order:

1. Page, SafeArea, NavBar, Header
2. Loading, PageStatus, Toast, Dialog, Modal, Popup
3. Button, Input, SearchInput, Switch, Checkbox, TextArea
4. List, Picker, Tree
5. Map, only when a migrated business flow requires it

Rules:

- Put business-agnostic H5 primitives in `src/shared/ui`.
- Put client, plan, order, merchant, payment, or member-specific components in their feature module.
- Put reusable SVG icons in `src/shared/assets/icons` and export them with the `?react` suffix.
- Put static images or illustrations in `src/shared/assets/images`.

## Testing Expectations

Use the narrowest useful test for each migration step:

- Domain rules: colocated `*.test.ts` beside the rule file.
- Use cases: `src/application/<module>/*UseCases.test.ts`.
- Mock repositories: tests under `src/infrastructure/repositories/<module>`.
- Query hooks and views: React Testing Library tests under the relevant feature folder.
- Route metadata: `src/app/router/routeMeta.test.ts`.
- Route mode dispatch: tests under the relevant route file in `src/pages/<module>`.

Before handing back a migrated business slice, run:

```bash
pnpm lint
pnpm format:check
pnpm test
```

For broad route, shared UI, or high-risk flow changes, also run:

```bash
pnpm build
```

## Per-Slice Checklist

Use this checklist for each migrated business slice:

- Source legacy files identified.
- Target route and route metadata added or confirmed.
- Domain entity and repository contract added or extended.
- Mock data added with success, empty, and edge cases.
- Mock repository implemented.
- Use case added.
- Query key added.
- Feature query or mutation added.
- Feature view migrated.
- Route component remains thin.
- Business-aware components stay out of `shared/ui`.
- Tests added at the narrowest useful level.
- `pnpm lint` passes.
- `pnpm format:check` passes.
- `pnpm test` passes.

## Recommended First Milestone

The first milestone should deliver this complete mock-backed flow:

```txt
/ops/client
  -> /ops/client/$clientId
  -> /ops/client/$clientId/plan/$planId
  -> /ops/client/$clientId/plan/$planId/setting
```

This milestone proves that routing, H5 stack behavior, mock repositories, query keys, feature views, and page composition are working together before the long tail of settings pages is migrated.
