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

Do not keep legacy `/client...` development routes for this migration. Remove or replace them with
`/ops/client...` route entries when the corresponding migrated route is implemented.

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

## Validation Evidence Standard

Validation must produce reviewable evidence, not only a statement that testing was considered.

For every completed slice, record the following in `execution.md`:

- Old source inspected, including file paths or symbols.
- Tests added or updated, including exact test file paths.
- Behavior covered by those tests, stated as concrete cases.
- Commands run, with pass/fail result.
- Playwright checks run when required, with route, route mode, viewport, and interaction exercised.
- Any skipped checklist item as `N/A`, with the reason it is not reachable or not applicable.

Do not mark a slice or phase `Done` with generic notes such as "tested", "covered", or "not
needed". If a validation item cannot be proven with an automated test, record the manual check or the
reason a test would not add useful coverage.

## Playwright Validation Standard

Use Playwright to constrain real H5 route, stack, and interaction behavior. React Testing Library and
Vitest prove component and logic contracts; Playwright proves the migrated flow works in a browser.

Phase 0 must introduce the Playwright harness if it is not already present:

- Add a `pnpm e2e` script.
- Add Playwright configuration with a mobile H5 viewport.
- Configure the test web server to run the Vite app.
- Add a smoke test that can open the app and verify the `/ops/client` entry route.

For every route, route mode, cross-page navigation, high-use shared UI, or browser-only interaction
slice, add or update Playwright tests that prove the relevant user-visible flow. At minimum, cover:

- Direct route open with required params.
- Forward navigation from the owning page.
- Same-URL `routeMode` navigation when the slice implements a route mode.
- Browser back navigation restoring the previous stack entry.
- Replace navigation not leaving stale stack entries when replace behavior is part of the slice.
- Mobile viewport layout sanity for the migrated page or mode.

Manual browser checks are allowed only when Playwright cannot reasonably automate the case. Record the
reason, route, viewport, and observed result in `execution.md`.

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

- Add or update TanStack Router definitions in `src/app/router/routeTree.tsx` for:
  - `/ops/client`
  - `/ops/client/$clientId`
  - `/ops/client/$clientId/plan/$planId`
  - `/ops/client/$clientId/plan/$planId/setting`
  - `/ops/client/$clientId/plan/$planId/order/$orderParams`
- Add matching metadata in `src/app/router/routeMeta.ts`.
- Replace placeholder behavior on `/ops/client...` routes with migrated business behavior as each
  slice is completed.
- Remove legacy `/client...` development routes.
- Ensure route entry components that read params accept `RouteStackPageProps` and fall back to `useParams({ strict: false, shouldThrow: false })`.
- Keep `RouteStack` as the only page-stack renderer. Do not add a second route table or pathname matcher.
- Introduce the Playwright e2e harness described in the Playwright Validation Standard when it is not
  already present.

Validation:

- `src/app/router/routeMeta.test.ts` proves metadata exists for each required `/ops/client...` route.
- Router coverage proves all five `/ops/client...` paths are registered and legacy `/client...`
  development routes are absent.
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

- Preserve the public route as `/ops/client`.
- Move business list filters, status mappings, and display constants into the narrowest appropriate layer.
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

- Preserve the public route as `/ops/client/$clientId/plan/$planId/setting`.
- Render the route through `RouteModeSwitch`.
- Convert each old `PlanSettingPageEnum` value into a `routeMode`.
- Use `features/setting-rule` or another focused feature capability for reusable business editors only when ownership boundaries are clean.
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

Asset rules:

- Reusable icon SVG files go in `src/shared/assets/icons`.
- Export reusable icons from `src/shared/assets/icons/index.ts` with `?react`.
- Brand SVG files go in `src/shared/assets/brand`.
- Illustration or image SVG files go in `src/shared/assets/images`.
- Keep icon SVG filenames kebab-case and preserve `viewBox`.

Validation:

- UI primitive tests prove non-trivial behavior such as controlled state, disabled/loading states,
  accessibility labels, callbacks, or keyboard/touch interaction.
- For high-use primitives, record visual or interaction verification in `execution.md`, including the
  screen or route where the primitive was checked.
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

Run the narrowest useful test for each migrated slice:

| Change type         | Test location                                   |
| ------------------- | ----------------------------------------------- |
| Domain rules        | colocated `*.test.ts` beside the rule           |
| Use cases           | `src/application/<module>/*UseCases.test.ts`    |
| Mock repositories   | `src/infrastructure/repositories/<module>`      |
| Query hooks         | relevant `src/features/<module>/queries` folder |
| Views               | relevant `src/features/<module>/views` folder   |
| Route metadata      | `src/app/router/routeMeta.test.ts`              |
| Route mode dispatch | relevant route file under `src/pages/<module>`  |
| Shared UI behavior  | relevant `src/shared/ui` folder                 |
| Playwright e2e      | `e2e` or `tests/e2e` folder                     |

Minimum test checklist by slice type:

Apply only the rows that match the slice. If a listed case is not reachable for that slice, record it
as `N/A` in `execution.md` with a concrete reason.

| Slice type              | Minimum test cases                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| Route contract          | registered path, route metadata, required params, and route stack rendering through `RouteModeSwitch`    |
| Route mode              | default page rendering, each implemented mode dispatch, unknown mode fallback, and back navigation       |
| Query-backed read view  | query key params, deterministic success fixture, loading state, empty state, error state, and retry path |
| Mutation-backed flow    | valid command, deterministic mock result, mutation readback when applicable, and exact query update      |
| Validation-bearing form | default values, valid submit, invalid input messages, cancel/back behavior, and save failure state       |
| Mock repository         | success fixture, empty or missing result, deterministic ordering, in-memory update, and no random values |
| Shared capability       | required props, local state behavior, validation schema, save handoff, and owning-page integration       |
| Playwright flow         | direct route open, forward navigation, route mode navigation, browser back, and mobile viewport sanity   |

Playwright H5 stack checks are required for route, route mode, and cross-page navigation slices:

- Open the route directly with required params.
- Navigate forward from the owning list or detail page.
- Push a same-URL route mode through `routeModeState`.
- Use browser or H5 back navigation and verify the previous stack entry is restored.
- Verify replace navigation does not leave stale stack entries.

Record Playwright H5 stack check results in the slice entry in `execution.md`. If a check falls back
to manual verification, record the reason and observed result.

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

For broad route, build, or shared UI changes, also run:

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
- Tests cover the applicable minimum test checklist for the slice type, or the skipped cases are
  documented as not reachable.
- `pnpm lint`, `pnpm format:check`, and `pnpm test` pass for completed code changes.
- `pnpm e2e` passes when the slice changes route, route mode, cross-page navigation, shared UI, or
  browser interaction behavior.
