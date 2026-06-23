# Business Migration Plan V2

This plan turns `specs.md` into an executable migration checklist for moving business-facing H5 pages from the old `planet-h5` project into this project.

Architectural boundaries remain defined by `../architecture-design.md`. This document is only the migration execution plan.

## Goals

- Migrate the old client, plan, and client order business flows into the new lightweight Clean Architecture.
- Preserve the public business route shape based on `/ops/client...`.
- Use deterministic mock repositories for every migrated server-backed behavior.
- Convert old `pageType` page states into TanStack Router `routeMode` states.
- Keep route files thin and move page composition into feature views.
- Keep business-aware reusable UI in focused feature capability modules, not in `shared/ui`.

## Non-Goals

- Do not integrate real APIs.
- Do not migrate old generated API clients, request clients, SSO, login callback, token injection, hybrid bridge behavior, S3 upload, deployment, monitoring, or dev demo pages.
- Do not copy old folders wholesale into the new project.
- Do not add new production route shapes to replace `/ops/client...`.
- Do not persist mock mutation state outside the current browser or test process.

## Current Gap Summary

The current project may already contain placeholder or partially migrated business routes and
modules. V2 does not treat those implementations as compatibility targets. Inspect them only as
current local context, then replace or delete them when a slice migrates the corresponding old
`planet-h5` behavior into the `/ops/client...` route contract.

| Area          | V2 target                                               |
| ------------- | ------------------------------------------------------- |
| Client list   | `/ops/client`                                           |
| Client detail | `/ops/client/$clientId`                                 |
| Plan detail   | `/ops/client/$clientId/plan/$planId`                    |
| Plan settings | `/ops/client/$clientId/plan/$planId/setting`            |
| Client order  | `/ops/client/$clientId/plan/$planId/order/$orderParams` |

Do not add compatibility route shapes for this migration. Each migrated business route uses the
`/ops/client...` contract listed above.

Do not keep replaced placeholder or partially migrated code as parallel code paths, compatibility
fallbacks, or alternate route implementations. The old `planet-h5` source and `specs.md` define the
migration target.

## Migration Principles

1. Classify old code by responsibility before moving it.
2. Migrate by page flow, not by old directory.
3. Keep the runtime data flow consistent:

```txt
features/<module>/queries or mutations
  -> application/<module>/<useCase>.ts
    -> domain/<module>/<Repository>.ts
      -> infrastructure/repositories/<module>/<module>Repository.mock.ts
        -> infrastructure/mock/<module>MockData.ts
```

4. Keep import direction consistent with the architecture:

```txt
pages -> features -> application -> domain
infrastructure -> domain
```

5. Feature query and mutation hooks may import the use case and selected repository facade, then pass the repository into the use case.
6. Application and domain code must not import infrastructure.
7. Views must not import Axios, old API clients, mock data files, backend response shapes, or request clients.
8. Every migrated route must have route metadata unless it is redirect-only or framework-only.

## Progress Tracking

Record progress next to the concrete task, route mode, capability, or validation item that owns the
work. Do not maintain a separate global progress table. The `Status` line under each phase is only a
phase-level summary and should be updated after the concrete task statuses justify the phase change.

Status values:

- `Not started`: no implementation work has been completed for this phase or slice.
- `In progress`: implementation has started, but the definition of done is not met.
- `Blocked`: implementation cannot continue without a decision or external dependency.
- `Done`: implementation and required validation are complete.

Slice progress rules:

- Add status beside the relevant task only when a phase is split into ad hoc task-level slices that
  are not already covered by a route mode, capability, or validation table row.
- Update the owning task or table row when work starts, completes, or becomes blocked.
- For mode or capability inventories, use `Status` and `Evidence / blocker` columns.
- Record detailed historical results in `execution.md`; keep `plan.md` as the current status index.
- Set a phase to `Done` only when every required task or mode for that phase is `Done` and the phase
  validation has passed or is explicitly recorded as not applicable.

Target file lists identify the expected primary files for a phase. They are not exhaustive. Add or
update tests, query keys, route metadata, and nearby support files whenever the phase validation or
architecture rules require them.

## Test-First Migration Rule

Tasks named `Add failing coverage` must be completed before the implementation task that follows
them. If the current implementation already passes the new test, record that in `execution.md` and
continue with the implementation task.

The `Validation` sections below are regression checklists. They run after implementation and must not
replace the `Add failing coverage` tasks in each phase.

## Validation Evidence Standard

Validation is the final regression pass for a slice. It must produce reviewable evidence, not only a
statement that testing was considered.

For every completed slice, record the following in `execution.md`:

- Old source inspected, including file paths or symbols.
- Tests added or updated, including exact test file paths.
- Behavior covered by those tests, stated as concrete cases.
- Commands run, with pass/fail result.
- Playwright checks run when required, with route, route mode, viewport, and interaction exercised.
- Any skipped checklist item as `N/A`, with the reason it is not reachable or not applicable.

Do not mark a slice or phase `Done` with generic notes such as "tested", "covered", or "not
needed". If a validation item is not reachable for the slice, record it as `N/A` with the concrete
reason.

## E2E Coverage Assignments

Only the flows in this table require Playwright coverage. Do not add other Playwright tests during
this migration unless this table is updated first.

| Phase | Playwright file / flow                   | Required browser assertions                                                                                |
| ----- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 0     | `/ops/client` smoke                      | Open `/ops/client` in the configured mobile viewport and verify the route renders through the Vite server. |
| 1     | Client list to detail                    | Open `/ops/client`, navigate to one client detail, verify `/ops/client/$clientId`, then browser back.      |
| 2     | Client detail to plan detail             | Open `/ops/client/$clientId`, navigate to one plan detail, verify `/ops/client/$clientId/plan/$planId`.    |
| 5     | Plan detail to setting and one edit mode | Open plan detail, navigate to setting, open the first implemented edit mode, then browser back twice.      |
| 6     | Client order member list mode            | Open one order detail, enter `clientMemberOrderList` route mode, then browser back to order detail.        |

## Legacy Source Inventory

Inspect the listed old source before implementing a slice. If a file is missing or old source behavior
differs from this inventory, record a blocker or deviation before coding.

| Plan area               | Legacy source files or symbols to inspect                                                                                                                                                 | Purpose                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Client list             | `src/apps/client/client-list/index.tsx`, `Detail.tsx`, `comps/Card.tsx`, `hooks/useClientList.tsx`, `helper/normalize.ts`, `types.ts`, `constants/*`                                      | List fields, filters, card display, empty/loading/error states          |
| Client detail           | `src/apps/client/client-detail/index.tsx`, detail view files, `ClientDetailPageEnum`, hooks, helpers, constants, types                                                                    | Default detail behavior, route modes, field mappings, update commands   |
| Plan detail             | `src/apps/client/plan-detail/index.tsx`, plan detail view files, hooks, helpers, constants, types                                                                                         | Plan summary fields, display mappings, reachable default behavior       |
| Plan settings           | `src/apps/client/plan-setting/index.tsx`, setting view files, `PlanSettingPageEnum`, hooks, helpers, constants, types                                                                     | Settings mode inventory, form inputs, validation, save behavior         |
| Client order            | `src/apps/client/client-order/index.tsx`, order detail and member order list views, `ClientOrderPageEnum`, hooks, helpers, constants, types                                               | `orderParams`, order status, schedule, member list, price summary rules |
| Business capabilities   | `src/biz/features/payment-method`, `src/biz/features/client-member`, `src/biz/features/select-merchant`, `src/biz/features/select-meican-staff`, `src/biz/comps`, related constants/types | Capability props, validation, local state, save handoff                 |
| Shared UI and assets    | `src/comps`, `src/assets/icons`, `src/assets/imgs`                                                                                                                                        | Business-agnostic primitive and asset migration                         |
| Reference-only API data | `src/apis`, `src/apis-gen`, `src/apis-legacy`                                                                                                                                             | Field names or business meaning only; do not import into new runtime    |

## Phase 0: Baseline Cleanup And Route Contract

Status: `Not started`

Objective: align the new project with the v2 route contract before deeper page migration.

Tasks:

- Add failing coverage in `src/app/router/routeMeta.test.ts` for all five required `/ops/client...`
  route metadata entries.
- Add failing router coverage for all five `/ops/client...` paths and for the absence of migrated
  client, plan, or order compatibility paths outside `/ops/client...`.
- Add failing route stack coverage proving the root route renders `RouteStack`.
- Add or update Playwright smoke coverage for opening `/ops/client` in the configured mobile
  viewport.
- Add or update TanStack Router definitions in `src/app/router/routeTree.tsx` for:
  - `/ops/client`
  - `/ops/client/$clientId`
  - `/ops/client/$clientId/plan/$planId`
  - `/ops/client/$clientId/plan/$planId/setting`
  - `/ops/client/$clientId/plan/$planId/order/$orderParams`
- Add matching metadata in `src/app/router/routeMeta.ts`.
- Replace placeholder behavior on `/ops/client...` routes with migrated business behavior as each
  slice is completed.
- Do not add non-`/ops/client...` compatibility routes for migrated client, plan, or order flows.
- Ensure route entry components that read params accept `RouteStackPageProps` and fall back to `useParams({ strict: false, shouldThrow: false })`.
- Keep `RouteStack` as the only page-stack renderer. Do not add a second route table or pathname matcher.
- Introduce the Playwright e2e harness when it is not already present.

Validation:

- `src/app/router/routeMeta.test.ts` proves metadata exists for each required `/ops/client...` route.
- Router coverage proves all five `/ops/client...` paths are registered and no alternate
  compatibility route shape was added for migrated client, plan, or order flows.
- Route stack coverage proves the root route still renders `RouteStack` and no second route table or
  pathname matcher was introduced.
- For each route component that reads params, tests or focused code review evidence prove
  `RouteStackPageProps` params are used with the `useParams({ strict: false, shouldThrow: false })`
  fallback.
- Playwright smoke coverage proves the app opens in a mobile viewport and `/ops/client` renders
  through the configured Vite web server.

## Phase 1: Client List

Status: `Not started`

Objective: migrate the old client list route as the first end-to-end server-backed flow.

Target files:

- `src/pages/client/ClientListRoute.tsx`
- `src/features/client/views/ClientListView.tsx`
- `src/features/client/queries/useClientListQuery.ts`
- `src/features/client/store/clientListStore.ts`, only for local filter or scroll state
- `src/application/client/getClientList.ts`
- `src/domain/client/Client.ts`
- `src/domain/client/ClientRepository.ts`
- `src/infrastructure/repositories/client/clientRepository.mock.ts`
- `src/infrastructure/repositories/client/index.ts`
- `src/infrastructure/mock/clientMockData.ts`
- `src/infrastructure/query/queryKeys.ts`

Tasks:

- Add failing query hook coverage for committed list params in `queryKeys`, excluding draft local
  state from the key.
- Add failing use case and mock repository coverage for filtering, ordering, empty results, and
  missing or invalid params.
- Add failing view coverage for loading, empty, error, populated list, and navigation to
  `/ops/client/$clientId`.
- Add or update Playwright coverage for `/ops/client` to `/ops/client/$clientId` navigation and
  browser back.
- Preserve the public route as `/ops/client`.
- Put list filter query params in the client query hook, client status values and pure mappings in
  `src/domain/client`, and card display labels in `src/features/client`.
- Keep list server state in TanStack Query.
- Use Zustand only for local interaction state such as draft filters or scroll position.
- Navigate to client detail through `/ops/client/$clientId`.
- Keep old API types out of the view and hook layers.

Validation:

- Query hook tests prove committed list params are included in `queryKeys`, draft local state is not
  used as a query key, and deterministic mock results are returned.
- Use case and mock repository tests prove filtering, ordering, empty results, and missing or invalid
  params behave deterministically.
- View tests prove loading, empty, error, and populated list states, plus navigation to
  `/ops/client/$clientId`.
- Route metadata and route contract tests prove `/ops/client` is registered and titled.

## Phase 2: Client Detail Default Read Page

Status: `Not started`

Objective: migrate the old client detail default page and establish the route-mode pattern for client detail.

Target files:

- `src/pages/client/ClientDetailRoute.tsx`
- `src/pages/client/ClientDetailRoute.test.tsx`
- `src/features/client/views/ClientDetailView.tsx`
- `src/features/client/views/ClientDetailReadView.tsx`
- `src/features/client/queries/useClientDetailQuery.ts`
- `src/features/client/mutations/useUpdateClientMutation.ts`, when default page actions need updates
- `src/application/client/getClientDetail.ts`
- `src/application/client/updateClient.ts`
- `src/domain/client/*`
- `src/infrastructure/repositories/client/*`
- `src/infrastructure/mock/clientMockData.ts`

Tasks:

- Add failing query hook coverage for a detail key that includes `clientId`.
- Add failing use case coverage for detail read behavior and each update command migrated in this
  phase.
- Add failing mock repository coverage for deterministic detail reads, missing-client behavior, and
  in-memory update readback when the default page reads the changed value afterward.
- Add failing view coverage for default detail loading, error, and success states.
- Add failing route coverage for default page rendering, unknown route mode fallback, and each route
  mode implemented in this phase.
- Add or update Playwright coverage for client detail to plan detail navigation.
- Preserve the public route as `/ops/client/$clientId`.
- Render the route through `RouteModeSwitch`.
- Use `RouteModeSwitch defaultPage` for the default behavior and keep feature views unaware of `location.state`.
- Translate old client backend response fields into domain entities and deterministic fixtures.
- Add update mutations only for behavior that the migrated page reads back afterward.

Client detail route modes to plan under this route:

| Route mode                               | Target                                        | Old source / reachability | Status        | Evidence / blocker |
| ---------------------------------------- | --------------------------------------------- | ------------------------- | ------------- | ------------------ |
| `plan`                                   | `ClientMealPlansView`                         | Confirm from old source   | `Not started` | Not started        |
| `setting`                                | `ClientSettingsView`                          | Confirm from old source   | `Not started` | Not started        |
| `nameAndRemark`                          | `ClientNameAndRemarkView`                     | Confirm from old source   | `Not started` | Not started        |
| `nameAndRemarkEdit`                      | `ClientDetailEditView` or a focused edit view | Confirm from old source   | `Not started` | Not started        |
| `notification`                           | `ClientNotificationSettingsView`              | Confirm from old source   | `Not started` | Not started        |
| `paymentMethod`                          | `features/payment-method` capability          | Confirm from old source   | `Not started` | Not started        |
| `mealType`                               | `ClientMealSettingsView`                      | Confirm from old source   | `Not started` | Not started        |
| `mealTypeSetting`                        | focused meal type edit view                   | Confirm from old source   | `Not started` | Not started        |
| `mealGroup`                              | `ClientMealSettingsView`                      | Confirm from old source   | `Not started` | Not started        |
| `manager`                                | `ClientManagerSettingsView`                   | Confirm from old source   | `Not started` | Not started        |
| `support`                                | `ClientSupportSettingsView`                   | Confirm from old source   | `Not started` | Not started        |
| `supportEdit`                            | focused support edit view                     | Confirm from old source   | `Not started` | Not started        |
| `department`                             | `ClientDepartmentSettingsView`                | Confirm from old source   | `Not started` | Not started        |
| `departmentEdit`                         | focused department edit view                  | Confirm from old source   | `Not started` | Not started        |
| `costCenter`                             | `ClientCostCenterSettingsView`                | Confirm from old source   | `Not started` | Not started        |
| `costCenterEdit`                         | focused cost center edit view                 | Confirm from old source   | `Not started` | Not started        |
| `appVersion`                             | `ClientAppVersionSettingsView`                | Confirm from old source   | `Not started` | Not started        |
| `meicanCard`                             | `features/card-setting` capability            | Confirm from old source   | `Not started` | Not started        |
| `externalCard`                           | `features/card-setting` capability            | Confirm from old source   | `Not started` | Not started        |
| `mealPoint`                              | `ClientMealSettingsView`                      | Confirm from old source   | `Not started` | Not started        |
| `fieldSetting`                           | `ClientFieldSettingsView`                     | Confirm from old source   | `Not started` | Not started        |
| `fieldSettingDetail`                     | focused field setting detail view             | Confirm from old source   | `Not started` | Not started        |
| `loginSetting`                           | `ClientLoginSettingsView`                     | Confirm from old source   | `Not started` | Not started        |
| `loginSettingEmployeeNumber`             | focused employee number login view            | Confirm from old source   | `Not started` | Not started        |
| `loginSettingThirdParty`                 | focused third-party login view                | Confirm from old source   | `Not started` | Not started        |
| `loginSettingThirdPartyDetail`           | focused third-party login detail view         | Confirm from old source   | `Not started` | Not started        |
| `loginSettingThirdPartyAssociateSetting` | focused third-party associate setting view    | Confirm from old source   | `Not started` | Not started        |
| `loginSettingThirdPartyMealplanSetting`  | focused third-party meal plan setting view    | Confirm from old source   | `Not started` | Not started        |
| `passwordSetting`                        | `ClientPasswordSettingsView`                  | Confirm from old source   | `Not started` | Not started        |
| `passwordComplexitySetting`              | focused password complexity view              | Confirm from old source   | `Not started` | Not started        |
| `passwordPeriodSetting`                  | focused password period view                  | Confirm from old source   | `Not started` | Not started        |

Validation:

- Query hook tests prove the detail query key includes `clientId` and returns deterministic mock
  detail data.
- Use case tests prove detail read behavior and every migrated update command, including invalid input
  when applicable.
- Mock repository tests prove deterministic detail reads, missing-client behavior, and in-memory
  update readback when the migrated page reads the changed value afterward.
- View tests prove default detail loading, error, and success states.
- Route tests prove default page rendering, unknown route mode fallback, and dispatch for every
  implemented route mode.

## Phase 3: Client Detail Settings And Focused Modes

Status: `Not started`

Objective: migrate client detail settings as smaller focused slices after the default detail page is stable.

Recommended order:

1. Meal plans and settings.
2. Name and remark read/edit.
3. Support, department, cost center, and manager settings.
4. Login settings and third-party login submodes.
5. Password settings.
6. Notification settings.
7. App version and field settings.
8. Card and payment method capability integration.

Tasks:

- For each focused mode before implementation, add failing domain rule tests for pure validation
  rules used by that mode.
- For each focused mode before implementation, add failing form or view tests for default values,
  valid submit, one invalid input message, save failure, and cancel or back behavior.
- For each focused mode before implementation, add failing mutation tests for command payload,
  deterministic mock result, query invalidation or cache update keys, and readback when the page reads
  saved data afterward.
- For each focused mode before implementation, add failing route dispatch tests for that mode and
  unknown mode fallback.
- Convert old imperative form state to React Hook Form and Zod for validation-bearing forms.
- Put pure business validation in `src/domain/client` when it is not React-specific.
- Put form schemas in the feature when the schema is view/form-specific.
- Use feature-local Zustand stores only for drafts or temporary UI state.
- Keep save flows owned by the client feature mutation and application use case.
- For shared business capabilities, pass owning client context through props and keep saving in the owning flow.

Validation:

- Domain rule tests prove each pure validation rule with valid and invalid examples.
- Form tests for each migrated validation-bearing mode prove default values, valid submit, at least
  one invalid input message, save failure handling, and cancel or back behavior when unsaved local
  state exists.
- Mutation tests prove the exact command payload, deterministic mock result, query invalidation or
  cache update keys, and mutation readback when the page reads the changed value afterward.
- Route dispatch tests prove default page fallback, each newly implemented mode, and unknown mode
  fallback.

## Phase 4: Plan Detail

Status: `Not started`

Objective: migrate the plan detail default page.

Target files:

- `src/pages/plan/PlanDetailRoute.tsx`
- `src/features/plan/views/PlanDetailView.tsx`
- `src/features/plan/queries/usePlanDetailQuery.ts`
- `src/application/plan/getPlanDetail.ts`
- `src/domain/plan/*`
- `src/infrastructure/repositories/plan/*`
- `src/infrastructure/mock/planMockData.ts`

Tasks:

- Add failing query hook coverage for a plan detail key that includes `clientId` and `planId`.
- Add failing use case and mock repository coverage for success, missing plan, and deterministic
  display-mapping inputs.
- Add failing view coverage for loading, error, and success states.
- Add failing route coverage for passing params to the view, default page rendering, and navigation
  to `/ops/client/$clientId/plan/$planId/setting`.
- Add failing route metadata coverage for the plan detail route title and `plan` module.
- Preserve the public route as `/ops/client/$clientId/plan/$planId`.
- Treat the old plan detail default or empty page-type enum as the default page unless old source
  inspection finds additional reachable non-default page types before migration.
- Translate old plan display mappings and constants into domain, application, or feature files by responsibility.
- Keep any route navigation to settings on `/ops/client/$clientId/plan/$planId/setting`.

Validation:

- Query hook tests prove the plan detail key includes `clientId` and `planId`, and returns
  deterministic mock detail data.
- Use case and mock repository tests prove success, missing plan, and deterministic display-mapping
  inputs.
- View tests prove loading, error, and success states for the default plan detail page.
- Route tests prove params are passed to the view, the default page renders, and navigation to
  `/ops/client/$clientId/plan/$planId/setting` uses the production route shape.
- Route metadata test proves the plan detail route is titled and assigned to the `plan` module.

## Phase 5: Plan Settings

Status: `Not started`

Objective: migrate the old plan settings page and its route modes.

Target files:

- `src/pages/plan/PlanSettingsRoute.tsx`
- `src/features/plan/views/PlanSettingsView.tsx`
- `src/features/plan/mutations/useSavePlanSettingsMutation.ts`
- `src/features/plan/store/planDraftStore.ts`, only for local drafts
- `src/application/plan/savePlanSettings.ts`
- `src/domain/plan/*`
- `src/infrastructure/repositories/plan/*`
- `src/infrastructure/mock/planMockData.ts`

Tasks:

- Add failing route mode dispatch coverage for default page rendering, every implemented setting
  mode, unknown mode fallback, and back navigation behavior.
- For each setting mode before implementation, add failing domain or schema tests for valid and
  invalid examples when the mode has validation.
- Add failing mock repository coverage for deterministic save behavior, missing plan behavior, no
  random values, and in-memory readback when saved values are shown afterward.
- Add failing mutation hook coverage for the exact save command payload and query keys invalidated or
  updated after save.
- For each implemented setting editor, add failing view tests for loading, success, validation error,
  save failure, and cancel or back behavior.
- Add or update Playwright coverage for plan detail to settings navigation, opening the first
  implemented edit mode, and browser back twice.
- Preserve the public route as `/ops/client/$clientId/plan/$planId/setting`.
- Render the route through `RouteModeSwitch`.
- Convert each old `PlanSettingPageEnum` value into a `routeMode`.
- Use `features/setting-rule` for setting editors shared by both client and plan routes. Keep editors
  used by only this route under `src/features/plan`.
- Keep all saves in the plan mutation and application use case.

Plan settings route modes to plan under this route:

| Route mode                  | Target                                        | Old source / reachability | Status        | Evidence / blocker |
| --------------------------- | --------------------------------------------- | ------------------------- | ------------- | ------------------ |
| `baseInfo`                  | focused plan base info view                   | Confirm from old source   | `Not started` | Not started        |
| `baseInfoEdit`              | focused plan base info edit view              | Confirm from old source   | `Not started` | Not started        |
| `operationDay`              | focused operation day view                    | Confirm from old source   | `Not started` | Not started        |
| `restriction`               | focused merchant restriction view             | Confirm from old source   | `Not started` | Not started        |
| `memberCount`               | focused member count view, if still reachable | Confirm reachability      | `Not started` | Not started        |
| `clientMemberList`          | `features/client-member` capability           | Confirm from old source   | `Not started` | Not started        |
| `clientMemberDetail`        | `features/client-member` capability           | Confirm from old source   | `Not started` | Not started        |
| `openTimesDinnerIn`         | focused dinner-in open times view             | Confirm from old source   | `Not started` | Not started        |
| `openTimesGroupDelivery`    | focused group delivery open times view        | Confirm from old source   | `Not started` | Not started        |
| `maximumOrderAmount`        | focused maximum order amount view             | Confirm from old source   | `Not started` | Not started        |
| `hidePrice`                 | focused hide price view                       | Confirm from old source   | `Not started` | Not started        |
| `hidePriceAndMealPoint`     | focused hide price and meal point view        | Confirm from old source   | `Not started` | Not started        |
| `disableAppendDish`         | focused disable append dish view              | Confirm from old source   | `Not started` | Not started        |
| `hiddenAccountTypes`        | focused hidden account types view             | Confirm from old source   | `Not started` | Not started        |
| `dishRemark`                | focused dish remark view                      | Confirm from old source   | `Not started` | Not started        |
| `deliveryRemark`            | focused delivery remark view                  | Confirm from old source   | `Not started` | Not started        |
| `orderRule`                 | focused order rule view                       | Confirm from old source   | `Not started` | Not started        |
| `paymentMethod`             | `features/payment-method` capability          | Confirm from old source   | `Not started` | Not started        |
| `paymentMethodSelectConfig` | `features/payment-method` capability          | Confirm from old source   | `Not started` | Not started        |
| `manuallyConfirmOrder`      | focused manually confirm order view           | Confirm from old source   | `Not started` | Not started        |
| `occupationTime`            | focused occupation time view                  | Confirm from old source   | `Not started` | Not started        |
| `orderTransfer`             | focused order transfer view                   | Confirm from old source   | `Not started` | Not started        |
| `merchantOrderVerification` | focused merchant verification view            | Confirm from old source   | `Not started` | Not started        |
| `pickupSetting`             | focused pickup setting view                   | Confirm from old source   | `Not started` | Not started        |
| `pickUpMealCodeRule`        | focused pickup meal code view                 | Confirm from old source   | `Not started` | Not started        |
| `menuStyle`                 | focused menu style view                       | Confirm from old source   | `Not started` | Not started        |
| `financeConfig`             | focused finance config view                   | Confirm from old source   | `Not started` | Not started        |
| `financeConfigAmount`       | focused finance amount view                   | Confirm from old source   | `Not started` | Not started        |
| `financeConfigMealType`     | focused finance meal type view                | Confirm from old source   | `Not started` | Not started        |
| `location`                  | focused location setting view                 | Confirm from old source   | `Not started` | Not started        |

Validation:

- Route mode dispatch tests prove default page rendering, every implemented setting mode, unknown
  mode fallback, and back navigation behavior.
- Domain and schema tests prove valid and invalid examples for every validation-bearing setting.
- Mock repository tests prove deterministic save behavior, missing plan behavior, no random values,
  and in-memory readback when the saved value is shown afterward.
- Mutation hook tests prove the exact command payload and the exact query keys invalidated or cache
  entries updated after saves.
- View tests for each implemented setting editor prove loading, success, validation error, save
  failure, and cancel/back behavior when those states are reachable.

## Phase 6: Client Order

Status: `Not started`

Objective: migrate client order detail and member order list flows.

Target files:

- `src/pages/order/ClientOrderRoute.tsx`
- `src/pages/order/ClientOrderRoute.test.tsx`
- `src/features/order/views/ClientOrderDetailView.tsx`
- `src/features/order/views/ClientMemberOrderListView.tsx`
- `src/features/order/queries/useClientOrderDetailQuery.ts`
- `src/features/order/queries/useClientMemberOrderListQuery.ts`
- `src/application/order/getClientOrderDetail.ts`
- `src/application/order/listClientMemberOrders.ts`
- `src/domain/order/*`
- `src/infrastructure/repositories/order/*`
- `src/infrastructure/mock/orderMockData.ts`

Tasks:

- Add failing domain coverage for valid and invalid `orderParams`, order status display, schedule
  display, default time schedule behavior, and price summary rules.
- Add failing query hook coverage for order detail and member-order-list keys, including status and
  schedule variants.
- Add failing mock repository coverage for multiple order statuses, merchant schedule info, price
  summary cases, missing order behavior, and deterministic ordering.
- Add failing route coverage for invalid `orderParams` guard rendering, default order detail
  rendering, unknown mode fallback, and `clientMemberOrderList` dispatch.
- Add failing view coverage for order detail loading, error, and success states, plus member order
  list loading, empty, error, and success states.
- Add or update Playwright coverage for order detail to `clientMemberOrderList` route mode and
  browser back.
- Preserve the public route as `/ops/client/$clientId/plan/$planId/order/$orderParams`.
- Render the route through `RouteModeSwitch`.
- Use the default page for order detail.
- Convert old `clientMemberOrderList` page type into the `clientMemberOrderList` route mode.
- Keep route code limited to reading the raw `orderParams` path param, invoking domain or
  application helpers for guard-level parsing, and passing parsed domain values down. Do not hand-roll
  string parsing, validation, or display rules inside route components or views.
- Migrate merchant schedule info used by the order detail page.
- Migrate price summary display rules, including multiple price summary cases in deterministic mock
  data.
- Migrate default time schedule behavior when it affects order detail or member order list display.
- Cover multiple order statuses in domain display rules and mock fixtures.

Validation:

- Domain tests prove valid and invalid `orderParams`, order status display, schedule display, default
  time schedule behavior, and price summary rules.
- Query hook tests prove detail and member-order-list query keys, including status and schedule
  variants.
- Mock repository tests prove multiple order statuses, merchant schedule info, price summary cases,
  missing order behavior, and deterministic ordering.
- Route tests prove invalid `orderParams` guard rendering, default order detail rendering, unknown
  mode fallback, and `clientMemberOrderList` dispatch.
- View tests prove order detail loading, error, and success states, plus member order list loading,
  empty, error, and success states.

## Phase 7: Shared Business Capability Modules

Status: `Not started`

Objective: migrate reusable business-aware capabilities only when a migrated page needs them.
Capabilities that are required by earlier client, plan, or order slices must be migrated inside those
owning slices. This phase is only for capability work that remains after the owning slices have been
implemented.

Do not defer a capability to this phase when an earlier route mode depends on it. In that case, track
the capability work in the owning route mode row and record Phase 7 as already covered by that slice.

Candidate modules:

- `src/features/payment-method`
- `src/features/client-member`
- `src/features/select-merchant`
- `src/features/mc-staff` or existing `src/features/mc-staff`
- `src/features/card-setting`
- `src/features/setting-rule`

Tasks:

- Before implementing each capability, add failing component or hook coverage for required props,
  local state behavior, validation schema, and cancel or back behavior.
- Before wiring each capability into an owning page, add failing save handoff coverage proving the
  capability calls the owning page save flow with the expected command payload.
- Before wiring each capability into an owning page, add failing owning-page integration coverage for
  save, query invalidation, or cache update behavior.
- Keep capability modules business-aware and out of `shared/ui`.
- Let owning routes or feature views pass context through props.
- Keep persistence and save orchestration in the owning page's mutation flow.
- Put reusable form fragments, validation schemas, and local interaction state inside the capability module when they are capability-specific.
- Use existing capability modules before creating new ones.

Validation:

- Component or hook tests prove required props, local state behavior, validation schema, and cancel or
  back behavior for reusable capability behavior.
- Save handoff tests or owning-page integration tests prove the capability does not persist by itself
  and instead calls the owning page's save flow with the expected command payload.
- Owning page tests prove integration paths that save, invalidate, or update the relevant query data.

## Phase 8: Shared UI And Assets

Status: `Not started`

Objective: migrate only business-agnostic primitives and assets discovered during page migration.

Allowed shared UI examples:

- `Page`
- `NavigationBar`
- `Button`
- `LoadingState`
- `EmptyState`
- `ErrorState`
- `InfoRow`
- `Field`
- Generic tabs, dialogs, action sheets, pull refresh, or infinite list primitives

Tasks:

- Before adding a shared UI primitive, add failing tests for the props, state, and callbacks used by
  the owning page.
- Before adding reusable icon SVGs, add or update asset validation coverage for kebab-case filenames,
  preserved `viewBox`, and `?react` exports from `src/shared/assets/icons/index.ts`.
- For `Page`, `NavigationBar`, `Button`, `LoadingState`, `EmptyState`, and `ErrorState`, add a
  verification entry to `execution.md` naming the route or screen where the primitive was checked.
- Put reusable icon SVG files in `src/shared/assets/icons`.
- Export reusable icons from `src/shared/assets/icons/index.ts` with `?react`.
- Put brand SVG files in `src/shared/assets/brand`.
- Put illustration or image SVG files in `src/shared/assets/images`.
- Keep icon SVG filenames kebab-case and preserve `viewBox`.

Asset rules:

- Reusable icon SVG files go in `src/shared/assets/icons`.
- Export reusable icons from `src/shared/assets/icons/index.ts` with `?react`.
- Brand SVG files go in `src/shared/assets/brand`.
- Illustration or image SVG files go in `src/shared/assets/images`.
- Keep icon SVG filenames kebab-case and preserve `viewBox`.

Validation:

- UI primitive tests prove non-trivial behavior such as controlled state, disabled/loading states,
  accessibility labels, callbacks, or keyboard/touch interaction.
- For `Page`, `NavigationBar`, `Button`, `LoadingState`, `EmptyState`, and `ErrorState`, record
  visual or interaction verification in `execution.md`, including the screen or route where the
  primitive was checked.
- Asset validation proves icon SVGs keep `viewBox`, use kebab-case filenames, and are exported with
  `?react` only from `src/shared/assets/icons/index.ts`.

## Mock Data And Repository Rules

For every migrated server-backed flow:

- Add or update a domain repository contract.
- Add a mock implementation under `src/infrastructure/repositories/<module>`.
- Export the mock implementation through the repository facade:

```ts
export { clientRepositoryMock as clientRepository } from "./clientRepository.mock";
```

- Keep deterministic fixtures under `src/infrastructure/mock`.
- Use stable IDs and explicit timestamps.
- Do not use `Date.now()`, random IDs, random ordering, timers, or environment-dependent data.
- Use an in-memory mock store only when a mutation result must be read back by queries.
- Do not use `localStorage`, `sessionStorage`, IndexedDB, cookies, or remote services for mock state.
- If a mutation is intentionally no-op because no migrated page reads the changed value afterward, document that choice in a mock repository test.
- During a migration slice, delete replaced HTTP repository implementations, tests, or facades for
  the migrated server-backed behavior unless a separate approved task keeps them. Repository facades
  for migrated behavior must export the mock implementation only.

## Query Key Rules

- Add stable query keys in `src/infrastructure/query/queryKeys.ts`.
- Keep route params and committed query params in keys.
- Do not use mutable draft state objects directly as keys.
- Invalidate or update only the relevant keys after mutations.

## Form And Validation Rules

- Use React Hook Form and Zod for validation-bearing forms.
- Keep pure business validation in `domain`.
- Keep form-specific schemas close to the feature or capability that renders the form.
- Keep domain types independent from React Hook Form and Zod unless the schema is explicitly part of a use-case boundary.

## Testing Matrix

For each migrated slice, complete the phase's `Add failing coverage` tasks before implementation.
Use these locations for the test files:

| Change type         | Test location                                                            |
| ------------------- | ------------------------------------------------------------------------ |
| Domain rules        | colocated `*.test.ts` beside the rule                                    |
| Use cases           | `src/application/<module>/*UseCases.test.ts`                             |
| Mock repositories   | `src/infrastructure/repositories/<module>`                               |
| Query hooks         | relevant `src/features/<module>/queries` folder                          |
| Views               | relevant `src/features/<module>/views` folder                            |
| Route metadata      | `src/app/router/routeMeta.test.ts`                                       |
| Route mode dispatch | relevant route file under `src/pages/<module>`                           |
| Shared UI behavior  | relevant `src/shared/ui` folder                                          |
| Playwright e2e      | `e2e` or `tests/e2e` folder for flows listed in E2E Coverage Assignments |

Record Playwright results in `execution.md` only for phases listed in E2E Coverage Assignments.

Before handing back migrated code, run:

```bash
pnpm lint
pnpm format:check
pnpm test
```

For phases 0, 1, 2, 5, and 6, also run:

```bash
pnpm e2e
```

For phases 0, 5, and 8, also run:

```bash
pnpm build
```

## Per-Slice Definition Of Done

A migrated slice is done when:

- Public route shape matches `/ops/client...` where applicable.
- Route metadata exists.
- Route component is thin, does not own server state, and renders through `RouteModeSwitch`.
- Feature view owns page composition.
- UI migration preserves business behavior, information structure, and primary interaction patterns.
- Pixel-level visual parity is not required unless screenshots, design files, a runnable old page, or explicit visual acceptance criteria are provided for the slice.
- Server state uses TanStack Query.
- Business behavior goes through application use cases.
- Domain contracts and rules are framework-free.
- Repository implementation is mock-only and deterministic.
- Query keys are centralized.
- Tests listed in the owning phase tasks have been added or updated; skipped phase task cases are
  documented as not reachable.
- `pnpm lint`, `pnpm format:check`, and `pnpm test` pass for completed code changes.
- `pnpm e2e` passes for phases 0, 1, 2, 5, and 6.
