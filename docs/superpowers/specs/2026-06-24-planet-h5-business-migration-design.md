# Planet H5 Business Migration Design

Date: 2026-06-24

## Goal

Migrate the business behavior from `/Users/yxc/code/planet-h5` into this project while keeping the current project's architecture and route model. The migration uses mock data only and intentionally excludes old runtime infrastructure.

The source of business truth is the old project's client business area:

- `/Users/yxc/code/planet-h5/src/apps/client/**`
- Source business dependencies under `/Users/yxc/code/planet-h5/src/biz/**`
- Required business assets, constants, utils, and business-agnostic component behavior from the old project

Existing routes and business pages in this project may be rewritten. They are not a constraint for the migration.

## Explicit Non-Goals

Do not migrate:

- `hybrid` behavior or SDK integration
- SSO
- request interceptors
- real API integration
- Orval generated API code or generation workflow
- old React Router setup
- old Sass global styling system
- `/Users/yxc/code/planet-h5/src/apps/system/**`
- `/Users/yxc/code/planet-h5/src/apps/dev/**`

## Recommended Approach

Use layered reconstruction with vertical business slices.

Each migration slice should move one coherent business flow through the current architecture at the same time:

```txt
pages -> features -> application -> domain
infrastructure -> domain
```

This keeps every step runnable and testable, avoids importing old runtime assumptions, and lets mock repositories drive the migrated business behavior.

Avoid a broad copy of old directories. Old code is reference material for behavior, information architecture, and business rules, not a target folder structure.

## Architecture Boundaries

The current project architecture remains the target shape:

- `pages`: TanStack Router route entries only. They read route params, dispatch `routeMode`, and pass navigation callbacks into feature views.
- `features`: page composition, business components, queries, mutations, forms, local UI state, and feature stores.
- `domain`: business entities, repository contracts, and pure business rules.
- `application`: use cases for reads, saves, creates, updates, and other business operations.
- `infrastructure/mock`: deterministic mock data.
- `infrastructure/repositories/*/*.mock.ts`: repository implementations backed by mock data.
- `shared/ui`: business-agnostic H5 primitives only.

Source `src/biz/**` should be split into the correct target layer instead of copied as-is:

- reusable business UI goes into focused `features/*` capability modules;
- business rules and entities go into `domain/*`;
- mock-backed data access goes through repository contracts and implementations;
- page-specific components stay under the owning feature.

Large business components must not be placed in `shared/ui`.

## Routes And Page Modes

Use the current project's URL shape:

```txt
/ops/client
/ops/client/$clientId
/ops/client/$clientId/plan/$planId
/ops/client/$clientId/plan/$planId/setting
/ops/client/$clientId/plan/$planId/order/$orderParams
```

Do not preserve old `/ops/client-next...` paths.

Old `pageType` behavior maps to the current `routeMode` protocol. Same-resource subpages should not introduce additional URL paths. Use `location.state.routeMode`, `routeModeState`, and `RouteModeSwitch`.

Examples of customer-detail modes include:

- name and remark
- support settings
- login settings
- password settings
- notifications
- app version
- managers
- departments
- cost centers
- field settings
- meal points
- meal types
- meal groups

Route entries should use `useParams({ strict: false, shouldThrow: false })` when reading params. Feature views must not read `location.state` directly.

Continue using the current `RouteStack`. Do not restore the old React Router page stack. If old flows depend on "refresh on return" or kept-alive behavior, solve that with TanStack Query cache behavior and feature-local Zustand stores rather than migrating `usePageVisibilityRequest`.

## Mock Data Strategy

All data is mock data. The mock layer should cover major business states, not every backend edge case.

Mock coverage should include:

- clients: normal clients, test clients, different statuses, remarks, owners, and setting completeness;
- client detail settings: name and remark, support, login, password, notifications, app version, managers, departments, cost centers, field settings, meal points, meal types, and meal groups;
- plans: multiple business types, setting groups, open times, order rules, restrictions, pickup settings, and finance settings;
- orders: order lists, order details, and key delivery, pickup, and dine-in display states;
- shared business capabilities: payment methods, client members, merchant selection, and Meican staff selection where pages actually depend on them.

Repository mock implementations must return domain entities. Feature views and hooks must not depend on old API response shapes.

Old `apis-gen` files may be used as field-meaning reference only. They should not be migrated or imported.

Mock data should be deterministic and suitable for tests.

## UI And Business Components

The UI migration prioritizes business behavior over pixel-level visual parity.

Preserve from the old project:

- page information architecture;
- list item content and states;
- detail fields;
- settings groups;
- form steps;
- key interactions such as save, cancel, confirm, create, select, and back.

Rebuild visuals with the current Tailwind and `shared/ui` system. Do not migrate the old Sass styling system.

Prefer existing `shared/ui` primitives. Add new primitives only when they are business-agnostic H5 building blocks, such as list rows, switches, pickers, dialogs, toasts, or action sheets. Business-specific UI belongs under the owning feature or an independent business capability feature.

Business-specific examples include:

- payment method UI;
- client member UI;
- merchant selection;
- Meican staff selection;
- meal period, meal point, and meal rule editors;
- plan setting editors.

When old source code uses `Icons.XXX`, migrate the corresponding SVG/icon into `src/shared/assets/icons`, export it from `src/shared/assets/icons/index.ts` with the `?react` suffix, and consume it as a React component in new code.

Other SVG icons follow the same icon boundary. Business illustrations or image-like SVGs should live in `src/shared/assets/images` or a feature-local asset folder when they are not reusable icons.

Complex forms should be rebuilt with current tools: React Hook Form, Zod, and Zustand draft stores where useful.

## Migration Order

Move in runnable vertical slices:

1. Foundation and shared capabilities
   - Keep current architecture and `RouteStack`.
   - Add required business-agnostic H5 primitives.
   - Establish icon migration conventions.
   - Establish mock data organization.

2. Client list slice
   - Migrate client list, search/filter behavior, create entry, list card states, and mock repository support.

3. Client detail and client settings slice
   - Migrate detail page, settings index, and routeMode subpages for name and remark, support, login, password, notifications, app version, managers, departments, cost centers, field settings, meal points, meal types, and meal groups.

4. Plan list and plan detail slice
   - Migrate client meal plans, plan detail, open times, order entry, and core display rules.

5. Plan settings slice
   - Migrate settings index and main edit subflows: basic info, menu, order rules, restrictions, pickup, finance, and advanced settings.

6. Order slice
   - Migrate client order list and order detail with major order states.

7. Shared business capability completion
   - Complete payment methods, client members, merchant selection, and Meican staff selection only where migrated pages need them.

## Testing And Verification

Use the narrowest useful tests for each slice:

- domain rules: colocated `*.test.ts`;
- use cases: `src/application/<module>/*UseCases.test.ts`;
- mock repositories: `src/infrastructure/repositories/<module>/*.mock.test.ts`;
- query hooks and views: React Testing Library tests under the feature;
- route registration and route mode dispatch: tests under `src/app/router` or the related route file;
- browser-level navigation and route flows: Playwright tests under `e2e/`.

Before handoff for implementation work, run at least:

```bash
pnpm lint
pnpm format:check
pnpm test
```

For route, navigation, or user-flow changes, also run:

```bash
pnpm e2e
```

## Acceptance Criteria

- All target URLs are accessible.
- Main `routeMode` subpages can be entered and returned from.
- Mock data covers the major business states needed by migrated flows.
- Final migrated flows do not leave hard-coded "pending migration" placeholders as business behavior.
- Features do not import old API shapes, old mock shapes, or generated API code.
- Business data access goes through query or mutation hooks, application use cases, domain repository contracts, and mock repository implementations.
- UI follows current Tailwind and `shared/ui` conventions.
- `Icons.XXX` usages from old code are converted into `src/shared/assets/icons` exports and component imports.
- The excluded runtime areas remain excluded: hybrid, SSO, interceptors, real APIs, Orval generation, system pages, and dev pages.
