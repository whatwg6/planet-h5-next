# Migration Plan V2 Template

This file is a reusable task template for writing `plan-v2.md` from `docs/migration-v2/specs.md`.
It is not the migration plan itself.

## Writing Rules

- Use `docs/migration-v2/specs.md` as the migration specification source.
- Do not use `docs/migration-v2/plan.md` as input when drafting `plan-v2.md`.
- For V2 planning, this template and the generated V2 plan supersede any stale instruction that points agents back to the old `plan.md`.
- Keep `docs/architecture-design.md` as the architecture boundary source.
- Treat `/Users/yxc/code/planet-h5` as the old source project root when a task references old source files.
- Split the migration into executable tasks.
- Each task must include detailed steps that state what to inspect, what to create or change, where files belong, and how to verify the result.
- Do not copy old folders wholesale. Classify every migrated file by responsibility first.
- Keep current client, plan, and order baseline code disposable for migrated client-owned slices unless a file is non-business project infrastructure.

## Task Template

```md
## Task: Migrate <Page Or Capability>

### Goal

Describe the business page or capability being migrated and the route, feature, or behavior that
must exist after the task is complete.

### Scope

In scope:

- List the route, page, feature view, domain, application, infrastructure, query, mock, asset, and test areas touched by this task.
- List the old business behavior, visible fields, interactions, display mappings, and states that must be preserved.

Out of scope:

- Real API integration.
- Auth, token injection, SSO, login callback, unauthorized handling, native bridge behavior, and native navigation.
- Old page stack implementation.
- S3 upload, deployment scripts, old monitoring/logging wiring, and development demo pages.
- Pixel-perfect visual parity unless screenshots, design files, a runnable old page, or explicit visual acceptance criteria are provided.

### Steps

1. Inventory old source.

   - Read the old route entry under `/Users/yxc/code/planet-h5/src/apps/client/<module>/index.tsx`.
   - Read the old page component under `/Users/yxc/code/planet-h5/src/apps/client/<module>`.
   - Read old hooks used by the page and classify each one as query, mutation, local UI state, or application logic.
   - Read old constants, helpers, types, display mappings, validation rules, styles, and directly used assets.
   - Read old API files only when needed to understand field names or business meaning.
   - Do not migrate old API clients, request wrappers, generated service clients, Axios wiring, or backend response shapes as runtime dependencies.
   - Record visible sections, fields, field visibility rules, status labels, empty/loading/error/saved states, user interactions, validation feedback, and navigation targets.

2. Remove current baseline for this slice.

   - Inspect matching current-project files under `src/pages`, `src/features`, `src/application`, `src/domain`, `src/infrastructure/mock`, `src/infrastructure/repositories`, and `src/infrastructure/query/queryKeys.ts`.
   - Identify files or exports that only represent the current placeholder or disposable baseline for this migrated slice.
   - Remove or replace slice-specific baseline code before rebuilding from the old source inventory.
   - Keep project-level primitives and infrastructure, such as router helpers, shared UI primitives, app providers, test setup, and generic utilities.
   - If a current client file is intentionally kept because it is non-business infrastructure, record the exception in `docs/migration-v2/tracker.md`.

3. Model domain and business rules.

   - Create or update `src/domain/<module>`.
   - Define domain entities, value types, repository input/output types, status types, business-semantic mappings, and pure business rules needed by the migrated behavior.
   - Translate old backend-shaped fields into domain names used by the new app.
   - Keep pure formatting or business rules in domain only when they do not depend on React, query state, routing, or infrastructure.
   - Keep presentation-only labels, view formatting, and UI-only display mappings in features instead of domain.
   - Avoid `any`; model unknown, nullable, or optional fields explicitly.
   - Do not expose old backend response types to the view layer.

4. Add repository contract.

   - Create or update `src/domain/<module>/<Module>Repository.ts`.
   - Add repository methods required by the page or capability.
   - Model inputs based on user-visible behavior, such as params, filters, search keyword, pagination, form payload, or mode.
   - Model outputs as domain data, not backend response shapes.
   - Export the contract from the module index when the local pattern uses an index file.

5. Add application use case.

   - Create or update `src/application/<module>/*UseCases.ts`.
   - Add use case functions that accept a repository and typed input.
   - Put business-level defaults, request preparation, and domain-level transformations in the use case.
   - Do not import Axios, mock data, React Query, route params, React components, or old API clients.
   - Add focused use case tests if the use case transforms input/output or applies business defaults.

6. Add deterministic mock data.

   - Create or update fixtures under `src/infrastructure/mock`.
   - Cover normal data, empty-relevant data, edge cases, status/display mappings, and validation-relevant cases from the old page.
   - Keep mock data deterministic.
   - Do not use random IDs, current timestamps, environment-specific values, or live service data.
   - Translate useful old API fields into domain fixtures instead of exposing old response objects.

7. Add repository implementation and facade.

   - Create or update `src/infrastructure/repositories/<module>`.
   - Implement the domain repository contract using deterministic mock data.
   - Preserve user-visible filtering, searching, sorting, pagination, lookup, save, or selection behavior from the old page where applicable.
   - Export the selected implementation from `src/infrastructure/repositories/<module>/index.ts` as a lower-camel facade, such as `clientRepository`, distinct from the `ClientRepository` domain contract.
   - Ensure feature hooks import the repository facade, not `*.mock` files directly.

8. Register query keys.

   - Add or update stable keys in `src/infrastructure/query/queryKeys.ts`.
   - Include every input that affects returned server state, such as route params, filters, keyword, status, page, cursor, or mode.
   - Keep query keys centralized.
   - Do not define ad hoc query keys inside feature hooks.

9. Add feature query or mutation hooks.

   - Create or update hooks under `src/features/<module>/queries` or `src/features/<module>/mutations`.
   - Import use cases from `src/application/<module>`.
   - Import the repository facade from `src/infrastructure/repositories/<module>`.
   - Import query keys from `src/infrastructure/query/queryKeys.ts`.
   - Return the data, loading, error, refetch, mutation, invalidation, or cache update state needed by the view.
   - Keep backend and mock details out of the hook's public surface.

10. Migrate assets.

- Trace image and icon imports from the old page, old feature components, style files, and helper components.
- Classify each asset as reusable UI icon, brand asset, illustration or content image, page-only business image, or removable decorative asset.
- Do not copy the old asset folder wholesale.
- Put reusable SVG icon files in `src/shared/assets/icons`.
- Use kebab-case filenames for icons.
- Preserve each icon SVG `viewBox`.
- Export reusable icons from `src/shared/assets/icons/index.ts` with the `?react` suffix.
- Import reusable icons as React components from the icon index.
- Put brand SVGs in `src/shared/assets/brand` and import them as static URLs.
- Put reusable image or illustration assets in `src/shared/assets/images` and import them as static URLs.
- Put page-only business images near the owning feature unless at least two feature areas need the same business-agnostic image.
- Replace old asset import paths with new asset-boundary imports.
- Verify SVG icons inherit color through `currentColor` where expected.
- Verify static images render with correct dimensions, alt text, and loading behavior.

11. Build feature view.

- Create or update `src/features/<module>/views/<View>.tsx`.
- Compose the page with existing `src/shared/ui` primitives where suitable.
- Put business components under `src/features/<module>/components` or a focused capability module under `src/features/<capability>`.
- Preserve old information architecture, field visibility, display mappings, primary sections, primary interactions, and validation feedback.
- Implement loading, empty, error, success, and saved states where applicable.
- Receive navigation, route params, and page-mode callbacks through props where possible.
- Do not read `location.state` in feature views.

12. Add route entry.

- Create or update `src/pages/<module>/<Route>.tsx`.
- Keep the route component thin.
- If the route reads path params, call `useParams({ strict: false, shouldThrow: false })`.
- Render route entry content through `RouteModeSwitch` from `src/app/router/RouteModeSwitch.tsx`.
- Put the normal page in `defaultPage`.
- Add only non-default same-URL page modes to `modes`.
- Map old `location.state.pageType` behavior to new `location.state.routeMode` behavior with `routeModeState(mode)`.
- Do not create extra URL paths for same-resource page modes.

13. Register route.

- Update `src/app/router/routeTree.tsx`.
- Keep `routeTree.tsx` as the only route registration table.
- Preserve the `/ops/client...` public route contract for migrated client-owned routes.
- Convert old `:id` style params to TanStack Router `$clientId`, `$planId`, or other explicit parameter names.
- Do not add a separate route list or manual pathname matcher.
- Do not migrate old system or development routes such as `/login/callback`, `/not-found`, or `/_dev`.

14. Add tests.

- Add colocated domain tests for pure rules.
- Add use case tests under `src/application/<module>`.
- Add repository implementation tests under `src/infrastructure/repositories/<module>`.
- Add query hook and view tests under the relevant feature folder.
- Add route registration tests under `src/app/router` when registration changes.
- Add route mode dispatch tests under the relevant route file when page modes are migrated.
- Add Playwright tests under `e2e/` for browser-level route flows, navigation, or user-flow changes.

15. Verify.

- Run `pnpm lint`.
- Run `pnpm format:check`.
- Run `pnpm test`.
- Run `pnpm e2e` for route, navigation, or browser-level user-flow changes.
- Run `pnpm build` for broad, risky, shared-type, route-tree, or infrastructure changes.
- Fix failures within the migrated slice.
- Do not reformat or rewrite unrelated files.

### Acceptance Criteria

- The migrated route, page, or capability preserves the old business-visible fields, display mappings, primary interactions, and reachable user flow.
- The implementation follows `pages -> features -> application -> domain`, with infrastructure implementing repository contracts.
- Views do not import Axios, old APIs, generated clients, backend response types, request wrappers, or mock files directly.
- Query keys are centralized in `src/infrastructure/query/queryKeys.ts`.
- Same-resource modes use `routeMode` and `RouteModeSwitch`, not extra URL paths.
- Assets follow the shared asset boundary and are not copied wholesale from the old project.
- Loading, empty, error, success, and saved states are handled where applicable.
- Required tests and verification commands pass.
```

## Suggested Task List For Plan V2

Use this list as a starting point when drafting the actual plan:

1. Migration inventory and current client baseline cleanup.
2. Route contract and route tree setup for `/ops/client...`.
3. Client list page migration.
4. Client detail page migration.
5. Plan detail page migration.
6. Plan setting page migration.
7. Client order page migration.
8. Business capability component migration.
9. Page mode migration from `pageType` to `routeMode`.
10. Asset migration and shared asset boundary cleanup.
11. Final verification, tracker updates, and documentation adjustments.

## Client List Task Example

```md
## Task: Migrate Client List Page

### Goal

Migrate the old client list business page into the new `/ops/client` route while preserving
business-visible list fields, list states, search/filter behavior if present, and navigation into
client detail.

### Scope

In scope:

- `/ops/client` route entry.
- Client list feature view.
- Client list query hook.
- Client list use case.
- Client domain types and repository contract.
- Deterministic mock client list data.
- Client repository implementation and facade.
- Client list query key.
- Client list assets.
- Route, view, hook, use case, and repository tests where behavior requires them.

Out of scope:

- Real API integration.
- Auth, token injection, login redirect, or native bridge behavior.
- Old page stack implementation.
- Pixel-perfect visual parity unless visual acceptance criteria are provided.

### Steps

1. Inventory old client list source files.

   - Read old `/Users/yxc/code/planet-h5/src/apps/client/<client-list-module>/index.tsx` to identify route entry behavior.
   - Read the old client list page component under `/Users/yxc/code/planet-h5/src/apps/client/<client-list-module>`.
   - Read old hooks used by the list page and classify each hook as query, mutation, local UI state, or application logic.
   - Read old constants, helpers, types, display mappings, styles, and directly used assets.
   - Read old API files only as reference for field names or business meaning.
   - Record visible list item fields, status labels, empty state, loading state, error state, filters, search controls, pagination or infinite-scroll behavior, and click targets.

2. Remove the current-project client list baseline.

   - Inspect current client files under `src/pages/client`, `src/features/client`, `src/application/client`, `src/domain/client`, `src/infrastructure/mock`, `src/infrastructure/repositories/client`, and `src/infrastructure/query/queryKeys.ts`.
   - Identify files or exports that exist only for the current placeholder client list.
   - Remove or replace those client-list-specific implementations before rebuilding the migrated slice.
   - Keep generic project infrastructure such as router helpers, shared UI primitives, app providers, test setup, and generic utilities.
   - Record any intentionally kept client file exception in `docs/migration-v2/tracker.md`.

3. Define client list domain model.

   - Create or update `src/domain/client`.
   - Define client list entity types, list input types, list result types, status types, and business-semantic mappings.
   - Translate old backend-shaped fields into domain names used by this project.
   - Keep pure business rules or formatting helpers in domain only when they are React-free and infrastructure-free.
   - Keep presentation-only labels, view formatting, and UI-only display mappings in the client feature.
   - Avoid `any`; model optional or unknown values explicitly.

4. Define client repository contract.

   - Create or update `src/domain/client/ClientRepository.ts`.
   - Add a client list method such as `listClients(input)`.
   - Model list input from old behavior, such as search keyword, filters, status, page, cursor, or page size.
   - Model list output as domain data.
   - Export the contract from `src/domain/client/index.ts` if that matches the local pattern.

5. Add client list use case.

   - Create or update `src/application/client/*UseCases.ts`.
   - Add a use case that accepts the repository and client list input.
   - Apply business-level defaults such as default page size, default filter values, or normalized search keyword if the old page did so.
   - Do not import Axios, mock data, React Query, route params, React components, or old API clients.
   - Add use case tests if input or output is transformed.

6. Add deterministic client list mock data.

   - Create or update client fixtures under `src/infrastructure/mock`.
   - Cover normal clients, empty-relevant data, each user-visible status, and edge cases needed by display mappings.
   - Keep IDs, names, timestamps, status values, and counts deterministic.
   - Translate useful old API fields into domain fixtures instead of exposing old response objects.

7. Add client repository implementation and facade.

   - Create or update `src/infrastructure/repositories/client`.
   - Implement the client repository contract using deterministic mock data.
   - Preserve user-visible filtering, searching, sorting, and pagination behavior where present in the old page.
   - Export the selected implementation from `src/infrastructure/repositories/client/index.ts` as `clientRepository`.
   - Ensure feature hooks import `clientRepository`, not mock files directly.

8. Register client list query key.

   - Add a stable client list key in `src/infrastructure/query/queryKeys.ts`.
   - Include every query input that affects returned list data.
   - Keep the key centralized.
   - Do not define an ad hoc key in the feature hook.

9. Add client list query hook.

   - Create or update `src/features/client/queries`.
   - Add a React Query hook for client list data.
   - Import the use case from `src/application/client`.
   - Import `clientRepository` from `src/infrastructure/repositories/client`.
   - Import the query key from `src/infrastructure/query/queryKeys.ts`.
   - Return data, loading, error, and refetch state needed by the view.
   - Keep backend and mock details out of the hook's public surface.

10. Migrate client list assets.

- Trace old client list image and icon imports from page, component, style, and helper files.
- Classify each asset as reusable icon, brand asset, illustration/image, page-only business image, or removable decoration.
- Put reusable SVG icons in `src/shared/assets/icons`, use kebab-case filenames, preserve `viewBox`, and export them from `src/shared/assets/icons/index.ts` with `?react`.
- Put reusable static images in `src/shared/assets/images`.
- Put page-only client business images near the owning client feature.
- Replace old asset import paths.
- Verify icons inherit color and static images render correctly.

11. Build client list view.

- Create or update `src/features/client/views/ClientListView.tsx`.
- Compose the page with existing `src/shared/ui` primitives where suitable.
- Render migrated list item fields and display mappings from the old page inventory.
- Implement search, filters, pagination, or infinite-scroll controls if they exist in the old page.
- Render loading, empty, error, and loaded states.
- Receive client item navigation as a callback prop.
- Do not read `location.state` in the feature view.

12. Add client list route entry.

- Create or update `src/pages/client/ClientListRoute.tsx`.
- Keep the route component thin.
- Render the page through `RouteModeSwitch`.
- Put the normal client list page in `defaultPage`.
- Add only non-default same-URL page modes to `modes` if the old client list used `pageType`.
- Wire client item navigation to `/ops/client/$clientId`.
- Do not create extra URL paths for same-resource UI modes.

13. Register `/ops/client`.

- Update `src/app/router/routeTree.tsx`.
- Register the public route as `/ops/client`.
- Keep `routeTree.tsx` as the only route registration source.
- Do not add a manual pathname matcher or a second route list.

14. Add client list tests.

- Add route registration tests under `src/app/router` if registration changes.
- Add view tests under `src/features/client` for successful list rendering, loading state, empty state, error state, search/filter behavior if present, and client item navigation callback.
- Add query hook tests if the hook maps query state.
- Add use case tests if business defaults or transformations are applied.
- Add repository tests for filtering, searching, sorting, or pagination behavior.
- Add e2e coverage if this task changes browser-level navigation or route flow.

15. Verify the client list slice.

- Run `pnpm lint`.
- Run `pnpm format:check`.
- Run `pnpm test`.
- Run `pnpm e2e` if route navigation or browser-level flow changed.
- Run `pnpm build` if the slice touches shared types, routing, or broad infrastructure.
- Fix failures within the migrated slice only.

### Acceptance Criteria

- `/ops/client` renders the migrated client list page.
- The route is registered through `src/app/router/routeTree.tsx`.
- The page preserves old business-visible list fields, display mappings, primary interactions, and navigation to client detail.
- Client list data flows through feature hook, application use case, domain repository contract, and infrastructure repository implementation.
- The feature view does not import Axios, old APIs, generated clients, backend response types, request wrappers, or mock files directly.
- Client list query keys are centralized in `src/infrastructure/query/queryKeys.ts`.
- Client list assets follow the shared asset boundary.
- Loading, empty, error, and success states are handled.
- Required tests and verification commands pass.
```
