# Planet H5 Business Migration Plan And Execution Notes

## Purpose

This document tracks the business migration plan, current migration status, and executable slice notes.

It is based on `docs/business-migration-specs.md`. If the migration spec changes, update this plan and `docs/business-migration-execution.md` together.

The first completed slice was the client list page. It established the migration rhythm for later slices:

1. Read the legacy business behavior.
2. Map legacy files to new architecture boundaries.
3. Extend mock-backed domain, application, repository, query, route, and view code.
4. Verify the slice with focused tests.

The migration remains mock-first. Do not use legacy API connectivity as part of execution.

## Slice 1: Client List Page

### Goal

Migrate the client list business page from the legacy project into this project with mock data.

The first delivery should cover:

- Client list route.
- Client list search.
- Mock-backed list data.
- Empty, loading, error, and success UI states.
- Client card display.
- Developer test client tag display.
- Navigation from client list to client detail.

The first delivery does not need to cover:

- Creating a client.
- Infinite scroll.
- Hybrid-only navigation behavior.
- Legacy `ScrollView` behavior.
- Legacy `Popup` and `Dialog` behavior.
- Real API request behavior.
- SSO, token, or header behavior.

Those should be handled in later slices only if the business flow requires them.

### Legacy Source Files

Use these legacy files as the source of behavior:

```txt
/Users/yxc/code/planet-h5/src/apps/client/client-list/index.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-list/Detail.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-list/comps/Card.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-list/hooks/useClientList.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-list/helper/normalize.ts
/Users/yxc/code/planet-h5/src/apps/client/client-list/types.ts
```

Read-only reference files:

```txt
/Users/yxc/code/planet-h5/src/apps/client/client-list/comps/Create.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-list/constants/index.ts
```

`Create.tsx` is a later slice because client creation is not needed to prove the client list page migration.

### Legacy Behavior Summary

The legacy page does the following:

- Renders a "4.0 客户" H5 page.
- Shows a search input.
- Searches clients by keyword.
- Loads paged results through `useInfiniteScroll`.
- Shows an empty state for no matching clients.
- Renders each client as a card.
- Shows a "测试" tag when the client is marked as a developer test client.
- Navigates to the client detail page when a card is tapped.
- Shows a create entry only in non-prod or hybrid contexts.

For the first migrated slice, preserve search, list display, empty state, test tag, and detail navigation. Defer create and infinite scroll.

### Target Files

Expected target files for this slice:

```txt
src/domain/client/Client.ts
src/domain/client/ClientRepository.ts
src/application/client/getClientList.ts
src/infrastructure/mock/clientMockData.ts
src/infrastructure/repositories/client/clientRepository.mock.ts
src/infrastructure/query/queryKeys.ts
src/features/client/queries/useClientListQuery.ts
src/features/client/store/clientListStore.ts
src/features/client/components/ClientCard.tsx
src/features/client/components/ClientStatusTag.tsx
src/features/client/views/ClientListView.tsx
src/pages/client/ClientListRoute.tsx
src/app/router/routeMeta.ts
src/app/router/routeTree.tsx
```

Optional target files if the view grows further:

```txt
src/features/client/components/ClientSearchBar.tsx
```

`ClientCard` and `ClientStatusTag` are feature components because they carry client-list business meaning. They should not be placed under `src/shared/ui`.

Do not create additional optional components until duplication or readability makes the split useful.

### UI Component Scope

The first slice should use the new project's existing shared primitives first:

```txt
src/shared/ui/Page
src/shared/ui/Form
src/shared/ui/Feedback
src/shared/assets/icons
```

Do not migrate the full legacy component set for this slice.

Legacy components that should remain out of scope for the first client list slice:

```txt
/Users/yxc/code/planet-h5/src/comps/ScrollView.tsx
/Users/yxc/code/planet-h5/src/comps/NavBar.tsx
/Users/yxc/code/planet-h5/src/comps/SearchInput.tsx
/Users/yxc/code/planet-h5/src/comps/Popup
/Users/yxc/code/planet-h5/src/comps/dialog
```

Only migrate a legacy base UI component when the current business slice cannot be completed with existing `shared/ui` primitives. If a migrated component has no client, plan, order, merchant, payment, or member meaning, place it under `src/shared/ui`. If it carries business meaning, place it under the owning feature module.

### Step 1: Confirm Route Shape

The legacy production route is:

```txt
/ops/client
```

For the migrated production route, add or confirm:

```txt
src/app/router/routeMeta.ts
src/app/router/routeTree.tsx
src/pages/client/ClientListRoute.tsx
```

Route entry rules:

- Keep `ClientListRoute` thin.
- Render the feature view through `RouteModeSwitch`.
- Do not put list business logic in the route file.

Expected route entry shape:

```tsx
export function ClientListRoute() {
  return <RouteModeSwitch defaultPage={<ClientListView />} />;
}
```

### Step 2: Model The Client List Summary

Inspect the legacy client list item shape and normalize it into the domain.

The first slice should support at least:

```ts
export type ClientSummary = {
  id: string;
  name: string;
  phone?: string;
  updatedAt?: string;
  isDeveloperTest?: boolean;
};
```

If the existing `ClientSummary` lacks `isDeveloperTest`, add it only if the migrated UI will render the "测试" tag.

Keep domain types UI-free:

- No React types.
- No TanStack Query types.
- No CSS class names.
- No browser APIs.

### Step 3: Extend Mock Data

Add or update deterministic mock records in:

```txt
src/infrastructure/mock/clientMockData.ts
```

The data should cover:

- At least 10 clients for realistic list display.
- At least one developer test client.
- At least one keyword-search match by name.
- At least one keyword-search match by phone.
- At least one no-result keyword scenario through ordinary filtering.

Example record fields:

```ts
{
  id: "c1",
  name: "客户 A",
  phone: "13800000000",
  updatedAt: "2026-06-13",
  isDeveloperTest: true,
  fields: {
    owner: "负责人 A",
    status: "跟进中",
    source: "线索池",
    city: "上海",
  },
  planIds: ["p1"],
}
```

Keep mock data business-readable. Avoid opaque random data.

### Step 4: Implement Mock Repository Behavior

Update:

```txt
src/infrastructure/repositories/client/clientRepository.mock.ts
```

The repository should:

- Return `ClientSummary[]` from `listClients`.
- Filter by `params.keyword`.
- Match keyword against `name` and `phone`.
- Preserve `isDeveloperTest` in the returned summary.
- Throw only for real invalid detail access, not for an empty list result.

Do not call legacy generated APIs.

Do not import from `features`.

### Step 5: Keep Use Case Thin

Update or confirm:

```txt
src/application/client/getClientList.ts
```

Expected responsibility:

- Accept a `ClientRepository`.
- Accept `ClientListParams`.
- Call `repository.listClients(params)`.
- Return the result.

Do not add UI state or query cache behavior to the use case.

### Step 6: Wire Query Key And Query Hook

Update or confirm:

```txt
src/infrastructure/query/queryKeys.ts
src/features/client/queries/useClientListQuery.ts
```

Rules:

- Query keys remain centralized.
- Query hook imports `getClientList`.
- Query hook imports `clientRepositoryMock`.
- Query hook does not import Axios or legacy API clients.

Expected query hook shape:

```ts
export function useClientListQuery(params: ClientListParams) {
  return useQuery({
    queryKey: queryKeys.clients.list(params),
    queryFn: () => getClientList(clientRepositoryMock, params),
  });
}
```

### Step 7: Build The Feature View

Update:

```txt
src/features/client/views/ClientListView.tsx
src/features/client/components/ClientCard.tsx
src/features/client/components/ClientStatusTag.tsx
```

The view should own composition for:

- Page title.
- Search field.
- Loading state.
- Error state with retry.
- Empty state.
- Client card list.
- Navigation to client detail.

Extract the card and tag into feature components:

```txt
src/features/client/components/ClientCard.tsx
src/features/client/components/ClientStatusTag.tsx
```

Client card behavior:

- Show client name.
- Show phone when available.
- Show "测试" tag when `isDeveloperTest` is true.
- Navigate to the client detail route.

`ClientStatusTag` should remain a client feature component for now. Do not generalize it into `shared/ui` until another feature needs the same business-agnostic tag primitive.

Use existing `shared/ui` primitives first. Only add new shared primitives when the component is business-agnostic and needed by more than one feature.

### Step 8: Store Search UI State

Update or confirm:

```txt
src/features/client/store/clientListStore.ts
```

The first slice can keep only:

```ts
type ClientListState = {
  keyword: string;
  setKeyword: (keyword: string) => void;
};
```

Do not add pagination or create-client state until those flows are migrated.

### Step 9: Add Focused Tests

Use the narrowest tests that prove this slice.

Recommended tests:

```txt
src/application/client/clientUseCases.test.ts
src/domain/client/clientRules.test.ts
src/features/client/queries/useClientListQuery.test.tsx
```

Add repository tests if filtering behavior becomes non-trivial:

```txt
src/infrastructure/repositories/client/clientRepository.mock.test.ts
```

Test cases:

- Returns all clients when keyword is empty.
- Filters by client name.
- Filters by phone.
- Returns an empty list for an unmatched keyword.
- Preserves `isDeveloperTest` in list summaries.

If route metadata changes, add or update:

```txt
src/app/router/routeMeta.test.ts
```

### Step 10: Verify The Slice

Run:

```bash
pnpm lint
pnpm format:check
pnpm test
```

For route changes or broader UI refactors, also run:

```bash
pnpm build
```

Manual verification checklist:

- Open the client list route.
- Confirm the page title is correct.
- Confirm mock clients are visible.
- Search by name.
- Search by phone.
- Search with a keyword that returns no results.
- Confirm the empty state is shown.
- Confirm developer test clients show the "测试" tag.
- Tap a client and confirm navigation to client detail.
- Use browser back and confirm the list page is kept in the H5 route stack.

### Completion Criteria

The client list slice is complete when:

- Production-shaped client list route exists or is explicitly mapped.
- Client list data comes from `clientRepositoryMock`.
- No legacy API client is imported by the feature.
- No legacy base UI component is copied wholesale.
- The list supports search, empty, loading, error, and success states.
- Test client tagging is represented if supported by the domain type.
- Client cards navigate to client detail.
- `pnpm lint` passes.
- `pnpm format:check` passes.
- `pnpm test` passes.

## Slice 2: Client Detail Hub Page

### Goal

Migrate the client detail hub page from the legacy project into this project with mock data.

The first client detail delivery should cover:

- Client detail route.
- Mock-backed client detail query.
- Loading, error, and success UI states.
- Client name display.
- Developer test client notice.
- Entry to meal plans.
- Entry to client settings.
- Destination entry placeholder behavior.
- Back navigation through the H5 route stack.

The first delivery does not need to cover:

- All client setting sub-pages.
- Meal plan list contents.
- Destination hybrid navigation.
- Name and remark editing.
- Payment method, cards, departments, managers, cost centers, app versions, notifications, login settings, password settings, meal types, meal groups, or meal point configuration.
- Legacy `ScrollView`, `NavBar`, `NoticeBar`, `Toast`, `SafeArea`, `List`, `Switch`, `Dialog`, or `Spinner` migration.

Those should be handled as separate slices after the detail hub is stable.

### Legacy Source Files

Use these legacy files as the source of behavior:

Expected source files:

```txt
/Users/yxc/code/planet-h5/src/apps/client/client-detail/index.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-detail/Detail.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-detail/Setting.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-detail/MealPlans.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-detail/constants/index.ts
/Users/yxc/code/planet-h5/src/apps/client/client-detail/hooks/index.tsx
```

Read-only reference files for later slices:

```txt
/Users/yxc/code/planet-h5/src/apps/client/client-detail/hooks/useSettingList.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-detail/NameAndRemark.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-detail/NameAndRemarkEdit.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-detail/Manager.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-detail/Department.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-detail/CostCenter.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-detail/LoginSetting.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-detail/PasswordSetting.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-detail/Notification.tsx
```

`Setting.tsx` and `MealPlans.tsx` are reference files for entry behavior in this slice. Their full contents should be migrated in later slices.

### Legacy Behavior Summary

The legacy detail hub does the following:

- Reads the client id from route params.
- Fetches client detail.
- Shows a top navigation bar with a setting icon.
- Displays the client name.
- Shows a "测试客户" notice when the client is marked as developer test.
- Shows an entry for "用餐计划".
- Shows an entry for "目的地".
- Tapping "用餐计划" pushes the same route with client detail page state `plan`.
- Tapping the setting icon pushes the same route with client detail page state `setting`.
- Tapping "目的地" opens a hybrid destination page in the app; outside hybrid it shows a toast.

For the first migrated slice, preserve the visible hub and route transitions. Replace destination hybrid navigation with a placeholder message or disabled entry until hybrid behavior is explicitly migrated.

### Target Files

Expected target files for this slice:

```txt
src/domain/client/Client.ts
src/domain/client/ClientRepository.ts
src/application/client/getClientDetail.ts
src/infrastructure/mock/clientMockData.ts
src/infrastructure/repositories/client/clientRepository.mock.ts
src/infrastructure/query/queryKeys.ts
src/features/client/queries/useClientDetailQuery.ts
src/features/client/views/ClientDetailView.tsx
src/features/client/views/ClientDetailReadView.tsx
src/pages/client/ClientDetailRoute.tsx
src/app/router/routeMeta.ts
src/app/router/routeTree.tsx
```

Optional target files if the view grows:

```txt
src/features/client/components/ClientDetailEntry.tsx
src/features/client/components/ClientDeveloperNotice.tsx
```

Create these feature components only if they make the view easier to read. They carry client business meaning and should not be placed in `shared/ui`.

### Step 1: Confirm Route Shape

The legacy production detail route is:

```txt
/ops/client/:id
```

The migrated TanStack Router route should use:

```txt
/ops/client/$clientId
```

Update or confirm:

```txt
src/app/router/routeMeta.ts
src/app/router/routeTree.tsx
src/pages/client/ClientDetailRoute.tsx
```

Route entry rules:

- Keep `ClientDetailRoute` responsible for route params, query state, navigation callbacks, and mode dispatch only.
- Prefer `routeParams?.clientId` from `RouteStack`, then fall back to `useParams({ strict: false, shouldThrow: false })`.
- Do not place client detail layout or business card rendering in the route file.
- Do not use legacy `location.state.pageType` in feature views.

### Step 2: Preserve Same-URL Mode Boundaries

The legacy client detail uses `location.state.pageType` for sub-pages. In the new project, same-URL modes must use:

```txt
src/app/router/historyState.ts
src/app/router/RouteModeSwitch.tsx
```

For this slice, the detail hub is the default page.

Current code already registers these same-URL modes in `src/pages/client/ClientDetailRoute.tsx`:

```txt
plan
setting
nameAndRemark
nameAndRemarkEdit
mealPoint
manager
costCenter
appVersion
notification
support
mealType
fieldSetting
loginSetting
department
mealGroup
passwordSetting
```

Treat this section as historical guidance for the detail hub slice. For future client-detail slices, keep using `routeModeState(...)` and `RouteModeSwitch`; do not introduce separate URL paths or feature-level `location.state` reads for these same-resource pages.

If a placeholder is needed, keep it in the page layer or a clearly named feature placeholder. Do not model unfinished pages as domain concepts.

### Step 3: Model Client Detail Data

Update or confirm:

```txt
src/domain/client/Client.ts
```

The client detail hub needs at least:

```ts
export type ClientDetail = ClientSummary & {
  fields: Record<string, string>;
  planIds: string[];
};
```

`ClientSummary` should include:

```ts
isDeveloperTest?: boolean;
```

If the hub needs additional display fields, add them as domain business fields, not UI fields. Do not mirror the full legacy API response shape.

### Step 4: Extend Mock Data

Update:

```txt
src/infrastructure/mock/clientMockData.ts
```

The mock detail data should cover:

- A normal client.
- A developer test client.
- A client with one or more plan ids.
- A client without plan ids.
- Detail fields needed by the first hub display.

Do not add mock data for all setting sub-pages yet. Add those fields in the slice that migrates the setting.

### Step 5: Implement Mock Repository Behavior

Update:

```txt
src/infrastructure/repositories/client/clientRepository.mock.ts
```

The repository should:

- Return `ClientDetail` from `getClientDetail(clientId)`.
- Preserve `isDeveloperTest`.
- Throw a stable error when `clientId` does not exist.
- Avoid mutating detail data in read methods.

Do not import from `features`.

Do not call legacy generated APIs.

### Step 6: Keep Use Case Thin

Update or confirm:

```txt
src/application/client/getClientDetail.ts
```

Expected responsibility:

- Accept a `ClientRepository`.
- Accept `clientId`.
- Call `repository.getClientDetail(clientId)`.
- Return the result.

Do not add route handling, UI fallback text, or query cache behavior to the use case.

### Step 7: Wire Query Key And Query Hook

Update or confirm:

```txt
src/infrastructure/query/queryKeys.ts
src/features/client/queries/useClientDetailQuery.ts
```

Rules:

- Query keys remain centralized.
- Query hook imports `getClientDetail`.
- Query hook imports `clientRepositoryMock`.
- Query hook does not import Axios or legacy API clients.
- Query hook should be safe when the route param is temporarily empty during route stack rendering. If needed, add an `enabled: Boolean(clientId)` guard.

### Step 8: Build The Detail Hub View

Update:

```txt
src/features/client/views/ClientDetailView.tsx
src/features/client/views/ClientDetailReadView.tsx
```

The first migrated hub should compose:

- Page title: `客户详情`.
- Back button.
- Client name as the primary content.
- Developer test notice when `client.isDeveloperTest` is true.
- Entry row for `用餐计划`.
- Entry row for `目的地`.
- Setting entry, either as a top action or a visible row depending on the available shared UI.

Recommended callbacks:

```ts
type ClientDetailViewProps = {
  client: ClientDetail;
  onBack: () => void;
  onOpenPlans: () => void;
  onOpenSettings: () => void;
  onOpenDestination: () => void;
};
```

Keep destination behavior explicit:

- If hybrid navigation is not migrated, show disabled or placeholder behavior.
- Do not import `@planet-fe/hybrid-js-sdk` in this slice.
- Do not add SSO or token assumptions.

### Step 9: UI Component Scope

Use existing shared primitives first:

```txt
src/shared/ui/Page
src/shared/ui/Feedback
src/shared/ui/DataDisplay
src/shared/ui/Form
src/shared/assets/icons
```

Do not migrate the full legacy detail UI component stack for this slice:

```txt
/Users/yxc/code/planet-h5/src/comps/ScrollView.tsx
/Users/yxc/code/planet-h5/src/comps/NavBar.tsx
/Users/yxc/code/planet-h5/src/comps/NoticeBar.tsx
/Users/yxc/code/planet-h5/src/comps/SafeArea.tsx
/Users/yxc/code/planet-h5/src/comps/ToastComponent.tsx
/Users/yxc/code/planet-h5/src/comps/list
/Users/yxc/code/planet-h5/src/comps/dialog
```

If the detail hub needs entry rows or notices, prefer feature components under:

```txt
src/features/client/components
```

Only add shared UI when the primitive is business-agnostic and already needed by more than one feature.

### Step 10: Add Focused Tests

Recommended tests:

```txt
src/application/client/clientUseCases.test.ts
src/infrastructure/repositories/client/clientRepository.mock.test.ts
src/features/client/queries/useClientDetailQuery.test.tsx
```

Add route metadata tests if route metadata changes:

```txt
src/app/router/routeMeta.test.ts
```

Test cases:

- Returns client detail by id.
- Throws for an unknown client id.
- Preserves `isDeveloperTest` on detail.
- Query hook returns client detail for a valid id.
- Detail route metadata includes `/ops/client/$clientId`.

Add view tests if meaningful:

```txt
src/features/client/views/ClientDetailView.test.tsx
```

View test cases:

- Shows client name.
- Shows developer test notice for a test client.
- Does not show developer test notice for a normal client.
- Calls `onOpenPlans` when the meal plan entry is clicked.
- Calls `onOpenSettings` when the settings entry is clicked.

### Step 11: Verify The Slice

Run:

```bash
pnpm lint
pnpm format:check
pnpm test
```

For route or shared UI changes, also run:

```bash
pnpm build
```

Manual verification checklist:

- Open `/ops/client`.
- Tap a client card.
- Confirm navigation to `/ops/client/$clientId`.
- Confirm the client name is visible.
- Confirm developer test clients show a test notice.
- Confirm normal clients do not show a test notice.
- Confirm loading and error states render correctly.
- Tap back and confirm the list page is still in the H5 route stack.
- Confirm meal plan and settings entries do not crash, even if they are placeholders.
- Confirm no real network request is made.

### Completion Criteria

The client detail hub slice is complete when:

- Production-shaped client detail route exists.
- Client detail data comes from `clientRepositoryMock`.
- No legacy API client is imported by the feature.
- No legacy base UI component is copied wholesale.
- The hub shows client name and developer test notice.
- The hub exposes meal plan and settings entries for later slices.
- Destination behavior is explicitly placeholder or disabled until hybrid migration.
- Loading, error, and success states are handled.
- `pnpm lint` passes.
- `pnpm format:check` passes.
- `pnpm test` passes.

## Remaining Slice Order

Migrate the rest from simple to complex:

1. Client detail settings list.
2. Client meal plans list.
3. Plan detail summary.
4. Plan settings list.
5. Name and remark editing.
6. Simple client setting edit pages.
7. Structured client setting edit pages.
8. Simple plan setting edit pages.
9. Structured plan rule edit pages.
10. Client order flow.
11. Shared business capabilities.

This order keeps the first milestone focused on navigation and read-only mock data before introducing mutations, validation, and reusable business workflows.

## Slice 3: Client Detail Settings List

### Goal

Migrate the client detail settings list as a same-URL route mode.

This slice should cover:

- Settings mode from the client detail route.
- Mock-backed setting group and setting summary data.
- Loading, error, empty, and success states.
- Entry rows for all known client setting categories.
- Disabled or placeholder behavior for setting detail pages that are not migrated yet.

This slice should not cover:

- Editing any setting value.
- Full setting detail page migration.
- Legacy popup, dialog, switch, or picker behavior.
- Real API request behavior.

### Legacy Source Files

Use these files as the source of behavior:

```txt
/Users/yxc/code/planet-h5/src/apps/client/client-detail/Setting.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-detail/hooks/useSettingList.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-detail/constants/index.ts
```

Read-only reference files for later slices:

```txt
/Users/yxc/code/planet-h5/src/apps/client/client-detail/NameAndRemark.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-detail/Manager.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-detail/Department.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-detail/CostCenter.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-detail/LoginSetting.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-detail/PasswordSetting.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-detail/Notification.tsx
```

### Target Files

Expected target files:

```txt
src/domain/client/Client.ts
src/application/client/getClientDetail.ts
src/infrastructure/mock/clientMockData.ts
src/infrastructure/repositories/client/clientRepository.mock.ts
src/infrastructure/query/queryKeys.ts
src/features/client/queries/useClientDetailQuery.ts
src/features/client/views/ClientDetailView.tsx
src/features/client/views/ClientSettingsView.tsx
src/pages/client/ClientDetailRoute.tsx
src/app/router/historyState.ts
src/app/router/RouteModeSwitch.tsx
```

Optional feature components:

```txt
src/features/client/components/ClientSettingGroup.tsx
src/features/client/components/ClientSettingRow.tsx
```

### Execution Steps

1. Add or confirm a route mode value for settings, such as `setting`.
2. Keep `ClientDetailRoute` thin: route params, mode dispatch, and callbacks only.
3. Represent setting rows in the domain as business summaries, not UI rows.
4. Add deterministic mock settings for every P1 client setting category.
5. Render grouped settings in `features/client`.
6. For unmigrated rows, keep click behavior explicit: disabled, placeholder, or route-mode push to a placeholder page.
7. Add tests for route mode dispatch and setting list rendering.

### Completion Criteria

- Settings list is reachable from `/ops/client/$clientId` through route state.
- Feature views do not read `location.state`.
- Setting summaries come from mock-backed client detail data or a client settings query.
- Unmigrated setting rows do not crash.
- `pnpm lint`, `pnpm format:check`, and `pnpm test` pass.

## Slice 4: Client Meal Plans List

### Goal

Migrate the meal plans list under the client detail flow.

This slice should cover:

- Meal plans mode from the client detail route.
- Mock-backed plan summaries for a client.
- Empty state for clients without plans.
- Navigation from a plan summary to plan detail.

This slice should not cover:

- Plan detail business fields beyond summary navigation.
- Plan settings forms.
- Order flow.

### Legacy Source Files

Use these files as the source of behavior:

```txt
/Users/yxc/code/planet-h5/src/apps/client/client-detail/MealPlans.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-detail/hooks/index.tsx
/Users/yxc/code/planet-h5/src/apps/client/plan-detail
```

### Target Files

Expected target files:

```txt
src/domain/client/Client.ts
src/domain/plan/Plan.ts
src/infrastructure/mock/clientMockData.ts
src/infrastructure/mock/planMockData.ts
src/features/client/views/ClientMealPlansView.tsx
src/pages/client/ClientDetailRoute.tsx
src/app/router/routeTree.tsx
src/app/router/routeMeta.ts
```

### Execution Steps

1. Add or confirm a route mode value for meal plans, such as `plan`.
2. Use existing client detail mock data if `ClientDetail.mealPlans` already covers the list.
3. If the plan summary needs more fields, add them to `domain/plan` and mock data.
4. Render loading, error, empty, and success states.
5. Navigate to the production-shaped plan detail route:

```txt
/ops/client/$clientId/plan/$planId
```

6. Add route metadata and route tests when adding the production-shaped route.

### Completion Criteria

- Meal plans list is reachable from client detail.
- Clients with no plans show an empty state.
- Plan rows navigate to plan detail.
- No plan settings edit behavior is included yet.
- `pnpm lint`, `pnpm format:check`, and `pnpm test` pass.

## Slice 5: Plan Detail Summary

### Goal

Migrate the read-only plan detail summary page.

This slice should cover:

- Production-shaped plan detail route.
- Mock-backed plan detail query.
- Plan name and core summary fields.
- Entry to plan settings.
- Loading, error, empty, and success states.

This slice should not cover:

- Editing plan settings.
- Order pages.
- Complex rule editors.

### Legacy Source Files

Use these files as the source of behavior:

```txt
/Users/yxc/code/planet-h5/src/apps/client/plan-detail
```

Reference-only for later slices:

```txt
/Users/yxc/code/planet-h5/src/apps/client/plan-setting
/Users/yxc/code/planet-h5/src/apps/client/client-order
```

### Target Files

Expected target files:

```txt
src/domain/plan/Plan.ts
src/domain/plan/PlanRepository.ts
src/application/plan/getPlanDetail.ts
src/infrastructure/mock/planMockData.ts
src/infrastructure/repositories/plan/planRepository.mock.ts
src/infrastructure/query/queryKeys.ts
src/features/plan/queries/usePlanDetailQuery.ts
src/features/plan/views/PlanDetailView.tsx
src/pages/plan/PlanDetailRoute.tsx
src/app/router/routeTree.tsx
src/app/router/routeMeta.ts
```

### Execution Steps

1. Add or confirm:

```txt
/ops/client/$clientId/plan/$planId
```

2. Keep `PlanDetailRoute` responsible for params and navigation callbacks only.
3. Model only fields needed for the first summary screen.
4. Add deterministic plan mock data linked to client mock data.
5. Implement `getPlanDetail` through `planRepositoryMock`.
6. Render settings entry and wire it to the production-shaped settings route.
7. Add use case, repository, query hook, and route metadata tests.

### Completion Criteria

- Plan detail is reachable from the client meal plans list.
- Plan detail data comes from `planRepositoryMock`.
- The settings entry navigates to `/ops/client/$clientId/plan/$planId/setting`.
- No legacy API client is imported.
- `pnpm lint`, `pnpm format:check`, and `pnpm test` pass.

## Slice 6: Plan Settings List

### Goal

Migrate the plan settings list as a read-only list of setting entries.

This slice should cover:

- Production-shaped plan settings route.
- Mock-backed plan settings summaries.
- Grouped setting rows.
- Placeholder or disabled behavior for setting detail editors not migrated yet.

This slice should not cover:

- Saving setting changes.
- Complex rule validation.
- Merchant selection, location selection, or order-rule subflows.

### Legacy Source Files

Use these files as the source of behavior:

```txt
/Users/yxc/code/planet-h5/src/apps/client/plan-setting
```

### Target Files

Expected target files:

```txt
src/domain/plan/Plan.ts
src/domain/plan/PlanRepository.ts
src/application/plan/getPlanDetail.ts
src/infrastructure/mock/planMockData.ts
src/infrastructure/repositories/plan/planRepository.mock.ts
src/infrastructure/query/queryKeys.ts
src/features/plan/views/PlanSettingsView.tsx
src/pages/plan/PlanSettingsRoute.tsx
src/app/router/routeTree.tsx
src/app/router/routeMeta.ts
```

### Execution Steps

1. Add or confirm:

```txt
/ops/client/$clientId/plan/$planId/setting
```

2. Map legacy setting entries to stable plan setting summary ids.
3. Add only summary values needed by the list.
4. Keep entry click behavior explicit for unmigrated editors.
5. Add route metadata tests and focused view tests.

### Completion Criteria

- Plan settings list is reachable from plan detail.
- All P1 plan setting entries are represented as summaries.
- Unmigrated setting editors are not silently linked to missing pages.
- `pnpm lint`, `pnpm format:check`, and `pnpm test` pass.

## Slice 7: Name And Remark Editing

### Goal

Migrate the simplest client edit flow first.

This slice should cover:

- Name and remark read page or same-URL mode.
- Name and remark edit mode.
- Mock mutation.
- Query cache update or invalidation.
- Dirty state and discard confirmation if the legacy flow requires it.

This slice should not cover:

- Other client settings.
- Shared form abstractions beyond existing primitives.
- Real API save behavior.

### Legacy Source Files

Use these files as the source of behavior:

```txt
/Users/yxc/code/planet-h5/src/apps/client/client-detail/NameAndRemark.tsx
/Users/yxc/code/planet-h5/src/apps/client/client-detail/NameAndRemarkEdit.tsx
```

### Target Files

Expected target files:

```txt
src/domain/client/Client.ts
src/domain/client/clientRules.ts
src/domain/client/ClientRepository.ts
src/application/client/updateClient.ts
src/infrastructure/repositories/client/clientRepository.mock.ts
src/features/client/mutations/useUpdateClientMutation.ts
src/features/client/store/clientDetailUiStore.ts
src/features/client/views/ClientDetailReadView.tsx
src/features/client/views/ClientDetailEditView.tsx
src/pages/client/ClientDetailRoute.tsx
```

### Execution Steps

1. Model update input as a use-case command.
2. Add validation to domain rules, application code, or a Zod schema.
3. Implement deterministic in-memory mutation in `clientRepositoryMock`.
4. Update or invalidate `queryKeys.clients.detail(clientId)`.
5. Keep route mode handling in the page layer.
6. Add tests for validation, mutation behavior, cache update, and mode dispatch.

### Completion Criteria

- Name and remark can be edited with mock data.
- The client detail hub reflects saved values after mutation.
- Invalid input is blocked with business validation.
- `pnpm lint`, `pnpm format:check`, and `pnpm test` pass.

## Slice 8: Simple Client Setting Edit Pages

### Goal

Migrate client settings that are mostly scalar toggles, selectors, or short forms.

Suggested order:

1. Support configuration.
2. Login setting.
3. Password setting.
4. Notification.
5. App version.

### Legacy Source Files

Use the matching files under:

```txt
/Users/yxc/code/planet-h5/src/apps/client/client-detail
```

### Target Areas

Use the existing client module:

```txt
src/domain/client
src/application/client
src/infrastructure/mock/clientMockData.ts
src/infrastructure/repositories/client/clientRepository.mock.ts
src/features/client
src/pages/client
```

### Execution Steps

1. Migrate one setting per PR-sized slice.
2. Add a domain type only when the setting is a durable business concept.
3. Use Zod and React Hook Form for structured input.
4. Use mock mutations and centralized query keys.
5. Keep feature views unaware of route state.
6. Add focused tests for each setting.

### Completion Criteria

- Each setting has explicit read, edit, save, cancel, and error behavior.
- Validation is not inline in route components.
- Related client detail or settings queries update after save.
- `pnpm lint`, `pnpm format:check`, and `pnpm test` pass after each setting.

## Slice 9: Structured Client Setting Edit Pages

### Goal

Migrate client settings with larger data models or reusable selectors.

Suggested order:

1. Manager.
2. Department.
3. Cost center.
4. Field setting.
5. Meal point.
6. Meal type.
7. Meal group.

### Execution Steps

1. Before each setting, identify whether a reusable business selector is required.
2. If a selector is business-aware, place it under `src/features/<business>`, not `shared/ui`.
3. Add mock data that covers empty, single-selection, multiple-selection, and disabled cases as needed.
4. Keep selection and save commands in application use cases.
5. Add tests at repository, use-case, and view levels when the setting spans multiple modules.

### Completion Criteria

- Structured setting state is represented in domain or application types.
- Reusable business selectors do not import legacy API clients.
- Cross-module behavior is covered by focused tests.
- `pnpm lint`, `pnpm format:check`, and `pnpm test` pass after each setting.

## Slice 10: Simple Plan Setting Edit Pages

### Goal

Migrate plan settings that are simple switches, text fields, or numeric fields.

Suggested order:

1. Base info.
2. Menu style.
3. Hide price.
4. Hide price and meal point.
5. Dish remark.
6. Delivery remark.
7. Pick up meal code.
8. Finance config.
9. Maximum order amount.
10. Merchant order verification.
11. Hidden account types.
12. Disable append dish.

### Execution Steps

1. Migrate one setting at a time.
2. Extend `Plan` and `PlanRepository` only with fields needed by the setting.
3. Add or extend `savePlanSettings` commands.
4. Use Zod for typed form validation.
5. Update `queryKeys.plans.detail(clientId, planId)` or the existing centralized plan key shape.
6. Add tests for validation and mock mutation behavior.

### Completion Criteria

- Simple plan settings save against mock data.
- Plan detail and settings list reflect saved changes.
- No HTTP repository is required for acceptance.
- `pnpm lint`, `pnpm format:check`, and `pnpm test` pass after each setting.

## Slice 11: Structured Plan Rule Edit Pages

### Goal

Migrate plan settings with scheduling, ordering, restrictions, or location-specific rules.

Suggested order:

1. Open times.
2. Operation day.
3. Occupation time.
4. Restriction.
5. Order rule.
6. Order transfer.
7. Manually confirm order.
8. Pick up setting.
9. Location setting.

### Target Areas

Use:

```txt
src/domain/plan
src/application/plan
src/features/plan
src/features/setting-rule
src/infrastructure/mock/planMockData.ts
src/infrastructure/repositories/plan/planRepository.mock.ts
```

### Execution Steps

1. Reuse `features/setting-rule` when the rule is generic enough for multiple plan settings.
2. Keep plan-specific meaning in `features/plan`.
3. Model reusable business rules in `domain/plan`.
4. Use React Hook Form and Zod for structured forms.
5. Add mock edge cases for conflicting times, disabled days, empty restrictions, and invalid amounts where applicable.
6. Add domain rule tests before view tests for complex validation.

### Completion Criteria

- Complex plan rules are validated outside route components.
- Reusable rule UI is not duplicated across plan setting pages.
- Mock data covers at least one valid and one invalid or edge case per rule type.
- `pnpm lint`, `pnpm format:check`, `pnpm test`, and `pnpm build` pass for broad rule-editor changes.

## Slice 12: Client Order Flow

### Goal

Migrate client order pages after the core client and plan flows are stable.

This slice should cover:

- Production-shaped order route.
- `orderParams` parsing.
- Client member order list.
- Client order detail.
- Merchant schedule info.
- Price summary.
- Default time schedule behavior.

### Legacy Source Files

Use these files as the source of behavior:

```txt
/Users/yxc/code/planet-h5/src/apps/client/client-order
```

### Target Files

Expected target module:

```txt
src/domain/order
src/application/order
src/infrastructure/mock/orderMockData.ts
src/infrastructure/repositories/order/orderRepository.mock.ts
src/features/order
src/pages/order
```

Also update:

```txt
src/infrastructure/query/queryKeys.ts
src/app/router/routeTree.tsx
src/app/router/routeMeta.ts
```

### Execution Steps

1. Add the route:

```txt
/ops/client/$clientId/plan/$planId/order/$orderParams
```

2. Parse `orderParams` at the page or application boundary.
3. Model order status, amount, schedule, and price summary once in `domain/order`.
4. Add mock records for multiple order statuses and price summary cases.
5. Add list and detail use cases.
6. Add query hooks and feature views.
7. Add repository, use-case, query hook, route metadata, and route-param parsing tests.

### Completion Criteria

- Order list and detail work from deterministic mock data.
- Order display rules are not duplicated across views.
- Invalid `orderParams` produce a controlled error state.
- `pnpm lint`, `pnpm format:check`, `pnpm test`, and `pnpm build` pass.

## Slice 13: Shared Business Capabilities

### Goal

Migrate reusable business capabilities only after at least one migrated flow needs them.

Candidates:

- Select merchant.
- Select Mc staff.
- Payment method.
- Client member.
- Card setting.

### Legacy Source Files

Use matching capabilities under:

```txt
/Users/yxc/code/planet-h5/src/biz/features
```

### Placement Rules

- Business-aware reusable flows belong under `src/features/<business>`.
- Business-agnostic primitives belong under `src/shared/ui`.
- Shared business features still use domain contracts, application use cases, mock repositories, and centralized query keys.
- Do not import legacy API clients or hybrid adapters.

### Execution Steps

1. Start from the first concrete consumer flow.
2. Define a narrow component or hook entry point.
3. Add mock data and repository behavior for the business capability.
4. Add integration tests from the consumer feature when the shared capability affects a save flow.
5. Promote only genuinely business-agnostic base controls to `shared/ui`.

### Completion Criteria

- The shared capability has a clear owner module.
- It is used by at least one migrated flow.
- It does not depend on legacy API clients.
- It has focused tests for its data and consumer behavior.
- `pnpm lint`, `pnpm format:check`, and `pnpm test` pass.

## Final Migration Verification

After the remaining slices are complete, verify the main mock-backed production flow:

```txt
/ops/client
  -> /ops/client/$clientId
  -> same URL with meal plans mode
  -> /ops/client/$clientId/plan/$planId
  -> /ops/client/$clientId/plan/$planId/setting
  -> /ops/client/$clientId/plan/$planId/order/$orderParams
```

Run:

```bash
pnpm lint
pnpm format:check
pnpm test
pnpm build
```

Manual verification checklist:

- H5 stack navigation keeps previous pages mounted where expected.
- Same-URL modes are handled by route state and `RouteModeSwitch`.
- Feature views do not read `location.state`.
- All business data comes from mock repositories.
- No migrated feature imports legacy API clients.
- Empty, loading, error, and success states are covered for list and detail pages.
- Save flows update or invalidate centralized query keys.
- Business-aware components stay out of `shared/ui`.
