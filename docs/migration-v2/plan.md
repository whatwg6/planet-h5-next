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

The current project already contains placeholder business routes and modules. V2 keeps the production
route contract on `/ops/client...` and migrates existing placeholder behavior into that route shape.

| Area          | V2 target                                               |
| ------------- | ------------------------------------------------------- |
| Client list   | `/ops/client`                                           |
| Client detail | `/ops/client/$clientId`                                 |
| Plan detail   | `/ops/client/$clientId/plan/$planId`                    |
| Plan settings | `/ops/client/$clientId/plan/$planId/setting`            |
| Client order  | `/ops/client/$clientId/plan/$planId/order/$orderParams` |

Do not keep legacy `/client...` development routes for this migration. Remove or replace them with
`/ops/client...` route entries when the corresponding migrated route is implemented.

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

- Add status beside the relevant task or table row before starting any slice that is not already
  listed.
- Update the owning task or table row when work starts, completes, or becomes blocked.
- For mode or capability inventories, use `Status` and `Evidence / blocker` columns.
- Record detailed historical results in `execution.md`; keep `plan.md` as the current status index.
- Set a phase to `Done` only when every required task or mode for that phase is `Done` and the phase
  validation has passed or is explicitly recorded as not applicable.

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

Validation:

- Add or update `src/app/router/routeMeta.test.ts`.
- Add route registration coverage in existing router tests if route shape behavior changes.

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

- Query hook test for list params and deterministic mock results.
- View test for loading, empty, error, and populated list states when behavior is migrated.
- Route metadata test.

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

| Route mode                               | Target                                        | Status        | Evidence / blocker |
| ---------------------------------------- | --------------------------------------------- | ------------- | ------------------ |
| `plan`                                   | `ClientMealPlansView`                         | `Not started` | Not started        |
| `setting`                                | `ClientSettingsView`                          | `Not started` | Not started        |
| `nameAndRemark`                          | `ClientNameAndRemarkView`                     | `Not started` | Not started        |
| `nameAndRemarkEdit`                      | `ClientDetailEditView` or a focused edit view | `Not started` | Not started        |
| `notification`                           | `ClientNotificationSettingsView`              | `Not started` | Not started        |
| `paymentMethod`                          | `features/payment-method` capability          | `Not started` | Not started        |
| `mealType`                               | `ClientMealSettingsView`                      | `Not started` | Not started        |
| `mealTypeSetting`                        | focused meal type edit view                   | `Not started` | Not started        |
| `mealGroup`                              | `ClientMealSettingsView`                      | `Not started` | Not started        |
| `manager`                                | `ClientManagerSettingsView`                   | `Not started` | Not started        |
| `support`                                | `ClientSupportSettingsView`                   | `Not started` | Not started        |
| `supportEdit`                            | focused support edit view                     | `Not started` | Not started        |
| `department`                             | `ClientDepartmentSettingsView`                | `Not started` | Not started        |
| `departmentEdit`                         | focused department edit view                  | `Not started` | Not started        |
| `costCenter`                             | `ClientCostCenterSettingsView`                | `Not started` | Not started        |
| `costCenterEdit`                         | focused cost center edit view                 | `Not started` | Not started        |
| `appVersion`                             | `ClientAppVersionSettingsView`                | `Not started` | Not started        |
| `meicanCard`                             | `features/card-setting` capability            | `Not started` | Not started        |
| `externalCard`                           | `features/card-setting` capability            | `Not started` | Not started        |
| `mealPoint`                              | `ClientMealSettingsView`                      | `Not started` | Not started        |
| `fieldSetting`                           | `ClientFieldSettingsView`                     | `Not started` | Not started        |
| `fieldSettingDetail`                     | focused field setting detail view             | `Not started` | Not started        |
| `loginSetting`                           | `ClientLoginSettingsView`                     | `Not started` | Not started        |
| `loginSettingEmployeeNumber`             | focused employee number login view            | `Not started` | Not started        |
| `loginSettingThirdParty`                 | focused third-party login view                | `Not started` | Not started        |
| `loginSettingThirdPartyDetail`           | focused third-party login detail view         | `Not started` | Not started        |
| `loginSettingThirdPartyAssociateSetting` | focused third-party associate setting view    | `Not started` | Not started        |
| `loginSettingThirdPartyMealplanSetting`  | focused third-party meal plan setting view    | `Not started` | Not started        |
| `passwordSetting`                        | `ClientPasswordSettingsView`                  | `Not started` | Not started        |
| `passwordComplexitySetting`              | focused password complexity view              | `Not started` | Not started        |
| `passwordPeriodSetting`                  | focused password period view                  | `Not started` | Not started        |

Validation:

- Route mode dispatch tests for every implemented mode.
- Use case tests for detail and update behavior.
- Mock repository tests for deterministic reads and in-memory updates.

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

- Domain rule tests for pure validation.
- Form tests for each migrated validation-bearing mode must cover valid submit, at least one invalid
  input, and cancel or back behavior when the form has unsaved local state.
- Mutation tests must cover mutation readback when the page reads the changed value afterward.
- Route dispatch tests for newly implemented modes.

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
- Keep old client list and plan detail empty page-type enums as default pages unless old source adds reachable page types before migration.
- Translate old plan display mappings and constants into domain, application, or feature files by responsibility.
- Keep any route navigation to settings on `/ops/client/$clientId/plan/$planId/setting`.

Validation:

- Query hook test for plan detail key and mock result.
- Use case and mock repository tests.
- Route metadata test.

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

| Route mode                  | Target                                        | Status        | Evidence / blocker |
| --------------------------- | --------------------------------------------- | ------------- | ------------------ |
| `baseInfo`                  | focused plan base info view                   | `Not started` | Not started        |
| `baseInfoEdit`              | focused plan base info edit view              | `Not started` | Not started        |
| `operationDay`              | focused operation day view                    | `Not started` | Not started        |
| `restriction`               | focused merchant restriction view             | `Not started` | Not started        |
| `memberCount`               | focused member count view, if still reachable | `Not started` | Not started        |
| `clientMemberList`          | `features/client-member` capability           | `Not started` | Not started        |
| `clientMemberDetail`        | `features/client-member` capability           | `Not started` | Not started        |
| `openTimesDinnerIn`         | focused dinner-in open times view             | `Not started` | Not started        |
| `openTimesGroupDelivery`    | focused group delivery open times view        | `Not started` | Not started        |
| `maximumOrderAmount`        | focused maximum order amount view             | `Not started` | Not started        |
| `hidePrice`                 | focused hide price view                       | `Not started` | Not started        |
| `hidePriceAndMealPoint`     | focused hide price and meal point view        | `Not started` | Not started        |
| `disableAppendDish`         | focused disable append dish view              | `Not started` | Not started        |
| `hiddenAccountTypes`        | focused hidden account types view             | `Not started` | Not started        |
| `dishRemark`                | focused dish remark view                      | `Not started` | Not started        |
| `deliveryRemark`            | focused delivery remark view                  | `Not started` | Not started        |
| `orderRule`                 | focused order rule view                       | `Not started` | Not started        |
| `paymentMethod`             | `features/payment-method` capability          | `Not started` | Not started        |
| `paymentMethodSelectConfig` | `features/payment-method` capability          | `Not started` | Not started        |
| `manuallyConfirmOrder`      | focused manually confirm order view           | `Not started` | Not started        |
| `occupationTime`            | focused occupation time view                  | `Not started` | Not started        |
| `orderTransfer`             | focused order transfer view                   | `Not started` | Not started        |
| `merchantOrderVerification` | focused merchant verification view            | `Not started` | Not started        |
| `pickupSetting`             | focused pickup setting view                   | `Not started` | Not started        |
| `pickUpMealCodeRule`        | focused pickup meal code view                 | `Not started` | Not started        |
| `menuStyle`                 | focused menu style view                       | `Not started` | Not started        |
| `financeConfig`             | focused finance config view                   | `Not started` | Not started        |
| `financeConfigAmount`       | focused finance amount view                   | `Not started` | Not started        |
| `financeConfigMealType`     | focused finance meal type view                | `Not started` | Not started        |
| `location`                  | focused location setting view                 | `Not started` | Not started        |

Validation:

- Route mode dispatch tests for every implemented mode.
- Domain and schema tests for validation-bearing settings.
- Mock repository tests for deterministic save behavior.
- Mutation hook tests for the exact query keys invalidated or cache entries updated after saves.
- View tests for each implemented setting editor must cover loading, success, validation error, and
  save failure states when those states are reachable.

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
- Keep route code limited to reading the raw `orderParams` path param and passing it down. Put parsing, validation, and display rules in application or domain helpers, not in route components or view-only string handling.
- Migrate merchant schedule info used by the order detail page.
- Migrate price summary display rules, including multiple price summary cases in deterministic mock
  data.
- Migrate default time schedule behavior when it affects order detail or member order list display.
- Cover multiple order statuses in domain display rules and mock fixtures.

Validation:

- Query hook tests for order detail and member order list, including status and schedule variants.
- Route mode dispatch test for `clientMemberOrderList`.
- Domain tests for valid and invalid `orderParams`, order status display, schedule display, and price
  summary rules.
- Mock repository tests for multiple order statuses, merchant schedule info, and price summary cases.

## Phase 7: Shared Business Capability Modules

Status: `Not started`

Objective: migrate reusable business-aware capabilities only when a migrated page needs them.
Capabilities that are required by earlier client, plan, or order slices must be migrated inside those
owning slices. This phase is only for capability work that remains after the owning slices have been
implemented.

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

- Component or hook tests for reusable capability behavior.
- Owning page tests for integration paths that save or invalidate data.

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

- UI primitive tests only where behavior is non-trivial.
- Visual or interaction verification for high-use primitives.

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

Minimum test checklist by slice type:

| Slice type              | Minimum test cases                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| Route contract          | registered path, route metadata, required params, and route stack rendering through `RouteModeSwitch`    |
| Route mode              | default page rendering, each implemented mode dispatch, unknown mode fallback, and back navigation       |
| Query-backed read view  | query key params, deterministic success fixture, loading state, empty state, error state, and retry path |
| Mutation-backed flow    | valid command, deterministic mock result, mutation readback when applicable, and exact query update      |
| Validation-bearing form | default values, valid submit, invalid input messages, cancel/back behavior, and save failure state       |
| Mock repository         | success fixture, empty or missing result, deterministic ordering, in-memory update, and no random values |
| Shared capability       | required props, local state behavior, validation schema, save handoff, and owning-page integration       |

Manual H5 stack checks are required for route, route mode, and cross-page navigation slices:

- Open the route directly with required params.
- Navigate forward from the owning list or detail page.
- Push a same-URL route mode through `routeModeState`.
- Use browser or H5 back navigation and verify the previous stack entry is restored.
- Verify replace navigation does not leave stale stack entries.

Before handing back migrated code, run:

```bash
pnpm lint
pnpm format:check
pnpm test
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
- Server state uses TanStack Query.
- Business behavior goes through application use cases.
- Domain contracts and rules are framework-free.
- Repository implementation is mock-only and deterministic.
- Query keys are centralized.
- Tests cover the applicable minimum test checklist for the slice type, or the skipped cases are
  documented as not reachable.
- `pnpm lint`, `pnpm format:check`, and `pnpm test` pass for completed code changes.
