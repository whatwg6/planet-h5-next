# Business Migration Plan V2

This plan turns `docs/business-migration-specs-v2.md` into an executable migration checklist for moving business-facing H5 pages from the old `planet-h5` project into this project.

Architectural boundaries remain defined by `docs/architecture-design.md`. This document is only the migration execution plan.

## Goals

- Migrate the old client, plan, and client order business flows into the new lightweight Clean Architecture.
- Preserve the old public business route shape based on `/ops/client-next...`.
- Use deterministic mock repositories for every migrated server-backed behavior.
- Convert old `pageType` page states into TanStack Router `routeMode` states.
- Keep route files thin and move page composition into feature views.
- Keep business-aware reusable UI in focused feature capability modules, not in `shared/ui`.

## Non-Goals

- Do not integrate real APIs.
- Do not migrate old generated API clients, request clients, SSO, login callback, token injection, hybrid bridge behavior, S3 upload, deployment, monitoring, or dev demo pages.
- Do not copy old folders wholesale into the new project.
- Do not add new production route shapes to replace `/ops/client-next...`.
- Do not persist mock mutation state outside the current browser or test process.

## Current Gap Summary

The current project already contains placeholder business routes and modules, but v2 migration changes the required production route contract:

| Area          | Current project shape                                   | V2 target                                                    |
| ------------- | ------------------------------------------------------- | ------------------------------------------------------------ |
| Client list   | `/ops/client`                                           | `/ops/client-next`                                           |
| Client detail | `/ops/client/$clientId`                                 | `/ops/client-next/$clientId`                                 |
| Plan detail   | `/ops/client/$clientId/plan/$planId`                    | `/ops/client-next/$clientId/plan/$planId`                    |
| Plan settings | `/ops/client/$clientId/plan/$planId/setting`            | `/ops/client-next/$clientId/plan/$planId/setting`            |
| Client order  | `/ops/client/$clientId/plan/$planId/order/$orderParams` | `/ops/client-next/$clientId/plan/$planId/order/$orderParams` |

The migration should treat existing `/client...` and `/ops/client...` routes as local-only compatibility or placeholders unless a later task explicitly changes the production route contract. They must not become duplicate production business routes or replace `/ops/client-next...`.

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

Use the `Status` line under each phase as the source of truth for migration progress.

Status values:

- `Not started`: no v2 migration work has been completed for this phase.
- `In progress`: implementation has started, but the phase definition of done is not met.
- `Blocked`: implementation cannot continue without a decision or external dependency.
- `Done`: implementation and required validation for the phase are complete.

## Phase 0: Baseline Cleanup And Route Contract

Status: `Not started`

Objective: align the new project with the v2 route contract before deeper page migration.

Tasks:

- Add or update TanStack Router definitions in `src/app/router/routeTree.tsx` for:
  - `/ops/client-next`
  - `/ops/client-next/$clientId`
  - `/ops/client-next/$clientId/plan/$planId`
  - `/ops/client-next/$clientId/plan/$planId/setting`
  - `/ops/client-next/$clientId/plan/$planId/order/$orderParams`
- Add matching metadata in `src/app/router/routeMeta.ts`.
- Decide per task whether existing `/ops/client...` placeholder routes remain as local-only temporary compatibility routes or are removed. They must not be treated as migrated production routes.
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

- Preserve the public route as `/ops/client-next`.
- Move business list filters, status mappings, and display constants into the narrowest appropriate layer.
- Keep list server state in TanStack Query.
- Use Zustand only for local interaction state such as draft filters or scroll position.
- Navigate to client detail through `/ops/client-next/$clientId`.
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

- Preserve the public route as `/ops/client-next/$clientId`.
- Render the route through `RouteModeSwitch`.
- Use `read` as the default behavior and keep feature views unaware of `location.state`.
- Translate old client backend response fields into domain entities and deterministic fixtures.
- Add update mutations only for behavior that the migrated page reads back afterward.

Client detail route modes to plan under this route:

| Route mode                               | Target                                        |
| ---------------------------------------- | --------------------------------------------- |
| `plan`                                   | `ClientMealPlansView`                         |
| `setting`                                | `ClientSettingsView`                          |
| `nameAndRemark`                          | `ClientNameAndRemarkView`                     |
| `nameAndRemarkEdit`                      | `ClientDetailEditView` or a focused edit view |
| `notification`                           | `ClientNotificationSettingsView`              |
| `paymentMethod`                          | `features/payment-method` capability          |
| `mealType`                               | `ClientMealSettingsView`                      |
| `mealTypeSetting`                        | focused meal type edit view                   |
| `mealGroup`                              | `ClientMealSettingsView`                      |
| `manager`                                | `ClientManagerSettingsView`                   |
| `support`                                | `ClientSupportSettingsView`                   |
| `supportEdit`                            | focused support edit view                     |
| `department`                             | `ClientDepartmentSettingsView`                |
| `departmentEdit`                         | focused department edit view                  |
| `costCenter`                             | `ClientCostCenterSettingsView`                |
| `costCenterEdit`                         | focused cost center edit view                 |
| `appVersion`                             | `ClientAppVersionSettingsView`                |
| `meicanCard`                             | `features/card-setting` capability            |
| `externalCard`                           | `features/card-setting` capability            |
| `mealPoint`                              | `ClientMealSettingsView`                      |
| `fieldSetting`                           | `ClientFieldSettingsView`                     |
| `fieldSettingDetail`                     | focused field setting detail view             |
| `loginSetting`                           | `ClientLoginSettingsView`                     |
| `loginSettingEmployeeNumber`             | focused employee number login view            |
| `loginSettingThirdParty`                 | focused third-party login view                |
| `loginSettingThirdPartyDetail`           | focused third-party login detail view         |
| `loginSettingThirdPartyAssociateSetting` | focused third-party associate setting view    |
| `loginSettingThirdPartyMealplanSetting`  | focused third-party meal plan setting view    |
| `passwordSetting`                        | `ClientPasswordSettingsView`                  |
| `passwordComplexitySetting`              | focused password complexity view              |
| `passwordPeriodSetting`                  | focused password period view                  |

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
- Mutation hook or view tests for forms with important branching behavior.
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

- Preserve the public route as `/ops/client-next/$clientId/plan/$planId`.
- Keep old client list and plan detail empty page-type enums as default pages unless old source adds reachable page types before migration.
- Translate old plan display mappings and constants into domain, application, or feature files by responsibility.
- Keep any route navigation to settings on `/ops/client-next/$clientId/plan/$planId/setting`.

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

- Preserve the public route as `/ops/client-next/$clientId/plan/$planId/setting`.
- Render the route through `RouteModeSwitch`.
- Convert each old `PlanSettingPageEnum` value into a `routeMode`.
- Use `features/setting-rule` or another focused feature capability for reusable business editors only when ownership boundaries are clean.
- Keep all saves in the plan mutation and application use case.

Plan settings route modes to plan under this route:

| Route mode                  | Target                                        |
| --------------------------- | --------------------------------------------- |
| `baseInfo`                  | focused plan base info view                   |
| `baseInfoEdit`              | focused plan base info edit view              |
| `operationDay`              | focused operation day view                    |
| `restriction`               | focused merchant restriction view             |
| `memberCount`               | focused member count view, if still reachable |
| `clientMemberList`          | `features/client-member` capability           |
| `clientMemberDetail`        | `features/client-member` capability           |
| `openTimesDinnerIn`         | focused dinner-in open times view             |
| `openTimesGroupDelivery`    | focused group delivery open times view        |
| `maximumOrderAmount`        | focused maximum order amount view             |
| `hidePrice`                 | focused hide price view                       |
| `hidePriceAndMealPoint`     | focused hide price and meal point view        |
| `disableAppendDish`         | focused disable append dish view              |
| `hiddenAccountTypes`        | focused hidden account types view             |
| `dishRemark`                | focused dish remark view                      |
| `deliveryRemark`            | focused delivery remark view                  |
| `orderRule`                 | focused order rule view                       |
| `paymentMethod`             | `features/payment-method` capability          |
| `paymentMethodSelectConfig` | `features/payment-method` capability          |
| `manuallyConfirmOrder`      | focused manually confirm order view           |
| `occupationTime`            | focused occupation time view                  |
| `orderTransfer`             | focused order transfer view                   |
| `merchantOrderVerification` | focused merchant verification view            |
| `pickupSetting`             | focused pickup setting view                   |
| `pickUpMealCodeRule`        | focused pickup meal code view                 |
| `menuStyle`                 | focused menu style view                       |
| `financeConfig`             | focused finance config view                   |
| `financeConfigAmount`       | focused finance amount view                   |
| `financeConfigMealType`     | focused finance meal type view                |
| `location`                  | focused location setting view                 |

Validation:

- Route mode dispatch tests for every implemented mode.
- Domain and schema tests for validation-bearing settings.
- Mock repository tests for deterministic save behavior.
- Mutation hook tests for query invalidation or cache updates after saves.
- View tests for high-risk setting editors.

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

- Preserve the public route as `/ops/client-next/$clientId/plan/$planId/order/$orderParams`.
- Render the route through `RouteModeSwitch`.
- Use the default page for order detail.
- Convert old `clientMemberOrderList` page type into the `clientMemberOrderList` route mode.
- Keep route code limited to reading the raw `orderParams` path param and passing it down. Put parsing, validation, and display rules in application or domain helpers, not in route components or view-only string handling.

Validation:

- Query hook tests for order detail and member order list.
- Route mode dispatch test for `clientMemberOrderList`.
- Domain tests for order param parsing or display rules.

## Phase 7: Shared Business Capability Modules

Status: `Not started`

Objective: migrate reusable business-aware capabilities only when a migrated page needs them.

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

- Public route shape matches `/ops/client-next...` where applicable.
- Route metadata exists.
- Route component is thin and renders through `RouteModeSwitch` when modes exist.
- Feature view owns page composition.
- Server state uses TanStack Query.
- Business behavior goes through application use cases.
- Domain contracts and rules are framework-free.
- Repository implementation is mock-only and deterministic.
- Query keys are centralized.
- Tests cover the changed route, use case, repository, hook, or view behavior at the narrowest useful level.
- `pnpm lint`, `pnpm format:check`, and `pnpm test` pass for completed code changes.

## Open Questions To Confirm Before Implementation

These should be resolved when starting implementation, not while drafting this plan:

1. Should existing `/ops/client...` routes remain as compatibility routes after `/ops/client-next...` is added, or should they be removed?
2. Should legacy `/client...` development routes remain available locally?
3. Which old page modes are still reachable in production and must be migrated first?
4. Which focused setting modes can be deferred behind placeholders, and which need complete form behavior in the first migration batch?
5. Should merchant list and merchant detail remain outside this v2 migration scope unless required by merchant selection capability work?
