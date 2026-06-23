# Business Migration V2 Implementation Plan

**Goal:** Migrate the client, plan, and client-order H5 business flows from `/Users/yxc/code/planet-h5` into this project on the `/ops/client...` route contract, backed only by deterministic mock repositories.

---

## Required Reading Before Any Task

- `docs/architecture-design.md`
- `docs/migration-v2/specs.md`
- This plan
- Legacy source files listed in the relevant task

Track task status, pending work, route-mode coverage, and implementation evidence in
`docs/migration-v2/tracker.md`. If it does not exist, create it in Task 1.

## Execution Checklist For Every Task

Use this checklist while executing each task.

- Work in small TDD loops: failing test, run and confirm failure, minimal implementation, run and confirm pass.
- For client-owned migration slices, delete the current-project implementation for that slice before rebuilding from the legacy source inventory. Keep only non-business shared primitives or infrastructure, and record any exception in `tracker.md`.
- For every task, update the status summary in `docs/migration-v2/tracker.md` when status changes, and append evidence when work is completed.
- Commit after each task when the tree is coherent. Suggested commit messages are included; adjust them when the actual scope differs.

## Standard Verification Commands

Run these before handing back any migrated code:

```bash
pnpm lint
pnpm format:check
pnpm test
```

Also run `pnpm e2e` for Tasks 2, 3, 4, 7, and 10. Also run `pnpm build` for Tasks 2, 7, and 12.

## Playwright Coverage Contract

Only add Playwright flows from this table unless this plan is updated first.

| Task | Flow                                     | Required browser assertion                                                                              |
| ---- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 2    | `/ops/client` smoke                      | Open `/ops/client` in the configured mobile viewport and verify the route renders through Vite.         |
| 3    | Client list to detail                    | Open `/ops/client`, navigate to one client detail, verify `/ops/client/$clientId`, then browser back.   |
| 4    | Client detail to plan detail             | Open `/ops/client/$clientId`, navigate to one plan detail, verify `/ops/client/$clientId/plan/$planId`. |
| 7    | Plan detail to setting and one edit mode | Open plan detail, navigate to setting, open the first implemented edit mode, then browser back twice.   |
| 10   | Client order member list mode            | Open one order detail, enter `clientMemberOrderList` route mode, then browser back to order detail.     |

## Legacy Source Inventory

Inspect the listed old files before implementing the owning task. If a path is missing or behavior differs from this inventory, record the deviation in `docs/migration-v2/tracker.md` before coding.

| Area                  | Legacy source files or symbols                                                                                                                                   | Purpose                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Client list           | `src/apps/client/client-list/index.tsx`, `Detail.tsx`, `comps/Card.tsx`, `hooks/useClientList.tsx`, `helper/normalize.ts`, `types.ts`, `constants/*`             | List fields, filters, cards, loading, empty, error                |
| Client detail         | `src/apps/client/client-detail/index.tsx`, detail view files, `ClientDetailPageEnum`, hooks, helpers, constants, types                                           | Default detail, route modes, field mappings, update commands      |
| Plan detail           | `src/apps/client/plan-detail/index.tsx`, view files, hooks, helpers, constants, types                                                                            | Plan summary fields and default behavior                          |
| Plan settings         | `src/apps/client/plan-setting/index.tsx`, view files, `PlanSettingPageEnum`, hooks, helpers, constants, types                                                    | Settings modes, forms, validation, saves                          |
| Client order          | `src/apps/client/client-order/index.tsx`, order detail and member-order-list views, `ClientOrderPageEnum`, hooks, helpers, constants, types                      | `orderParams`, order status, schedule, member list, price summary |
| Business capabilities | `src/biz/features/payment-method`, `src/biz/features/client-member`, `src/biz/features/select-merchant`, `src/biz/features/select-meican-staff`, `src/biz/comps` | Capability props, validation, local state, save handoff           |
| Shared UI and assets  | `src/comps`, `src/assets/icons`, `src/assets/imgs`                                                                                                               | Business-agnostic primitives and assets                           |
| API reference only    | `src/apis`, `src/apis-gen`, `src/apis-legacy`                                                                                                                    | Field meaning only; never import into new runtime                 |

---

## Task 1: Create Tracker And Baseline Guardrails

**Files:**

- Create or modify: `docs/migration-v2/tracker.md`

**Step 1: Write the tracker skeleton**

Create `docs/migration-v2/tracker.md` with this structure:

```markdown
# Business Migration V2 Tracker

Use this file to track migration task status, pending work, route-mode coverage, and evidence
produced while executing `docs/migration-v2/plan.md`.

Allowed status values: `Not started`, `In progress`, `Completed`, `Blocked`, `Skipped`.

## Status Summary

| Task | Status      | Updated | Notes |
| ---- | ----------- | ------- | ----- |
| 1    | Not started | N/A     |       |

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
```

Add one status row for every task in this plan so the file can answer current pending-work
questions without requiring a separate scan of the plan.

**Step 2: Verify documentation formatting**

Run:

```bash
pnpm format:check docs/migration-v2/plan.md docs/migration-v2/tracker.md
```

Expected: PASS. If Prettier reports formatting differences, run `pnpm format docs/migration-v2/plan.md docs/migration-v2/tracker.md`, then rerun the check.

**Step 3: Record evidence**

Append an entry for Task 1 to `docs/migration-v2/tracker.md`.

**Step 4: Commit**

```bash
git add docs/migration-v2/plan.md docs/migration-v2/tracker.md
git commit -m "docs: prepare migration v2 tracker"
```

## Task 2: Lock The `/ops/client...` Route Contract

**Files:**

- Modify: `src/app/router/router.test.ts`
- Modify: `src/app/router/RouteStack.test.tsx`
- Modify: `src/app/router/routeTree.tsx`
- Modify: `src/pages/client/ClientListRoute.tsx`
- Modify: `src/pages/client/ClientDetailRoute.tsx`
- Modify: `src/pages/plan/PlanDetailRoute.tsx`
- Modify: `src/pages/plan/PlanSettingsRoute.tsx`
- Modify: `src/pages/order/ClientOrderRoute.tsx`
- Modify or create: `e2e/client-list.spec.ts`
- Modify: `docs/migration-v2/tracker.md`

**Step 1: Write failing router registration tests**

In `src/app/router/router.test.ts`, prove these paths match:

```txt
/ops/client
/ops/client/$clientId
/ops/client/$clientId/plan/$planId
/ops/client/$clientId/plan/$planId/setting
/ops/client/$clientId/plan/$planId/order/$orderParams
```

Run:

```bash
pnpm test src/app/router/router.test.ts
```

Expected: FAIL for any missing route registration.

**Step 2: Write route compatibility tests**

In `src/app/router/router.test.ts`, prove all five `/ops/client...` routes match and that no migrated client, plan, or order compatibility routes exist outside `/ops/client...`.

Run:

```bash
pnpm test src/app/router/router.test.ts
```

Expected: FAIL for any missing route or unexpected compatibility route.

**Step 3: Write failing RouteStack root test**

In `src/app/router/RouteStack.test.tsx`, prove the root route renders `RouteStack` and route stack rendering does not use a separate pathname matcher.

Run:

```bash
pnpm test src/app/router/RouteStack.test.tsx
```

Expected: FAIL if the root route does not render through `RouteStack`.

**Step 4: Write or update Playwright smoke**

In `e2e/client-list.spec.ts`, add a mobile-viewport test that opens `/ops/client` through the Vite server and verifies visible client-list content or a deterministic loading/empty state.

Run:

```bash
pnpm e2e e2e/client-list.spec.ts
```

Expected: FAIL until the route renders.

**Step 5: Implement the minimal route contract**

Register or confirm these TanStack Router paths in `src/app/router/routeTree.tsx`:

```txt
/ops/client
/ops/client/$clientId
/ops/client/$clientId/plan/$planId
/ops/client/$clientId/plan/$planId/setting
/ops/client/$clientId/plan/$planId/order/$orderParams
```

Ensure each route entry renders through:

```tsx
<RouteModeSwitch
  defaultPage={<FeatureView />}
  modes={
    {
      /* route modes */
    }
  }
/>
```

For param-reading routes, use this pattern:

```tsx
const params = useParams({ strict: false, shouldThrow: false });
```

**Step 6: Run focused tests**

```bash
pnpm test src/app/router/router.test.ts src/app/router/RouteStack.test.tsx
pnpm e2e e2e/client-list.spec.ts
pnpm build
```

Expected: PASS.

**Step 7: Record evidence and commit**

Append Task 2 evidence to `docs/migration-v2/tracker.md`, then:

```bash
git add src/app/router src/pages e2e/client-list.spec.ts docs/migration-v2/tracker.md
git commit -m "test: lock ops client route contract"
```

## Task 3: Migrate Client List

**Files:**

- Modify: `src/domain/client/Client.ts`
- Modify: `src/domain/client/ClientRepository.ts`
- Modify: `src/domain/client/clientRules.test.ts`
- Modify: `src/application/client/getClientList.ts`
- Modify: `src/application/client/clientUseCases.test.ts`
- Modify: `src/infrastructure/mock/clientMockData.ts`
- Modify: `src/infrastructure/repositories/client/clientRepository.mock.ts`
- Modify: `src/infrastructure/repositories/client/clientRepository.mock.test.ts`
- Modify: `src/infrastructure/repositories/client/index.ts`
- Modify: `src/infrastructure/query/queryKeys.ts`
- Modify: `src/features/client/queries/useClientListQuery.ts`
- Modify: `src/features/client/queries/useClientListQuery.test.tsx`
- Modify: `src/features/client/store/clientListStore.ts`
- Modify: `src/features/client/components/ClientCard.tsx`
- Modify: `src/features/client/components/ClientStatusTag.tsx`
- Modify: `src/features/client/views/ClientListView.tsx`
- Modify: `src/pages/client/ClientListRoute.tsx`
- Modify: `e2e/client-list.spec.ts`
- Modify: `docs/migration-v2/tracker.md`

**Step 1: Inspect legacy client list files**

Read the legacy client-list files from the inventory. Record exact file paths and important symbols in `tracker.md`.

**Step 2: Write failing domain, use-case, and repository tests**

Cover:

- Keyword filtering by name.
- Keyword filtering by phone.
- Empty result for unmatched keyword.
- Deterministic ordering.
- Missing or invalid params.
- Developer-test client tag data.

Run:

```bash
pnpm test src/domain/client/clientRules.test.ts src/application/client/clientUseCases.test.ts src/infrastructure/repositories/client/clientRepository.mock.test.ts
```

Expected: FAIL for missing migrated behavior.

**Step 3: Write failing query-hook test**

In `src/features/client/queries/useClientListQuery.test.tsx`, prove committed params are included in `queryKeys`, draft local state is excluded, and deterministic mock results are returned.

Run:

```bash
pnpm test src/features/client/queries/useClientListQuery.test.tsx
```

Expected: FAIL until query keys and hook behavior match.

**Step 4: Write failing view and Playwright tests**

Add React Testing Library coverage for loading, empty, error, populated list, developer-test tag, and navigation to `/ops/client/$clientId`.

Update Playwright to open `/ops/client`, tap one client, verify `/ops/client/$clientId`, then browser back.

Run:

```bash
pnpm test src/features/client/views
pnpm e2e e2e/client-list.spec.ts
```

Expected: FAIL until the UI and navigation are implemented.

**Step 5: Implement minimal client list migration**

Keep server state in TanStack Query. Use Zustand only for draft filters or scroll state. Put list filter query params in the query hook, status values and pure mappings in `domain`, and card display labels in `features/client`.

The route entry should stay this small:

```tsx
export function ClientListRoute() {
  return <RouteModeSwitch defaultPage={<ClientListView />} />;
}
```

**Step 6: Run focused verification**

```bash
pnpm test src/domain/client/clientRules.test.ts src/application/client/clientUseCases.test.ts src/infrastructure/repositories/client/clientRepository.mock.test.ts src/features/client/queries/useClientListQuery.test.tsx src/features/client/views
pnpm e2e e2e/client-list.spec.ts
```

Expected: PASS.

**Step 7: Record evidence and commit**

```bash
git add src/domain/client src/application/client src/infrastructure/mock/clientMockData.ts src/infrastructure/repositories/client src/infrastructure/query/queryKeys.ts src/features/client src/pages/client/ClientListRoute.tsx e2e/client-list.spec.ts docs/migration-v2/tracker.md
git commit -m "feat: migrate client list"
```

## Task 4: Migrate Client Detail Default Page

**Files:**

- Modify: `src/pages/client/ClientDetailRoute.tsx`
- Modify: `src/pages/client/ClientDetailRoute.test.tsx`
- Modify: `src/features/client/views/ClientDetailView.tsx`
- Modify: `src/features/client/views/ClientDetailReadView.tsx`
- Modify: `src/features/client/queries/useClientDetailQuery.ts`
- Modify: `src/features/client/mutations/useUpdateClientMutation.ts`
- Modify: `src/application/client/getClientDetail.ts`
- Modify: `src/application/client/updateClient.ts`
- Modify: `src/application/client/clientUseCases.test.ts`
- Modify: `src/domain/client/Client.ts`
- Modify: `src/domain/client/ClientRepository.ts`
- Modify: `src/infrastructure/repositories/client/clientRepository.mock.ts`
- Modify: `src/infrastructure/repositories/client/clientRepository.mock.test.ts`
- Modify: `src/infrastructure/mock/clientMockData.ts`
- Modify: `src/infrastructure/query/queryKeys.ts`
- Modify: `e2e/client-list.spec.ts`
- Modify: `docs/migration-v2/tracker.md`

**Step 1: Inspect legacy client detail files**

Read old client detail routes, `ClientDetailPageEnum`, helpers, constants, and hooks. Record route modes found and whether each is reachable.

**Step 2: Write failing query and use-case tests**

Cover detail key includes `clientId`, deterministic detail read, missing client, and each update command migrated in this task.

Run:

```bash
pnpm test src/application/client/clientUseCases.test.ts src/infrastructure/repositories/client/clientRepository.mock.test.ts
```

Expected: FAIL until detail behavior exists.

**Step 3: Write failing route and view tests**

Cover default detail loading, error, success, unknown route-mode fallback, implemented route-mode dispatch, and params passed from `RouteStackPageProps`.

Run:

```bash
pnpm test src/pages/client/ClientDetailRoute.test.tsx src/features/client/views
```

Expected: FAIL until the route and views render.

**Step 4: Write failing Playwright navigation**

Add browser flow from `/ops/client/$clientId` to one plan detail and verify `/ops/client/$clientId/plan/$planId`.

Run:

```bash
pnpm e2e e2e/client-list.spec.ts
```

Expected: FAIL until the detail page links to a plan.

**Step 5: Implement default detail page**

Render through `RouteModeSwitch`. Feature views must receive ordinary props and callbacks; they must not read `location.state`. Translate backend-like fields into domain entities and deterministic fixtures.

**Step 6: Inventory client detail route modes**

Use this inventory while implementing focused modes in later tasks. Track execution status in `docs/migration-v2/tracker.md`.

| Route mode                                                                                                                                                                                | Target                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `plan`                                                                                                                                                                                    | `ClientMealPlansView`                       |
| `setting`                                                                                                                                                                                 | `ClientSettingsView`                        |
| `nameAndRemark`                                                                                                                                                                           | `ClientNameAndRemarkView`                   |
| `nameAndRemarkEdit`                                                                                                                                                                       | `ClientDetailEditView` or focused edit view |
| `notification`                                                                                                                                                                            | `ClientNotificationSettingsView`            |
| `paymentMethod`                                                                                                                                                                           | `features/payment-method` capability        |
| `mealType`, `mealTypeSetting`, `mealGroup`, `mealPoint`                                                                                                                                   | meal-setting views                          |
| `manager`, `support`, `supportEdit`                                                                                                                                                       | manager/support views                       |
| `department`, `departmentEdit`                                                                                                                                                            | department views                            |
| `costCenter`, `costCenterEdit`                                                                                                                                                            | cost-center views                           |
| `appVersion`                                                                                                                                                                              | app-version view                            |
| `meicanCard`, `externalCard`                                                                                                                                                              | `features/card-setting` capability          |
| `fieldSetting`, `fieldSettingDetail`                                                                                                                                                      | field-setting views                         |
| `loginSetting`, `loginSettingEmployeeNumber`, `loginSettingThirdParty`, `loginSettingThirdPartyDetail`, `loginSettingThirdPartyAssociateSetting`, `loginSettingThirdPartyMealplanSetting` | login-setting views                         |
| `passwordSetting`, `passwordComplexitySetting`, `passwordPeriodSetting`                                                                                                                   | password views                              |

Mark a route mode `Completed` in the tracker only after tests, implementation, validation, and evidence exist.

**Step 7: Run focused verification and commit**

```bash
pnpm test src/pages/client/ClientDetailRoute.test.tsx src/application/client/clientUseCases.test.ts src/infrastructure/repositories/client/clientRepository.mock.test.ts src/features/client/views
pnpm e2e e2e/client-list.spec.ts
git add src/pages/client src/features/client src/application/client src/domain/client src/infrastructure/repositories/client src/infrastructure/mock/clientMockData.ts src/infrastructure/query/queryKeys.ts e2e/client-list.spec.ts docs/migration-v2/tracker.md
git commit -m "feat: migrate client detail default page"
```

## Task 5: Migrate One Client Detail Route Mode

**Files:**

- Modify: `src/pages/client/ClientDetailRoute.tsx`
- Modify: `src/pages/client/ClientDetailRoute.test.tsx`
- Modify: `src/features/client/views/*`
- Modify: `src/features/client/mutations/useUpdateClientMutation.ts`
- Modify: `src/features/client/store/clientDetailUiStore.ts`
- Modify: `src/application/client/updateClient.ts`
- Modify: `src/application/client/clientUseCases.test.ts`
- Modify: `src/domain/client/clientRules.ts`
- Modify: `src/domain/client/clientRules.test.ts`
- Modify: `src/infrastructure/repositories/client/clientRepository.mock.ts`
- Modify: `src/infrastructure/repositories/client/clientRepository.mock.test.ts`
- Modify: `src/infrastructure/query/queryKeys.ts`
- Modify: `docs/migration-v2/tracker.md`

**Step 1: Choose one focused mode**

Pick the next highest-value client route mode from Task 4. Do not implement multiple unrelated modes in one loop unless they share the same form, domain rule, and mutation command.

**Step 2: Write failing domain and form tests**

For validation-bearing modes, cover valid examples, invalid examples, default values, valid submit, one invalid input message, save failure, and cancel/back behavior.

Run:

```bash
pnpm test src/domain/client/clientRules.test.ts src/features/client/views
```

Expected: FAIL until the mode behavior exists.

**Step 3: Write failing mutation and route tests**

Cover exact command payload, deterministic mock result, relevant query invalidation or cache update keys, readback when the page displays saved data, route dispatch for the mode, and unknown mode fallback.

Run:

```bash
pnpm test src/pages/client/ClientDetailRoute.test.tsx src/application/client/clientUseCases.test.ts src/infrastructure/repositories/client/clientRepository.mock.test.ts
```

Expected: FAIL until route and mutation support exists.

**Step 4: Implement the focused mode**

Use React Hook Form and Zod for validation-bearing forms. Put pure validation in `domain/client`; put form-only schemas near the feature view. Use Zustand only for drafts or temporary UI state. Shared business capabilities receive context by props and do not save by themselves.

**Step 5: Verify and commit**

```bash
pnpm test src/pages/client/ClientDetailRoute.test.tsx src/domain/client/clientRules.test.ts src/application/client/clientUseCases.test.ts src/infrastructure/repositories/client/clientRepository.mock.test.ts src/features/client/views
git add src/pages/client src/features/client src/application/client src/domain/client src/infrastructure/repositories/client src/infrastructure/query/queryKeys.ts docs/migration-v2/tracker.md
git commit -m "feat: migrate client detail route mode"
```

Repeat Task 5 as a separate task execution for each reachable client detail route mode, or for a tightly coupled mode group, until every reachable mode is `Completed` or recorded as `Skipped` with evidence in the tracker.

## Task 6: Migrate Plan Detail Default Page

**Files:**

- Modify: `src/pages/plan/PlanDetailRoute.tsx`
- Modify or create: `src/pages/plan/PlanDetailRoute.test.tsx`
- Modify: `src/features/plan/views/PlanDetailView.tsx`
- Modify: `src/features/plan/queries/usePlanDetailQuery.ts`
- Modify or create: `src/features/plan/queries/usePlanDetailQuery.test.tsx`
- Modify: `src/application/plan/getPlanDetail.ts`
- Modify: `src/application/plan/planUseCases.test.ts`
- Modify: `src/domain/plan/Plan.ts`
- Modify: `src/domain/plan/PlanRepository.ts`
- Modify: `src/domain/plan/planRules.ts`
- Modify: `src/domain/plan/planRules.test.ts`
- Modify: `src/infrastructure/repositories/plan/planRepository.mock.ts`
- Modify or create: `src/infrastructure/repositories/plan/planRepository.mock.test.ts`
- Modify: `src/infrastructure/repositories/plan/index.ts`
- Modify: `src/infrastructure/mock/planMockData.ts`
- Modify: `src/infrastructure/query/queryKeys.ts`
- Modify: `docs/migration-v2/tracker.md`

**Step 1: Inspect legacy plan detail**

Record old default behavior, display mappings, constants, and whether non-default page types are reachable.

**Step 2: Write failing tests**

Cover:

- Plan detail query key includes `clientId` and `planId`.
- Use case and repository success.
- Missing plan.
- Deterministic display-mapping inputs.
- View loading, error, and success.
- Route passes params to the view.
- Navigation to `/ops/client/$clientId/plan/$planId/setting`.
- Plan detail route registration.

Run:

```bash
pnpm test src/features/plan/queries src/application/plan/planUseCases.test.ts src/domain/plan/planRules.test.ts src/infrastructure/repositories/plan src/pages/plan/PlanDetailRoute.test.tsx src/app/router/router.test.ts
```

Expected: FAIL until plan detail is implemented.

**Step 3: Implement minimal plan detail**

Keep plan detail on `/ops/client/$clientId/plan/$planId`. Keep any settings navigation on `/ops/client/$clientId/plan/$planId/setting`. Translate display mappings by responsibility: pure mappings in domain, use-case orchestration in application, labels and presentation in feature views.

**Step 4: Verify and commit**

```bash
pnpm test src/features/plan/queries src/application/plan/planUseCases.test.ts src/domain/plan/planRules.test.ts src/infrastructure/repositories/plan src/pages/plan/PlanDetailRoute.test.tsx src/app/router/router.test.ts
git add src/pages/plan src/features/plan src/application/plan src/domain/plan src/infrastructure/repositories/plan src/infrastructure/mock/planMockData.ts src/infrastructure/query/queryKeys.ts docs/migration-v2/tracker.md
git commit -m "feat: migrate plan detail"
```

## Task 7: Migrate Plan Settings Route And First Editor

**Files:**

- Modify: `src/pages/plan/PlanSettingsRoute.tsx`
- Modify or create: `src/pages/plan/PlanSettingsRoute.test.tsx`
- Modify: `src/features/plan/views/PlanSettingsView.tsx`
- Modify: `src/features/plan/mutations/useSavePlanSettingsMutation.ts`
- Modify or create: `src/features/plan/mutations/useSavePlanSettingsMutation.test.tsx`
- Modify: `src/features/plan/store/planDraftStore.ts`
- Modify: `src/application/plan/savePlanSettings.ts`
- Modify: `src/application/plan/planUseCases.test.ts`
- Modify: `src/domain/plan/*`
- Modify: `src/infrastructure/repositories/plan/*`
- Modify: `src/infrastructure/mock/planMockData.ts`
- Modify: `src/infrastructure/query/queryKeys.ts`
- Modify: `e2e/client-list.spec.ts`
- Modify: `docs/migration-v2/tracker.md`

**Step 1: Inspect legacy plan settings**

Record `PlanSettingPageEnum` values, default page behavior, form inputs, validation, and save behavior.

**Step 2: Write failing route-mode tests**

Cover default page rendering, the first implemented setting mode, unknown mode fallback, and browser/back behavior where testable.

Run:

```bash
pnpm test src/pages/plan/PlanSettingsRoute.test.tsx
```

Expected: FAIL until route-mode dispatch exists.

**Step 3: Write failing schema, repository, mutation, and view tests**

For the first editor, cover valid and invalid examples, deterministic save, missing plan, exact save command payload, query invalidation or cache update keys, loading, success, validation error, save failure, and cancel/back behavior.

Run:

```bash
pnpm test src/domain/plan src/application/plan/planUseCases.test.ts src/infrastructure/repositories/plan src/features/plan
```

Expected: FAIL until the editor and save path exist.

**Step 4: Write failing Playwright flow**

Open plan detail, navigate to settings, open the first implemented edit mode, then browser back twice.

Run:

```bash
pnpm e2e e2e/client-list.spec.ts
```

Expected: FAIL until settings navigation and route mode work.

**Step 5: Implement the route and first editor**

Render through `RouteModeSwitch`. Convert old `PlanSettingPageEnum` values to `routeMode`. Keep saves in the plan mutation and application use case. Use `features/setting-rule` only for editors shared by both client and plan routes; keep route-specific editors in `features/plan`.

**Step 6: Inventory plan setting modes**

Track execution status for these modes in `docs/migration-v2/tracker.md`.

| Route mode                                                                             | Target                               |
| -------------------------------------------------------------------------------------- | ------------------------------------ |
| `baseInfo`, `baseInfoEdit`                                                             | plan base info read/edit             |
| `operationDay`                                                                         | operation day view                   |
| `restriction`                                                                          | merchant restriction view            |
| `memberCount`                                                                          | member count view if reachable       |
| `clientMemberList`, `clientMemberDetail`                                               | `features/client-member` capability  |
| `openTimesDinnerIn`, `openTimesGroupDelivery`                                          | open-times views                     |
| `maximumOrderAmount`, `hidePrice`, `hidePriceAndMealPoint`                             | price visibility and amount views    |
| `disableAppendDish`, `hiddenAccountTypes`, `dishRemark`, `deliveryRemark`, `orderRule` | order-rule views                     |
| `paymentMethod`, `paymentMethodSelectConfig`                                           | `features/payment-method` capability |
| `manuallyConfirmOrder`, `occupationTime`, `orderTransfer`, `merchantOrderVerification` | order operation views                |
| `pickupSetting`, `pickUpMealCodeRule`, `menuStyle`                                     | pickup/menu views                    |
| `financeConfig`, `financeConfigAmount`, `financeConfigMealType`                        | finance views                        |
| `location`                                                                             | location setting view                |

**Step 7: Verify and commit**

```bash
pnpm test src/pages/plan/PlanSettingsRoute.test.tsx src/domain/plan src/application/plan/planUseCases.test.ts src/infrastructure/repositories/plan src/features/plan
pnpm e2e e2e/client-list.spec.ts
pnpm build
git add src/pages/plan src/features/plan src/application/plan src/domain/plan src/infrastructure/repositories/plan src/infrastructure/mock/planMockData.ts src/infrastructure/query/queryKeys.ts e2e/client-list.spec.ts docs/migration-v2/tracker.md
git commit -m "feat: migrate plan settings route"
```

## Task 8: Migrate One Plan Settings Route Mode

**Files:**

- Modify: `src/pages/plan/PlanSettingsRoute.tsx`
- Modify: `src/pages/plan/PlanSettingsRoute.test.tsx`
- Modify: `src/features/plan/views/*`
- Modify: `src/features/plan/mutations/useSavePlanSettingsMutation.ts`
- Modify: `src/features/plan/store/planDraftStore.ts`
- Modify: `src/application/plan/savePlanSettings.ts`
- Modify: `src/application/plan/planUseCases.test.ts`
- Modify: `src/domain/plan/*`
- Modify: `src/infrastructure/repositories/plan/*`
- Modify: `src/infrastructure/mock/planMockData.ts`
- Modify: `src/infrastructure/query/queryKeys.ts`
- Modify: `docs/migration-v2/tracker.md`

**Step 1: Choose one setting mode**

Pick the next highest-value plan setting route mode from Task 7. Do not implement multiple unrelated modes in one loop unless they share the same form, domain rule, and save command.

**Step 2: Write failing schema, form, and view tests**

For validation-bearing modes, cover default values, valid examples, invalid examples, one visible validation message, save failure, success state, and cancel/back behavior.

Run:

```bash
pnpm test src/domain/plan src/features/plan
```

Expected: FAIL until the mode behavior exists.

**Step 3: Write failing route, mutation, and repository tests**

Cover route dispatch for the selected mode, unknown mode fallback, exact save command payload, deterministic mock result, query invalidation or cache update keys, and readback when the page displays saved data.

Run:

```bash
pnpm test src/pages/plan/PlanSettingsRoute.test.tsx src/application/plan/planUseCases.test.ts src/infrastructure/repositories/plan
```

Expected: FAIL until route and save support exists.

**Step 4: Implement the selected mode**

Use React Hook Form and Zod for validation-bearing forms. Keep route-specific editors in `features/plan`. Use shared business capabilities only when the mode genuinely depends on a reusable capability such as payment method or client member selection.

**Step 5: Verify and commit**

```bash
pnpm test src/pages/plan/PlanSettingsRoute.test.tsx src/domain/plan src/application/plan/planUseCases.test.ts src/infrastructure/repositories/plan src/features/plan
git add src/pages/plan src/features/plan src/application/plan src/domain/plan src/infrastructure/repositories/plan src/infrastructure/mock/planMockData.ts src/infrastructure/query/queryKeys.ts docs/migration-v2/tracker.md
git commit -m "feat: migrate plan settings route mode"
```

Repeat Task 8 as a separate task execution for each reachable plan settings route mode, or for a tightly coupled mode group, until every reachable mode is `Completed` or recorded as `Skipped` with evidence in the tracker.

## Task 9: Migrate Client Order Detail Default Page

**Files:**

- Modify: `src/pages/order/ClientOrderRoute.tsx`
- Modify: `src/pages/order/ClientOrderRoute.test.tsx`
- Modify: `src/features/order/views/ClientOrderDetailView.tsx`
- Modify: `src/features/order/queries/useClientOrderDetailQuery.ts`
- Modify: `src/features/order/queries/useClientOrderDetailQuery.test.tsx`
- Modify: `src/application/order/getClientOrderDetail.ts`
- Modify: `src/application/order/orderUseCases.test.ts`
- Modify: `src/domain/order/*`
- Modify: `src/infrastructure/repositories/order/*`
- Modify: `src/infrastructure/mock/orderMockData.ts`
- Modify: `src/infrastructure/query/queryKeys.ts`
- Modify: `docs/migration-v2/tracker.md`

**Step 1: Inspect legacy client order**

Record `orderParams` format, order statuses, merchant schedule fields, default time schedule behavior, price summary cases, and `ClientOrderPageEnum` values.

**Step 2: Write failing domain tests**

Cover valid and invalid `orderParams`, order status display, schedule display, default time schedule behavior, and price summary rules.

Run:

```bash
pnpm test src/domain/order
```

Expected: FAIL until domain rules exist.

**Step 3: Write failing repository and query tests**

Cover order detail query keys, status and schedule variants, multiple order statuses, merchant schedule info, price summary cases, missing order, and deterministic data.

Run:

```bash
pnpm test src/application/order/orderUseCases.test.ts src/infrastructure/repositories/order src/features/order/queries
```

Expected: FAIL until data and query behavior exist.

**Step 4: Write failing route and view tests**

Cover invalid `orderParams` guard rendering, default order detail rendering, unknown mode fallback, link or action affordance for member-order-list mode, and order detail loading/error/success.

Run:

```bash
pnpm test src/pages/order/ClientOrderRoute.test.tsx src/features/order/views
```

Expected: FAIL until route and detail view work.

**Step 5: Implement order migration**

Keep the public route `/ops/client/$clientId/plan/$planId/order/$orderParams`. Route code may read raw `orderParams`, call domain or application parsing helpers for guard-level validation, and pass parsed values down. Do not hand-roll parsing, validation, or display rules inside route components or views.

**Step 6: Verify and commit**

```bash
pnpm test src/domain/order src/application/order/orderUseCases.test.ts src/infrastructure/repositories/order src/features/order src/pages/order/ClientOrderRoute.test.tsx
git add src/pages/order src/features/order src/application/order src/domain/order src/infrastructure/repositories/order src/infrastructure/mock/orderMockData.ts src/infrastructure/query/queryKeys.ts docs/migration-v2/tracker.md
git commit -m "feat: migrate client order detail"
```

## Task 10: Migrate Client Order Member List Route Mode

**Files:**

- Modify: `src/pages/order/ClientOrderRoute.tsx`
- Modify: `src/pages/order/ClientOrderRoute.test.tsx`
- Modify: `src/features/order/views/ClientMemberOrderListView.tsx`
- Modify: `src/features/order/queries/useClientMemberOrderListQuery.ts`
- Modify or create: `src/features/order/queries/useClientMemberOrderListQuery.test.tsx`
- Modify: `src/application/order/listClientMemberOrders.ts`
- Modify: `src/application/order/orderUseCases.test.ts`
- Modify: `src/domain/order/*`
- Modify: `src/infrastructure/repositories/order/*`
- Modify: `src/infrastructure/mock/orderMockData.ts`
- Modify: `src/infrastructure/query/queryKeys.ts`
- Modify: `e2e/client-list.spec.ts`
- Modify: `docs/migration-v2/tracker.md`

**Step 1: Inspect legacy member order list mode**

Record the old `ClientOrderPageEnum` value, entry action from order detail, list fields, ordering, loading, empty, error, and browser back behavior.

**Step 2: Write failing repository, query, and use-case tests**

Cover member-order-list query keys, deterministic ordering, empty result, missing order, and any status or schedule fields displayed in the list.

Run:

```bash
pnpm test src/application/order/orderUseCases.test.ts src/infrastructure/repositories/order src/features/order/queries
```

Expected: FAIL until member-order-list data exists.

**Step 3: Write failing route, view, and Playwright tests**

Cover `clientMemberOrderList` dispatch, unknown mode fallback, member list loading/empty/error/success, entering the mode from order detail, and browser back to order detail.

Run:

```bash
pnpm test src/pages/order/ClientOrderRoute.test.tsx src/features/order/views
pnpm e2e e2e/client-list.spec.ts
```

Expected: FAIL until the route mode and view work.

**Step 4: Implement the route mode**

Render through `RouteModeSwitch`. Keep parsing and display rules in domain/application helpers or feature-level view logic as appropriate; do not add raw backend shapes to the route or view.

**Step 5: Verify and commit**

```bash
pnpm test src/domain/order src/application/order/orderUseCases.test.ts src/infrastructure/repositories/order src/features/order src/pages/order/ClientOrderRoute.test.tsx
pnpm e2e e2e/client-list.spec.ts
git add src/pages/order src/features/order src/application/order src/domain/order src/infrastructure/repositories/order src/infrastructure/mock/orderMockData.ts src/infrastructure/query/queryKeys.ts e2e/client-list.spec.ts docs/migration-v2/tracker.md
git commit -m "feat: migrate client order member list mode"
```

## Task 11: Migrate Shared Business Capabilities On Demand

**Files:**

- Modify or create only when needed:
  - `src/features/payment-method/*`
  - `src/features/client-member/*`
  - `src/features/select-merchant/*`
  - `src/features/mc-staff/*`
  - `src/features/card-setting/*`
  - `src/features/setting-rule/*`
- Modify owning page files that integrate the capability
- Modify owning mutation, use case, repository, and query-key tests
- Modify: `docs/migration-v2/tracker.md`

**Step 1: Choose one capability only when an owning route mode needs it**

Do not defer required capability work to this task if an earlier route mode cannot be completed without it. Execute this task inside the owning route-mode loop when necessary.

**Step 2: Write failing capability tests**

Cover required props, local state behavior, validation schema, cancel/back behavior, and save handoff.

Run the narrowest matching test command, for example:

```bash
pnpm test src/features/payment-method
```

Expected: FAIL until capability behavior exists.

**Step 3: Write failing owning-page integration tests**

Prove the capability does not persist by itself. It must call the owning page save flow with the expected command payload, and the owning page must invalidate or update the relevant query data.

Run the owning feature tests, for example:

```bash
pnpm test src/features/plan src/pages/plan/PlanSettingsRoute.test.tsx
```

Expected: FAIL until integration is wired.

**Step 4: Implement the capability**

Keep business-aware reusable components out of `shared/ui`. Let owning routes or feature views pass context through props. Keep persistence and save orchestration in the owning page's mutation flow. Put reusable form fragments, validation schemas, and local interaction state inside the capability module only when they are capability-specific.

**Step 5: Verify and commit**

```bash
pnpm test src/features/payment-method src/features/client-member src/features/setting-rule
git add src/features docs/migration-v2/tracker.md
git commit -m "feat: migrate shared business capability"
```

Adjust the verification command and commit message to the actual capability.

## Task 12: Migrate Shared UI Primitives And Assets On Demand

**Files:**

- Modify or create only when needed:
  - `src/shared/ui/*`
  - `src/shared/assets/icons/*`
  - `src/shared/assets/icons/index.ts`
  - `src/shared/assets/brand/*`
  - `src/shared/assets/images/*`
- Modify owning feature tests that use the primitive
- Modify: `docs/migration-v2/tracker.md`

**Step 1: Confirm the primitive or asset is business-agnostic**

Allowed shared UI examples: `Page`, `NavigationBar`, `Button`, `LoadingState`, `EmptyState`, `ErrorState`, `InfoRow`, `Field`, generic tabs, dialogs, action sheets, pull refresh, and infinite list primitives.

If the component knows about client, merchant, plan, order, payment, member, or setting business meaning, keep it under `src/features/*`.

**Step 2: Write failing primitive or asset tests**

For UI primitives, cover non-trivial behavior: controlled state, disabled/loading states, accessibility labels, callbacks, keyboard/touch interaction, or visible state.

For reusable icon SVGs, add or update validation coverage for kebab-case filenames, preserved `viewBox`, and `?react` exports from `src/shared/assets/icons/index.ts`.

Run the narrowest command, for example:

```bash
pnpm test src/shared/ui
```

Expected: FAIL until the primitive or asset exists.

**Step 3: Implement minimal shared UI or asset migration**

Put reusable icon SVG files in `src/shared/assets/icons`, export them from `src/shared/assets/icons/index.ts` with `?react`, put brand SVGs in `src/shared/assets/brand`, and put illustration/image SVGs in `src/shared/assets/images`.

**Step 4: Verify and commit**

```bash
pnpm test src/shared/ui
pnpm build
git add src/shared docs/migration-v2/tracker.md
git commit -m "feat: migrate shared ui primitive"
```

## Task 13: Final Migration Audit

**Files:**

- Modify: `docs/migration-v2/tracker.md`
- Modify: `docs/migration-v2/plan.md` only if final status notes are added
- Modify docs only if structure, commands, tooling, or architecture rules changed:
  - `README.md`
  - `AGENTS.md`
  - `docs/architecture-design.md`

**Step 1: Run architecture-boundary audit**

Search for forbidden imports:

```bash
rg "axios|apis-gen|apis-legacy|src/apis|localStorage|sessionStorage|Date\\.now\\(|Math\\.random\\(" src/pages src/features src/application src/domain src/infrastructure/mock src/infrastructure/repositories
```

Expected: No forbidden usage in migrated runtime paths. Any legitimate reference must be documented in `tracker.md` with a reason.

**Step 2: Run route audit**

Search for accidental compatibility routes:

```bash
rg '"/(client|plan|order)|path: "/(client|plan|order)' src/app/router src/pages
```

Expected: No migrated client, plan, or order production route outside `/ops/client...`.

**Step 3: Run full verification**

```bash
pnpm lint
pnpm format:check
pnpm test
pnpm e2e
pnpm build
```

Expected: PASS.

**Step 4: Record final evidence and commit**

```bash
git add docs/migration-v2/tracker.md docs/migration-v2/plan.md README.md AGENTS.md docs/architecture-design.md
git commit -m "docs: complete migration v2 audit"
```

Only stage docs that actually changed.

---

## Per-Slice Definition Of Done

A slice is Done only when:

- Public route shape matches `/ops/client...` where applicable.
- Route registration exists.
- Route component is thin and renders through `RouteModeSwitch`.
- Feature view owns page composition.
- Server state uses TanStack Query.
- Draft or temporary UI state uses Zustand only when needed.
- Business behavior goes through application use cases.
- Domain contracts and rules are framework-free.
- Repository implementation is mock-only and deterministic.
- Query keys are centralized in `src/infrastructure/query/queryKeys.ts`.
- Tests listed in the owning task pass.
- Playwright coverage passes for tasks listed in the Playwright Coverage Contract.
- `docs/migration-v2/tracker.md` contains reviewable evidence.
- `pnpm lint`, `pnpm format:check`, and `pnpm test` pass before handoff.
