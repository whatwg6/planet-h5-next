# Business Migration Plan V2

This plan is generated from `docs/migration-v2/specs.md` and the architecture boundaries in
`docs/architecture-design.md`. It supersedes stale V2 migration instructions that point agents to
`docs/migration-v2/plan.md`.

Treat `/Users/yxc/code/planet-h5` as the old source project root. Do not copy old folders
wholesale. For each slice, classify legacy code by responsibility, remove disposable current
client-owned baseline code for that slice, then rebuild through the new architecture:

```txt
pages -> features -> application -> domain
infrastructure -> domain
```

## Global Rules

- Preserve business-facing H5 behavior, information architecture, visible fields, display mappings,
  field visibility, validation feedback, and primary reachable flows.
- Pixel-level visual parity is not required unless screenshots, design files, a runnable old page,
  or explicit visual acceptance criteria are provided.
- All server-backed behavior uses deterministic mock data.
- Do not add runtime dependencies on old `src/apis`, `src/apis-gen`, `src/apis-legacy`, Axios
  request wiring, generated service clients, request wrappers, or backend response shapes.
- Do not migrate auth, SSO, token injection, unauthorized handling, hybrid app bridge behavior,
  native navigation, S3 upload, deployment scripts, old monitoring/logging, or old development
  demo pages.
- Keep route registration centralized in `src/app/router/routeTree.tsx`.
- Use the `/ops/client...` public route contract for migrated client-owned pages.
- Same-resource page states migrate from old `location.state.pageType` to new
  `location.state.routeMode`, `routeModeState(mode)`, and `RouteModeSwitch`.
- Feature views must not read `location.state`; route entries own route params and page-mode
  dispatch.
- Query keys remain centralized in `src/infrastructure/query/queryKeys.ts`.
- Old `<Icons.XXX />` namespace usages are icon asset references to resolve, not a component API to
  preserve. Do not recreate a global `Icons` object or namespace in this project.
- Record intentionally kept current client-business files or infrastructure exceptions in
  `docs/migration-v2/tracker.md`.

## Verification Baseline

Run the narrowest useful tests for each slice. Before handing back migrated runtime work, run:

```bash
pnpm lint
pnpm format:check
pnpm test
```

Also run `pnpm e2e` for route, navigation, or browser-level user-flow changes, and run `pnpm build`
for broad, risky, shared-type, route-tree, or infrastructure changes.

## Task 1: Establish Migration Inventory And Baseline Guardrails

### Goal

Create a reviewable migration inventory before runtime migration begins. This task should make the
agent's understanding explicit: which old files matter, how each legacy behavior maps into the new
architecture, which current files are disposable baseline, which assets need classification, and
which decisions need review before implementation.

### Scope

In scope:

- Legacy source inventory under `/Users/yxc/code/planet-h5/src/apps/client`.
- Legacy shared business source under `/Users/yxc/code/planet-h5/src/biz/features` and
  `/Users/yxc/code/planet-h5/src/biz/comps`.
- Legacy generic component and asset inventory under `/Users/yxc/code/planet-h5/src/comps`,
  `/Users/yxc/code/planet-h5/src/assets/icons`, and `/Users/yxc/code/planet-h5/src/assets/imgs`.
- Current disposable client-owned baseline files under `src/pages`, `src/features`,
  `src/application`, `src/domain`, `src/infrastructure/mock`, `src/infrastructure/repositories`,
  and `src/infrastructure/query/queryKeys.ts`.
- `docs/migration-v2/tracker.md` status and exception recording.

Out of scope:

- Runtime feature migration.
- Real API integration.
- Old system, auth, native, deployment, monitoring, and development routes.

### Steps

1. Create or update the tracker structure.

   - Create `docs/migration-v2/tracker.md` if it does not exist.
   - Add enough structure to track task status, route-mode status, legacy files inspected,
     baseline cleanup decisions, asset/icon decisions, commands run, and skipped items.
   - Note that the tracker follows `docs/migration-v2/plan-v2.md`, not the stale V1 or old V2 plan.

2. Produce a compact slice inventory.

   - For client list, client detail default, plan detail, plan settings, and client order, record
     the public route, legacy entry/page files, important legacy hooks/helpers/types, expected new
     route file, expected feature view, likely domain/application/repository areas, query/mutation
     needs, and test categories.
   - Keep this inventory short. It should be enough for a reviewer to challenge file placement and
     scope before runtime migration starts, not a full implementation design for every page.

3. Produce a route mode inventory.

   - Read the old client detail files that define, render, or dispatch `location.state.pageType`.
   - For each mode, record the old `pageType`, proposed new `routeMode`, parent route, legacy
     files, target view or capability, whether it can migrate alone, coupled child modes if any,
     and acceptance focus.
   - Use this inventory to drive `Repeat Task 5.x`.

4. Produce a baseline cleanup inventory.

   - Inspect current-project files for each future migration slice.
   - Record files or exports that should be removed, replaced, or kept.
   - For kept client-specific files, record whether the reason is project infrastructure, shared
     primitive, or already migrated behavior.
     Treat existing client, plan, and order business code as disposable unless it is clearly generic
     project infrastructure.

5. Produce an asset and icon inventory.

   - Trace image/icon imports and old `<Icons.XXX />` usages from the inventoried slices.
   - For each meaningful asset, record usage site, old reference, old registry/SVG source if it is
     an `Icons` usage, classification, planned destination, and import style.
   - Reusable, business-agnostic SVG icons should map to `src/shared/assets/icons` with kebab-case
     filenames, preserved `viewBox`, `?react` exports, and direct named imports.
   - Do not plan a global `Icons` namespace or compatibility wrapper.

6. Produce a business capability inventory.

   - Read old `src/biz/features` and `src/biz/comps` usages discovered by the slices.
   - Record each capability's legacy files, slices that use it, target module, whether it owns save
     flow, domain/application needs, and expected tests.
   - If a capability is used by only one migrated flow, record whether it should stay under the
     owning feature instead of becoming a focused `src/features/<capability>` module.

7. Write implementation sketches for review.

   For each top-level slice, add a short sketch that states:

   - Which domain types and repository methods are expected.
   - Which use case functions are expected.
   - Which deterministic mock fixtures are needed.
   - Which query keys and feature hooks are expected.
   - Which route file and feature view will own composition.
   - Which old behaviors are explicitly out of scope.

   The sketch should be specific enough for a reviewer to challenge file placement, route-mode
   choices, icon classification, and test scope before code is written.

8. Add a review gate.

   - Mark Task 1 complete only after the tracker has enough filled inventory to execute Task 2,
     Task 3, Task 4, and at least the first `Repeat Task 5.x` without rediscovering the whole
     legacy project.
   - Record open questions explicitly instead of hiding them in `TBD`.
   - Do not start runtime migration from this task unless a small documentation-only adjustment is
     needed to keep the tracker coherent.

### Acceptance Criteria

- `docs/migration-v2/tracker.md` exists and references this V2 plan.
- Slice, route mode, baseline cleanup, asset/icon, and capability inventories are filled with
  concrete legacy files, target destinations, and reviewable decisions at the level needed to start
  the next migration tasks.
- Every old `<Icons.XXX />` usage found during inventory has a planned classification and
  destination; none plans to preserve a global `Icons` namespace.
- Kept current client-specific files are justified as project infrastructure, shared primitives, or
  already migrated behavior.
- At least the first executable route-mode repeat task has a selected mode or mode group.
- No runtime behavior is changed by this task unless needed for tracker/documentation hygiene.

## Task 2: Lock `/ops/client...` Route Contract

### Goal

Ensure the migrated business route contract exists only through the new route tree and remains ready
for page-by-page migration.

### Scope

In scope:

- `src/app/router/routeTree.tsx`.
- Thin route entry files under `src/pages/client`, `src/pages/plan`, or `src/pages/order` as needed.
- Route registration tests under `src/app/router`.
- Browser smoke coverage for migrated route availability.

Out of scope:

- Old `/login/callback`, `/not-found`, and `/_dev` routes.
- Old page stack implementation and direct `window.history` handling.
- Business page implementation beyond temporary thin wiring needed for the contract.

### Deliverables

- Updated `src/app/router/routeTree.tsx` with the five `/ops/client...` business routes.
- Thin route entry files for client list, client detail, plan detail, plan settings, and client
  order if they do not already exist.
- Route registration tests proving the public route contract and excluding old system/dev routes.
- E2E smoke coverage for route availability when browser-level route behavior changes.

### Implementation Sketch

- Convert old `:id` params to TanStack Router params with explicit business names:
  `$clientId`, `$planId`, and `$orderParams`.
- Route entries read params with `useParams({ strict: false, shouldThrow: false })` only when they
  need path params.
- Every route entry renders through `RouteModeSwitch`; default page content goes in `defaultPage`,
  and only non-default same-URL states go in `modes`.
- Do not add page-stack logic here. `RouteStack` remains the only stack rendering mechanism.

### Steps

1. Inspect old route mapping.

   - Map old `RoutePath.client` to `/ops/client`.
   - Map old `RoutePath.clientDetail` to `/ops/client/:id`.
   - Map old `RoutePath.clientPlanDetail` to `/ops/client/:id/plan/:planId`.
   - Map old `RoutePath.clientPlanDetailSetting` to `/ops/client/:id/plan/:planId/setting`.
   - Map old `RoutePath.clientOrder` to
     `/ops/client/:id/plan/:planId/order/:orderParams`.

2. Register TanStack routes.

   - Convert old `:id` syntax to explicit TanStack parameters such as `$clientId`, `$planId`, and
     `$orderParams`.
   - Keep `src/app/router/routeTree.tsx` as the only registration source.
   - Do not add a route list, manual pathname matcher, or legacy compatibility routes outside the
     `/ops/client...` contract.

3. Keep route entries thin.

   - Route entries that read params must call `useParams({ strict: false, shouldThrow: false })`.
   - Render route content through `RouteModeSwitch`.
   - Put normal pages in `defaultPage`; reserve `modes` for non-default same-URL route modes.

4. Add tests and verification.

   - Add or update route registration tests.
   - Add e2e smoke tests for reachable `/ops/client...` routes where placeholders are acceptable.
   - Run route-focused tests, `pnpm lint`, `pnpm format:check`, and `pnpm test`.

### Acceptance Criteria

- The five `/ops/client...` business routes are registered in `src/app/router/routeTree.tsx`.
- Route entries use `RouteModeSwitch`.
- Param route entries use `useParams({ strict: false, shouldThrow: false })`.
- No old system or development routes are migrated.
- Required route tests pass.

## Task 3: Migrate Client List Page

### Goal

Migrate the old client list into `/ops/client`, preserving list fields, list states, search/filter
behavior where present, and navigation into client detail.

### Scope

In scope:

- `/ops/client` route entry.
- `src/features/client/views/ClientListView.tsx`.
- Client query hook, use case, domain types, repository contract, deterministic mock data,
  repository facade, query key, assets, and tests.

Out of scope:

- Real API integration.
- Auth, login redirect, token injection, native bridge behavior, and native navigation.
- Pixel-perfect visual parity unless explicit visual acceptance criteria are provided.

### Deliverables

- `src/pages/client/ClientListRoute.tsx`.
- `src/features/client/views/ClientListView.tsx`.
- Client list query hook under `src/features/client/queries`.
- Client list use case under `src/application/client`.
- Client list domain types and repository contract under `src/domain/client`.
- Deterministic client list fixtures under `src/infrastructure/mock`.
- Client repository implementation and `clientRepository` facade under
  `src/infrastructure/repositories/client`.
- Client list query key in `src/infrastructure/query/queryKeys.ts`.
- Tests for list repository behavior, use case defaults when applicable, query hook behavior, view
  states, route wiring, and list-to-detail navigation.

### Implementation Sketch

- The route owns URL/search/route concerns and passes navigation callbacks into the view.
- The feature view owns list composition, search/filter controls, and loading/empty/error/success
  states.
- The query hook imports the use case, `clientRepository`, and centralized query keys.
- The use case normalizes list input such as keyword, filters, page, cursor, or page size if the
  old page did so.
- The repository implementation applies deterministic mock filtering, searching, sorting, or
  pagination matching old user-visible behavior.
- Any old `<Icons.XXX />` is resolved during this task, not deferred to Task 10 except for final
  audit.

### Steps

1. Inventory legacy client list source.

   - Read the old route entry and page component under
     `/Users/yxc/code/planet-h5/src/apps/client`.
   - Read list hooks, constants, helpers, types, styles, display mappings, and assets.
   - Record list item fields, status labels, empty/loading/error states, filters, search controls,
     pagination or infinite-scroll behavior, and detail click targets.

2. Remove current client list baseline.

   - Inspect and remove or replace list-specific baseline code under client pages, features,
     application, domain, infrastructure mock/repository, and query keys.
   - Keep project-level primitives and record intentional exceptions in the tracker.

3. Rebuild data flow.

   - Define client list domain types and repository contract in `src/domain/client`.
   - Add a client list use case in `src/application/client`.
   - Add deterministic client list fixtures under `src/infrastructure/mock`.
   - Implement the repository in `src/infrastructure/repositories/client` and export
     `clientRepository`.
   - Add a stable client list key to `src/infrastructure/query/queryKeys.ts`.
   - Add a client list React Query hook under `src/features/client/queries`.

4. Rebuild UI and route.

   - Classify and migrate only required assets.
   - For every old `<Icons.XXX />` usage in the client list, trace `XXX` to the old icon registry
     or SVG source before choosing its new destination.
   - If the traced icon is reusable and business-agnostic, add the SVG to
     `src/shared/assets/icons` with a kebab-case filename, preserve its `viewBox`, export it from
     `src/shared/assets/icons/index.ts` with `?react`, and import the named icon directly from that
     index.
   - If the traced `Icons.XXX` asset is a brand mark, illustration, content image, or page-only
     business asset, classify it under the normal asset rules instead of forcing it into
     `shared/assets/icons`.
   - Build `ClientListView` with existing shared UI primitives where suitable.
   - Implement loading, empty, error, and loaded states.
   - Keep navigation callbacks in props.
   - Add or update `src/pages/client/ClientListRoute.tsx` and register `/ops/client`.

5. Test and verify.

   - Add domain, use case, repository, hook, view, route, and e2e tests where behavior requires
     them.
   - Run `pnpm lint`, `pnpm format:check`, `pnpm test`, and `pnpm e2e` for navigation coverage.

### Acceptance Criteria

- `/ops/client` renders the migrated client list.
- Business-visible list fields, display mappings, list interactions, and client-detail navigation
  are preserved.
- Data flows through feature hook, application use case, domain repository contract, and
  infrastructure implementation.
- The view does not import old APIs, backend response types, mock files, Axios, or request wrappers.
- Loading, empty, error, and success states are handled.

## Task 4: Migrate Client Detail Default Page

### Goal

Migrate the default client detail page at `/ops/client/$clientId`, preserving its summary sections,
primary actions, and navigation into same-resource modes or plan pages.

### Scope

In scope:

- `/ops/client/$clientId` route entry and default page.
- Client detail view, query hook, use case, domain model, repository method, deterministic detail
  mock data, query key, assets, route-mode dispatch from default actions, and tests.

Out of scope:

- Full migration of every client detail `pageType` mode; those are covered by route-mode tasks.
- Native destination navigation and hybrid bridge behavior.

### Deliverables

- `src/pages/client/ClientDetailRoute.tsx`.
- Client detail default feature view under `src/features/client/views`.
- Client detail query hook under `src/features/client/queries`.
- Client detail use case under `src/application/client`.
- Client detail domain model and repository contract additions under `src/domain/client`.
- Deterministic client detail fixtures and missing-client edge cases.
- Client repository detail lookup implementation and facade export.
- Detail query key in `src/infrastructure/query/queryKeys.ts`.
- Tests for detail lookup, query hook behavior, view states, route-mode dispatch from default
  actions, and navigation to plan detail.

### Implementation Sketch

- The default route is not a `routeMode`; it is passed as `RouteModeSwitch.defaultPage`.
- Old default-page actions that used `pageType` become `routeModeState(mode)` transitions on
  `/ops/client/$clientId`.
- Plan detail navigation remains a real route:
  `/ops/client/$clientId/plan/$planId`.
- The feature view receives ordinary props for data and callbacks; it does not read
  `location.state`, TanStack params, repositories, mocks, or old API shapes.
- Keep the full migration of detail subpages for `Repeat Task 5.x`; this task only wires reachable
  mode dispatch where needed from the default page.

### Steps

1. Inventory legacy client detail source.

   - Read old client detail route entry, default detail page, hooks, constants, helpers, types,
     styles, and assets.
   - Record default visible sections, field labels, status mappings, counts, action rows, empty and
     error states, and navigation targets.
   - Record old `pageType` values reachable from the default page.

2. Remove current client detail baseline.

   - Remove or replace detail-specific placeholder business code across client page, feature,
     application, domain, infrastructure, and query-key files.
   - Keep generic route and shared UI infrastructure.

3. Rebuild client detail data flow.

   - Extend client domain entities and repository contract for detail data.
   - Add detail use case functions.
   - Add deterministic mock detail fixtures, including missing-client and display edge cases.
   - Implement repository lookup behavior and export through `clientRepository`.
   - Register detail query keys and add detail query hook.

4. Build detail UI and route entry.

   - Build the feature view under `src/features/client/views`.
   - Replace old `<Icons.XXX />` usages by tracing `XXX` to the old icon registry or SVG source,
     migrating reusable business-agnostic SVGs to `src/shared/assets/icons`, exporting them with
     `?react`, and importing named icon components directly from the icon index.
   - Do not introduce or preserve an `Icons` namespace in migrated client detail code.
   - Receive route params and navigation callbacks from the route entry.
   - Use `routeModeState(mode)` for old same-URL `pageType` actions.
   - Keep plan detail navigation on the `/ops/client/$clientId/plan/$planId` path.
   - Render route content through `RouteModeSwitch`.

5. Test and verify.

   - Add view tests for loading, error, missing data, and populated detail states.
   - Add route-mode dispatch tests for actions that push route state.
   - Add repository and use case tests for lookup and default handling.
   - Add e2e coverage for client list to client detail and plan navigation.

### Acceptance Criteria

- `/ops/client/$clientId` renders the migrated default detail page.
- Default detail fields, display mappings, action rows, and primary navigation are preserved.
- Same-resource actions use `routeModeState` and `RouteModeSwitch`, not extra paths.
- Detail data follows the new architecture and deterministic mock policy.

## Repeat Task 5.x: Migrate One Client Detail Route Mode

### Goal

Migrate one old client detail `location.state.pageType` subpage, or one tightly coupled mode group,
into `routeMode` state on `/ops/client/$clientId`.

Run this task repeatedly until all in-scope client detail modes are migrated. Track each execution
as `Task 5.1`, `Task 5.2`, and so on in `docs/migration-v2/tracker.md`.

### Scope

In scope:

- Exactly one client detail route mode, or a small mode group that cannot be migrated safely in
  isolation because the old UI treats it as one flow.
- Candidate modes include plan/settings panels, name and remark editing, notification settings,
  meal type/group/point, manager, support, department, cost center, app version, field setting,
  login setting, password setting, payment method, and card setting.
- Focused feature views or capability modules needed by the selected mode.
- Queries, mutations, domain rules, mock data, assets, and tests required by the selected mode.
- Tracker updates for the selected mode.

Out of scope:

- Unrelated route modes from the same legacy area unless they are part of the selected coupled
  flow.
- New production paths for same-resource modes.
- Old page stack implementation.
- Native app bridge behavior.

### Deliverables

- One selected `routeMode` entry, or one explicitly justified coupled mode group, in the client
  detail route's `RouteModeSwitch`.
- Focused view/component code for the selected mode under the owning client feature or a focused
  business capability module.
- Domain, application, repository, mock, query key, query hook, and mutation hook changes only when
  the selected mode needs them.
- Tests covering route-mode dispatch, mode rendering, validation, save behavior, and cache
  invalidation where applicable.
- Updated `docs/migration-v2/tracker.md` status for the selected mode.

### Implementation Sketch

- Pick the smallest mode that can preserve one old user flow end to end.
- Translate old `pageType` to a route-mode name that describes the same resource state, not a new
  path segment.
- If the mode is primarily a selector or editor reused by other pages, migrate it as a focused
  capability module and keep save ownership in the client page.
- If the mode saves data, model a typed command, route it through a use case and repository method,
  and invalidate or update centralized query keys.
- Resolve mode-local `<Icons.XXX />` usages during the repeat task and let Task 10 only audit
  leftovers and duplication.

### Steps

1. Select the mode for this repeat execution.

   - Choose one route mode from `docs/migration-v2/tracker.md`.
   - If the selected mode depends on a child mode to complete one old flow, define a small mode
     group and record the reason in the tracker before implementation.
   - Do not broaden the task to adjacent settings or selectors only because they are in the same
     legacy folder.

2. Inventory the selected legacy mode.

   - Read old client detail files that define, render, or dispatch the selected `pageType`.
   - Read old hooks, constants, helpers, types, form schemas, validation rules, style references,
     and directly used assets for the selected mode.
   - Read old API files only when needed to understand field names or business meaning.
   - Record visible fields, field visibility rules, display mappings, validation rules, loading,
     empty, error, saved states, selectors, nested subpanels, navigation targets, and return
     behavior.

3. Remove current baseline for the selected mode.

   - Inspect matching current-project files under `src/pages/client`, `src/features/client`,
     `src/application/client`, `src/domain/client`, `src/infrastructure/mock`,
     `src/infrastructure/repositories/client`, and `src/infrastructure/query/queryKeys.ts`.
   - Remove or replace code that only represents the disposable current baseline for this selected
     mode.
   - Keep generic route helpers, shared UI primitives, app providers, test setup, and other
     non-business project infrastructure.
   - Record any intentionally kept client-specific exception in `docs/migration-v2/tracker.md`.

4. Rebuild the selected mode through the architecture.

   - Add or extend domain types, repository contracts, pure rules, and command/input types needed
     by the selected mode.
   - Add application use cases for loading, preparing, validating, or saving mode data.
   - Add deterministic mock data and mock repository behavior for normal, empty, edge, validation,
     and saved states.
   - Register centralized query keys for every server-state input that affects the selected mode.
   - Add feature query or mutation hooks that import application use cases, repository facades, and
     centralized query keys.
   - Add domain, application, repository, mock, query/mutation, and feature view code only as
     required by the selected mode.
   - Put reusable business-aware components under focused `src/features/<capability>` modules, not
     `shared/ui`.
   - Keep save flows owned by the client route or owning client feature.

5. Wire route-mode dispatch.

   - Add mode entries to the client detail route's `RouteModeSwitch`.
   - Map the selected old `pageType` value to a new route-mode name.
   - Use `routeModeState(mode)` for same-URL transitions.
   - Keep feature views unaware of `location.state`.
   - Do not create a new production URL path for the selected same-resource mode.

6. Migrate required assets.

   - Trace only assets used by the selected mode or mode group.
   - For each old `<Icons.XXX />` usage in the selected mode, trace `XXX` to the old icon registry
     or SVG source.
   - Classify assets as reusable icon, brand asset, reusable image, page-only business image, or
     removable decoration.
   - Put reusable, business-agnostic SVG icons in `src/shared/assets/icons` with kebab-case
     filenames, preserve their `viewBox`, and export them from
     `src/shared/assets/icons/index.ts` with `?react`.
   - Import migrated icons as named components from the icon index; do not recreate or import a
     global `Icons` namespace.
   - If an old `Icons.XXX` usage points to a brand mark, illustration, content image, or
     business-specific/page-only asset, classify it under the normal asset rules instead of putting
     it in `shared/assets/icons`.
   - Keep page-only business assets near the owning feature unless they are reused elsewhere.

7. Test and verify.

   - Add route dispatch tests for the selected mode.
   - Add view and mutation tests for validation, save, loading, error, empty, and saved states.
   - Add use case and repository tests if the selected mode transforms data, validates commands, or
     performs mock save behavior.
   - Add e2e coverage when the selected mode changes browser-level navigation or meaningful editing
     behavior.
   - Run `pnpm lint`, `pnpm format:check`, and `pnpm test`.
   - Run `pnpm e2e` for browser-level route or user-flow changes.
   - Run `pnpm build` if the selected mode touches shared types, route-tree behavior, or broad
     infrastructure.
   - Update tracker route-mode status after the selected mode is completed.

### Acceptance Criteria

- The selected client detail subpage is reachable through `routeMode`.
- No same-resource behavior from the selected mode is represented by a new production URL path.
- The selected mode preserves business-visible fields, validation, save states, and primary
  interactions.
- Data and mutations for the selected mode follow the new architecture and deterministic mock
  policy.
- Tracker route-mode coverage is current for the selected mode.

## Task 6: Migrate Plan Detail Page

### Goal

Migrate the old plan detail page at `/ops/client/$clientId/plan/$planId`, preserving plan summary,
plan status, order entry points, settings entry points, and related visible business data.

### Scope

In scope:

- Plan detail route entry and feature view.
- Plan domain model and repository contract.
- Plan detail use case, deterministic mock data, repository implementation, query key, query hook,
  assets, and tests.
- Navigation to `/ops/client/$clientId/plan/$planId/setting` and order routes.

Out of scope:

- Full plan settings editors.
- Real API integration and native bridge behavior.

### Deliverables

- Plan detail route entry for `/ops/client/$clientId/plan/$planId`.
- Plan detail feature view.
- Plan domain entities and repository contract.
- Plan detail use case.
- Deterministic plan detail fixtures and repository implementation.
- Plan detail query key and feature query hook.
- Tests for repository lookup, use case behavior where applicable, query hook behavior, view
  states, route wiring, and navigation to settings/order flows.

### Implementation Sketch

- Keep plan detail as a real route because it represents a shareable plan resource.
- The route reads `clientId` and `planId`, then passes them and navigation callbacks into the
  feature view.
- The view renders plan summary, status/display mappings, settings entry points, order entry
  points, and loading/empty/error states from domain-shaped data.
- Plan settings navigation targets `/ops/client/$clientId/plan/$planId/setting`.
- Order entry points target `/ops/client/$clientId/plan/$planId/order/$orderParams` using the old
  route parameter semantics translated into a typed order param model.

### Steps

1. Inventory legacy plan detail source.

   - Read old route entry, page component, hooks, constants, helpers, types, styles, and assets.
   - Record visible plan fields, status labels, card sections, order/settings actions, empty and
     error states, and navigation targets.

2. Remove current plan detail baseline.

   - Remove or replace disposable current code for this plan detail slice across pages, features,
     application, domain, infrastructure, and query keys.

3. Rebuild plan detail data flow.

   - Define plan domain entities and repository methods.
   - Add plan detail use case.
   - Add deterministic mock plan fixtures and edge cases.
   - Implement repository detail lookup.
   - Register plan detail query key and feature query hook.

4. Build UI and route.

   - Migrate required assets by classification.
   - Resolve old `<Icons.XXX />` usages by tracing `XXX` to the old icon registry or SVG source;
     reusable business-agnostic SVGs go to `src/shared/assets/icons` and are imported as named
     components from the icon index.
   - Do not recreate an `Icons` namespace in migrated plan detail code.
   - Build the plan detail feature view with shared UI primitives where suitable.
   - Keep route params and navigation callbacks in the route entry.
   - Register and test `/ops/client/$clientId/plan/$planId`.

5. Test and verify.

   - Add repository, use case, hook, view, route, and e2e tests as needed.
   - Run route and user-flow verification commands.

### Acceptance Criteria

- `/ops/client/$clientId/plan/$planId` renders the migrated plan detail.
- Plan detail fields, display mappings, primary actions, and navigation targets are preserved.
- Plan data follows the new architecture and deterministic mock policy.

## Task 7: Migrate Plan Settings Page And Editors

### Goal

Migrate the old plan settings route at `/ops/client/$clientId/plan/$planId/setting` and the
business editors required by that route.

### Scope

In scope:

- Plan settings route entry, feature view, editor components, query/mutation hooks, domain rules,
  use cases, repository methods, deterministic mock data, query keys, assets, and tests.
- Business UI capabilities used by settings editors, including payment method, client member,
  merchant selection, Meican staff selection, and card setting when the settings flow requires them.

Out of scope:

- Real save API integration.
- Old native navigation and hybrid bridge behavior.
- Reusable business capability migration beyond what the settings flow needs.

### Deliverables

- Plan settings route entry for `/ops/client/$clientId/plan/$planId/setting`.
- Plan settings feature view and editor components.
- Validation schemas and typed settings command models where forms require validation.
- Plan settings query and mutation hooks.
- Plan settings use cases, repository contract methods, deterministic mock fixtures, and mock save
  behavior.
- Query keys and invalidation/cache update behavior for settings loads and saves.
- Tests for validation rules, command preparation, repository save behavior, mutation invalidation,
  view states, and primary edit/save flows.

### Implementation Sketch

- Use React Hook Form and Zod for validation-bearing editors.
- Keep settings-specific editors under the plan feature unless the old source proves the editor is
  a reusable business capability.
- Reusable business-aware selectors such as payment method, client member, merchant selection,
  Meican staff selection, or card setting move to focused capability modules only when needed by
  this flow or multiple flows.
- Mutations call application use cases, use repository contracts, and invalidate/update centralized
  query keys.
- Same-resource nested settings panels use `routeMode`; do not add extra settings subpaths.

### Steps

1. Inventory legacy settings source.

   - Read old settings route/page files and editor subcomponents.
   - Read old hooks, form schemas, constants, helpers, validation rules, display mappings, styles,
     and assets.
   - Record edit modes, field visibility, validation feedback, save/cancel behavior, saved states,
     selectors, and nested page states.

2. Remove current plan settings baseline.

   - Remove or replace disposable settings-specific baseline code across plan pages, features,
     application, domain, infrastructure, and query keys.

3. Rebuild rules and mutations.

   - Model settings commands and domain/application validation types.
   - Add repository contract methods for loading and saving settings.
   - Add deterministic mock settings data and mock save behavior.
   - Add query keys and feature query/mutation hooks.
   - Invalidate or update query cache through centralized keys.

4. Build settings UI.

   - Use React Hook Form and Zod where validation-bearing forms require them.
   - Keep business-aware editors under plan feature components or focused capability modules.
   - Resolve old `<Icons.XXX />` usages by tracing each icon to the old registry or SVG source,
     then importing migrated reusable SVG icons as named components from
     `src/shared/assets/icons/index.ts`.
   - Classify brand marks, illustrations, content images, and page-only business assets under the
     normal asset rules instead of forcing them into the shared icon set.
   - Do not recreate an `Icons` namespace for settings editors or capability modules.
   - Render loading, empty, error, validation, saving, saved, and failed-save states.
   - Use route-mode state for same-resource nested settings panels.

5. Test and verify.

   - Add domain/use case tests for validation and command preparation.
   - Add repository tests for mock load/save behavior.
   - Add mutation hook tests for invalidation or cache updates.
   - Add view and e2e tests for primary edit/save flows.

### Acceptance Criteria

- `/ops/client/$clientId/plan/$planId/setting` renders the migrated settings page.
- Settings editors preserve field visibility, validation, save behavior, and saved/error states.
- Mutations use application use cases, repository contracts, and centralized query keys.
- Same-resource panels use `routeMode`, not extra URL paths.

## Task 8: Migrate Client Order Page

### Goal

Migrate the old client order route at `/ops/client/$clientId/plan/$planId/order/$orderParams`,
preserving order detail data, member/order interactions, display mappings, and reachable subflows.

### Scope

In scope:

- Client order route entry and feature view.
- Order domain model, repository contract, use cases, deterministic mock data, repository facade,
  query/mutation hooks, query keys, assets, order route modes, and tests.

Out of scope:

- Real ordering API integration.
- Native payment, app bridge, and native navigation behavior.

### Deliverables

- Client order route entry for `/ops/client/$clientId/plan/$planId/order/$orderParams`.
- Order feature view and any selected order route-mode views.
- Explicit order route-param parser/model.
- Order domain entities, command types, repository contract, use cases, deterministic mock
  fixtures, and repository implementation.
- Order query and mutation hooks with centralized query keys.
- Tests for route param parsing, repository behavior, use cases, mutations, view states,
  route-mode dispatch, and primary order flows.

### Implementation Sketch

- Treat `orderParams` as an input boundary: parse it in route/application code into a typed model
  before the view consumes it.
- The default order page is route content; member lists or same-resource order subflows become
  route modes.
- Quantity/options/member interactions become typed commands when they mutate server-backed order
  state.
- Mock save/submit behavior should be deterministic and cover validation-relevant edge cases.
- Native payment and bridge flows stay out of scope; preserve web-visible fallback behavior if the
  old page had one.

### Steps

1. Inventory legacy order source.

   - Read old order route entry, default page, hooks, constants, helpers, types, validation rules,
     styles, and assets.
   - Record order parameter parsing, visible fields, member list behavior, quantity or option
     controls, validation, save/submit states, error states, and nested `pageType` states.

2. Remove current order baseline.

   - Remove or replace disposable current order code across pages, features, application, domain,
     infrastructure, mock data, repositories, and query keys.

3. Rebuild order data and commands.

   - Model order route params and domain entities explicitly.
   - Add order load and mutation use cases.
   - Add deterministic order fixtures and validation edge cases.
   - Implement mock repository behavior for lookup, selection, save, or submit flows.
   - Add order query keys and query/mutation hooks.

4. Build order UI and route modes.

   - Build default order feature view.
   - Resolve old `<Icons.XXX />` usages by tracing each `XXX` to the old registry or SVG source;
     migrate only reusable, business-agnostic SVGs to the shared icon index and import them as
     named components.
   - Do not recreate or preserve a global `Icons` namespace in order code.
   - Migrate member list and other same-resource subpages as route modes.
   - Keep feature views unaware of `location.state`.
   - Preserve loading, empty, error, validation, saving, saved, and submitted states where
     applicable.

5. Test and verify.

   - Add tests for route param parsing, repository behavior, use cases, hooks, views, route-mode
     dispatch, and e2e order flows.
   - Run `pnpm e2e` for browser-level ordering flows.

### Acceptance Criteria

- `/ops/client/$clientId/plan/$planId/order/$orderParams` renders the migrated order page.
- Order fields, member/order interactions, validations, and primary subflows are preserved.
- Route modes are used for same-resource subpages.
- Order data and mutations follow the new architecture and deterministic mock policy.

## Task 9: Migrate Shared Business Capabilities

### Goal

Migrate reusable business-aware capabilities used by multiple migrated pages without placing
business logic in `shared/ui`.

### Scope

In scope:

- `payment-method`.
- `client-member`.
- `select-merchant`.
- `select-meican-staff`.
- `card-setting`.
- Other old `src/biz/features` or `src/biz/comps` capabilities discovered during page migration.

Out of scope:

- Business-agnostic primitives that belong in `shared/ui`.
- Capabilities not used by the migrated client, plan, settings, or order flows.

### Steps

1. Inventory each capability.

   - Read old capability components, hooks, constants, helpers, types, styles, and assets.
   - Record business semantics, inputs, outputs, save ownership, validations, selectors, and
     display mappings.

2. Classify destination.

   - Put reusable business-aware capabilities under `src/features/<capability>`.
   - Put one-off business components under the owning feature's `components` folder.
   - Put only business-agnostic primitives in `src/shared/ui`.

3. Rebuild capability boundaries.

   - Allow capability modules to depend on `shared/ui`, `shared/utils`, and pure domain rules.
   - Do not let capability modules import `pages` or owning feature modules.
   - Pass owning business context through props.
   - Keep actual saving in the owning page's mutation.

4. Test and verify.

   - Add focused component, hook, schema, and view tests.
   - Verify integrating pages still own save flows and query invalidation.

### Acceptance Criteria

- Reused business components live in focused feature capability modules or owning features.
- `shared/ui` remains business-agnostic.
- Capability APIs are typed and do not expose old API shapes or mock files.

## Task 10: Audit Asset And Shared UI Boundaries

### Goal

Audit and consolidate assets and generic UI primitives migrated by prior business tasks while
preserving the asset boundary defined by the architecture document.

### Scope

In scope:

- Old `src/assets/icons`.
- Old `src/assets/imgs`.
- Old `src/comps` components that are truly business-agnostic.
- New `src/shared/assets/icons`, `src/shared/assets/brand`, `src/shared/assets/images`, and
  `src/shared/ui` updates.

Out of scope:

- Wholesale asset folder copying.
- Business-aware components in `shared/ui`.

### Steps

1. Audit actual usage and leftovers.

   - Trace image and icon imports from each migrated page, capability, style file, and helper
     component.
   - Search migrated code for `Icons.` leftovers.
   - Check legacy source inventories for any `<Icons.XXX />` usages missed by prior business tasks.
   - For each missed `<Icons.XXX />`, trace `XXX` to the old icon registry or SVG source before
     migrating it.
   - Remove unused decorative assets unless required for business behavior or recognizable page
     structure.

2. Classify assets.

   - Put reusable, business-agnostic SVG icons in `src/shared/assets/icons`.
   - Use kebab-case icon filenames.
   - Preserve icon `viewBox` values.
   - Export reusable icons from `src/shared/assets/icons/index.ts` with `?react`.
   - Confirm migrated old `<Icons.XXX />` call sites use direct named imports from
     `src/shared/assets/icons/index.ts`.
   - Do not recreate a global `Icons` object, `Icons` namespace, or compatibility wrapper in the
     new project.
   - If an old `Icons.XXX` usage resolves to a brand mark, illustration, content image, or
     business-specific/page-only asset, classify it under the normal asset destination instead of
     adding it to `shared/assets/icons`.
   - Put brand SVGs in `src/shared/assets/brand`.
   - Put reusable static images and illustrations in `src/shared/assets/images`.
   - Put page-only business images near the owning feature.

3. Classify old components.

   - Move old `src/comps` code to `shared/ui` only if it has no client, merchant, plan, order, or
     other business meaning.
   - Keep H5 mobile layout constraints.
   - Avoid premature shared abstractions until at least two feature areas need the same
     business-agnostic primitive.

4. Verify rendering.

   - Verify SVG icons inherit color through `currentColor` where expected.
   - Search migrated code for `Icons.` and confirm no legacy namespace usage remains.
   - Verify static images render with correct dimensions, alt text, and loading behavior.
   - Add visual or component tests where rendering affects behavior.

### Acceptance Criteria

- Required migrated assets render correctly.
- SVG icon imports use the SVGR `?react` boundary.
- Migrated old `<Icons.XXX />` usages are direct named imports from the new icon index, with no
  recreated global `Icons` namespace.
- Static images and brand assets are imported as URLs.
- No business-aware component is introduced into `shared/ui`.

## Task 11: Final Migration Audit And Documentation

### Goal

Confirm the migrated V2 scope is complete, verifiable, and documented without stale references to
old runtime dependencies or obsolete migration instructions.

### Scope

In scope:

- `docs/migration-v2/tracker.md`.
- `README.md`, `AGENTS.md`, and `docs/architecture-design.md` only if project structure,
  commands, test tooling, or architectural rules changed.
- Whole-project verification.

Out of scope:

- New business scope beyond the pages and capabilities listed in `docs/migration-v2/specs.md`.

### Steps

1. Audit architecture boundaries.

   - Search migrated code for forbidden imports from old API folders, Axios request wiring,
     generated clients, backend response shapes, mock files in views/hooks, or direct
     `location.state` reads in feature views.
   - Confirm repository facades are used by feature hooks.
   - Confirm query keys are centralized.
   - Confirm route registrations live only in `routeTree.tsx`.

2. Audit route modes and routes.

   - Confirm `/ops/client...` route contract is complete.
   - Confirm same-resource subpages use `routeMode`.
   - Confirm no old system or development routes were migrated.
   - Update route-mode status in `docs/migration-v2/tracker.md`.

3. Audit assets and shared UI.

   - Confirm assets follow the icon, brand, image, and page-owned boundaries.
   - Confirm `shared/ui` contains only business-agnostic primitives.

4. Run final verification.

   - Run `pnpm lint`.
   - Run `pnpm format:check`.
   - Run `pnpm test`.
   - Run `pnpm e2e`.
   - Run `pnpm build`.
   - Record commands and results in the tracker.

5. Update docs if needed.

   - Update `README.md`, `AGENTS.md`, or `docs/architecture-design.md` only if migration changed
     structure, commands, tooling, or architecture rules.
   - Do not rewrite unrelated documentation.

### Acceptance Criteria

- V2 migration scope is complete or every deferred item is explicitly tracked.
- Forbidden runtime dependencies and stale route patterns are absent.
- Required verification commands pass or failures are documented with scoped follow-up.
- Documentation and tracker evidence reflect the final migrated state.
