# Business Migration Specs V2

This document defines how old business concepts from `/Users/yxc/code/planet-h5` map into this project.

It is a mapping guide, not an implementation plan or general architecture guide. Architectural
boundaries remain defined by `../architecture-design.md`; task order and verification steps remain
defined by `plan.md`.

## Scope

Migrate business-facing H5 pages and interactions from the old `planet-h5` project into this project.

In scope:

- Client list and client detail business pages.
- Plan detail and plan settings business pages.
- Client order business pages.
- Business UI capabilities used by those pages, such as payment method, client member, merchant selection, and setting editors.
- Business constants, display mappings, form schemas, validation rules, and deterministic mock data needed by migrated pages.

Out of scope:

- Real API integration.
- `apis-gen`, `apis-legacy`, generated service clients, and old Axios request wiring as runtime dependencies.
- Hybrid app bridge behavior.
- SSO, login callback, auth bootstrap, unauthorized handling, token injection, and native navigation.
- S3 upload, deployment scripts, environment-specific build publishing, and old monitoring/logging wiring.
- Development demo pages under old `src/apps/dev`.

## UI Migration Policy

Migration includes UI structure and interaction behavior, not only data and business logic.

Migrated pages should preserve:

- Business behavior and reachable user flows.
- Information architecture, field visibility, display mappings, and primary page sections.
- Primary interaction patterns, including form inputs, validation feedback, loading, empty, error, and saved states when applicable.
- Layout and styling that can be reasonably inferred from old source code, reusable components, style files, and assets.

Pixel-level visual parity is not a default requirement because migration is primarily source-code driven and may not inspect the rendered old UI. Exact visual alignment requires explicit acceptance criteria, such as screenshots, design files, a runnable old page for comparison, or a task-specific visual QA checklist.

When exact visual parity is not part of the task, visual differences should not block a migration slice as long as the migrated page keeps the business behavior, information structure, and main interaction affordances intact.

## Source Project Mapping

Old project source roots map into the new architecture by responsibility:

```txt
old src/apps/client/<module>/index.tsx
  -> new src/pages/<module>/<Route>.tsx

old src/apps/client/<module>/<Page>.tsx
  -> new src/features/<module>/views/<View>.tsx

old src/apps/client/<module>/hooks/*
  -> new src/features/<module>/queries
  -> new src/features/<module>/mutations
  -> new src/features/<module>/store
  -> new src/application/<module>

old src/apps/client/<module>/constants
old src/apps/client/<module>/helpers
old src/apps/client/<module>/types
  -> new src/domain/<module>
  -> new src/application/<module>
  -> new src/features/<module>
  -> new src/infrastructure/mock

old src/biz/features/<feature>
  -> new src/features/<feature>

old src/biz/comps
  -> new src/features/<capability>/components
  -> or an owning feature's components folder

old src/comps
  -> new src/shared/ui, only when business-agnostic

old src/assets/icons
  -> new src/shared/assets/icons

old src/assets/imgs
  -> new src/shared/assets/images
```

Do not copy old folders into the new project wholesale. Classify every migrated file by responsibility first.

## Data Policy

All migrated server-backed behavior must use deterministic mock data.

Do not import these from pages, features, views, or hooks:

```txt
old src/apis
old src/apis-gen
old src/apis-legacy
axios
request clients
backend response shapes
```

Old API files may be read only as reference for field names or business meaning. If a backend response type is useful, translate it into a domain type or mock fixture; do not expose it to the view layer.

## Route Migration

Old `react-router-dom` routes migrate to the new route tree and page entry files:

```txt
src/app/router/routeTree.tsx
src/pages/<module>/<Route>.tsx
```

Migrated business route paths must use this project's `/ops/client...` route contract. Exclude
out-of-scope system and dev routes.

Business route inventory:

```txt
RoutePath.client
  /ops/client
  -> client list route

RoutePath.clientDetail
  /ops/client/:id
  -> client detail route

RoutePath.clientPlanDetail
  /ops/client/:id/plan/:planId
  -> plan detail route

RoutePath.clientPlanDetailSetting
  /ops/client/:id/plan/:planId/setting
  -> plan settings route

RoutePath.clientOrder
  /ops/client/:id/plan/:planId/order/:orderParams
  -> client order route
```

When registering these in TanStack Router, preserve the URL shape and convert path
parameter syntax only as required by TanStack Router. For example, old `:id` should become the
client-specific TanStack Router parameter `$clientId`, but the public route shape must remain
`/ops/client...`.

Do not invent new production route paths from the current project's existing placeholders.
`/ops/client...` is the production route contract for this migration.

Do not migrate old system or development routes:

```txt
/login/callback
/not-found
/_dev
```

## Page Mode Migration

The old project uses:

```txt
location.state.pageType
usePageTypeDispatcher
```

The new project uses:

```txt
location.state.routeMode
routeModeState(mode)
RouteModeSwitch
```

Do not create extra URL paths for same-resource modes. For example, edit, settings, nested selectors, and detail subpanels that were old `pageType` states should become `routeMode` states unless they are truly shareable standalone resources.

Default pages are not route modes. Render them through `RouteModeSwitch defaultPage` and list only
non-default `pageType` states as `routeMode` values.

## Page Stack Migration

Do not migrate the old page stack implementation.

Old concepts map as follows:

```txt
old useRouteStack
  -> new src/app/router/RouteStack.tsx

old PageContext location snapshot
  -> new RouteStackEntryLocationProvider

old usePageContext params
  -> routeParams from RouteStackPageProps, with useParams fallback
```

Do not introduce direct `window.history` handling.

## Business Component Migration

Old `src/biz/features` and `src/biz/comps` are business-aware. Move them to focused feature
capability modules under `src/features/<capability>` or to the owning feature when the component is
only used by one migrated flow.

```txt
payment-method
client-member
select-merchant
select-meican-staff
card-setting
```

Old `src/comps` components can move to `shared/ui` only when they are business-agnostic. Shared UI
and asset placement follow `../architecture-design.md`.
