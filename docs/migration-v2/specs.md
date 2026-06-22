# Business Migration Specs V2

This document defines how to migrate business pages from `/Users/yxc/code/planet-h5` into this project.

It is a migration guide, not a general architecture guide. Architectural boundaries remain defined by `../architecture-design.md`.

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

All migrated data must use mock repositories. Do not call old APIs because the old API surface is no longer reliable.

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

Runtime data flow:

```txt
features/<module>/queries or mutations
  -> application/<module>/<useCase>.ts
    -> domain/<module>/<Repository>.ts
      -> infrastructure/repositories/<module>/<module>Repository.mock.ts
        -> infrastructure/mock/<module>MockData.ts
```

This diagram describes call flow, not import direction. The dependency boundary remains:

```txt
pages -> features -> application -> domain
infrastructure -> domain
```

`domain` defines repository contracts. `infrastructure` implements those contracts. Feature query and
mutation hooks import the application use case and the selected repository facade, then pass the
repository into the use case. Application and domain code must not import infrastructure.

Repository facades must export the mock implementation:

```ts
export { clientRepositoryMock as clientRepository } from "./clientRepository.mock";
```

Do not add HTTP implementations for migrated business unless a later task explicitly changes this policy.

Mock mutations must be deterministic:

- Prefer returning the updated domain entity or command result directly from the mock repository.
- If the surrounding flow needs query invalidation to show the update, keep an in-memory mock store
  inside the repository or mock module. The update only needs to persist for the current browser/test
  process.
- Do not persist mock mutation state to `localStorage`, `sessionStorage`, IndexedDB, cookies, or a
  remote service.
- Do not use `Date.now()`, random IDs, random ordering, timers, or environment-dependent values in
  mock data or mock mutation results.
- Use stable fixture IDs and explicit fixture timestamps when an entity needs an ID or time field.
- A no-op mutation is allowed only when the migrated page does not read the changed value afterward;
  document that choice in the mock repository test.

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

Old `react-router-dom` routes migrate to TanStack Router route definitions in:

```txt
src/app/router/routeTree.tsx
src/app/router/routeMeta.ts
src/pages/<module>/<Route>.tsx
```

Migrated business route paths must follow the old `planet-h5` business routes. Use the old
`src/constants/index.ts` `RoutePath` values as the route source of truth, excluding out-of-scope
system and dev routes.

Current business route inventory from old `planet-h5`:

```txt
old RoutePath.client
  /ops/client-next
  -> client list route

old RoutePath.clientDetail
  /ops/client-next/:id
  -> client detail route

old RoutePath.clientPlanDetail
  /ops/client-next/:id/plan/:planId
  -> plan detail route

old RoutePath.clientPlanDetailSetting
  /ops/client-next/:id/plan/:planId/setting
  -> plan settings route

old RoutePath.clientOrder
  /ops/client-next/:id/plan/:planId/order/:orderParams
  -> client order route
```

When registering these in TanStack Router, preserve the URL shape and convert path parameter syntax
only as required by TanStack Router. For example, old `:id` may become a TanStack Router path
parameter such as `$clientId`, but the public route shape must remain equivalent to the old
`planet-h5` route.

Do not invent new production route paths from the current project's existing placeholders. In
particular, do not replace old `/ops/client-next...` routes with `/ops/client...` routes during this
migration unless a later task explicitly changes the route contract.

Do not migrate old system or development routes:

```txt
/login/callback
/not-found
/_dev
```

Route entry components must stay thin. They may:

- Read route params.
- Read current pathname when choosing a compatibility route shape.
- Call query or mutation hooks.
- Handle loading and error states.
- Own navigation callbacks.
- Render `RouteModeSwitch`.

Route entry components must not contain large page layouts or business rendering.

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

Old pattern:

```tsx
usePageTypeDispatcher({
  pageType,
  defaultPage: <Detail />,
  pages: {
    setting: () => <Setting />,
  },
});
```

New pattern:

```tsx
<RouteModeSwitch
  defaultPage={<ClientDetailView />}
  modes={{
    setting: <ClientSettingsView />,
  }}
/>
```

Do not create extra URL paths for same-resource modes. For example, edit, settings, nested selectors, and detail subpanels that were old `pageType` states should become `routeMode` states unless they are truly shareable standalone resources.

## Required Migration Inventory

Use this inventory as the initial executable map. If old `planet-h5` adds or removes business
pageTypes before migration, update this section first, then implement code.

Route-level inventory:

| Old route                                              | Old entry                       | New TanStack route                                           | Route component                          | Default feature view                                 |
| ------------------------------------------------------ | ------------------------------- | ------------------------------------------------------------ | ---------------------------------------- | ---------------------------------------------------- |
| `/ops/client-next`                                     | `src/apps/client/client-list`   | `/ops/client-next`                                           | `src/pages/client/ClientListRoute.tsx`   | `src/features/client/views/ClientListView.tsx`       |
| `/ops/client-next/:id`                                 | `src/apps/client/client-detail` | `/ops/client-next/$clientId`                                 | `src/pages/client/ClientDetailRoute.tsx` | `src/features/client/views/ClientDetailView.tsx`     |
| `/ops/client-next/:id/plan/:planId`                    | `src/apps/client/plan-detail`   | `/ops/client-next/$clientId/plan/$planId`                    | `src/pages/plan/PlanDetailRoute.tsx`     | `src/features/plan/views/PlanDetailView.tsx`         |
| `/ops/client-next/:id/plan/:planId/setting`            | `src/apps/client/plan-setting`  | `/ops/client-next/$clientId/plan/$planId/setting`            | `src/pages/plan/PlanSettingsRoute.tsx`   | `src/features/plan/views/PlanSettingsView.tsx`       |
| `/ops/client-next/:id/plan/:planId/order/:orderParams` | `src/apps/client/client-order`  | `/ops/client-next/$clientId/plan/$planId/order/$orderParams` | `src/pages/order/ClientOrderRoute.tsx`   | `src/features/order/views/ClientOrderDetailView.tsx` |

Client detail page modes from old `ClientDetailPageEnum`:

| Old pageType                             | New routeMode                            | Target view or capability                   |
| ---------------------------------------- | ---------------------------------------- | ------------------------------------------- |
| default                                  | read                                     | `ClientDetailView`                          |
| `plan`                                   | `plan`                                   | `ClientMealPlansView`                       |
| `setting`                                | `setting`                                | `ClientSettingsView`                        |
| `nameAndRemark`                          | `nameAndRemark`                          | `ClientNameAndRemarkView`                   |
| `nameAndRemarkEdit`                      | `nameAndRemarkEdit`                      | `ClientDetailEditView` or focused edit view |
| `notification`                           | `notification`                           | `ClientNotificationSettingsView`            |
| `paymentMethod`                          | `paymentMethod`                          | `features/payment-method` capability        |
| `mealType`                               | `mealType`                               | `ClientMealSettingsView`                    |
| `mealTypeSetting`                        | `mealTypeSetting`                        | focused meal type edit view                 |
| `mealGroup`                              | `mealGroup`                              | `ClientMealSettingsView`                    |
| `manager`                                | `manager`                                | `ClientManagerSettingsView`                 |
| `support`                                | `support`                                | `ClientSupportSettingsView`                 |
| `supportEdit`                            | `supportEdit`                            | focused support edit view                   |
| `department`                             | `department`                             | `ClientDepartmentSettingsView`              |
| `departmentEdit`                         | `departmentEdit`                         | focused department edit view                |
| `costCenter`                             | `costCenter`                             | `ClientCostCenterSettingsView`              |
| `costCenterEdit`                         | `costCenterEdit`                         | focused cost center edit view               |
| `appVersion`                             | `appVersion`                             | `ClientAppVersionSettingsView`              |
| `meicanCard`                             | `meicanCard`                             | `features/card-setting` capability          |
| `externalCard`                           | `externalCard`                           | `features/card-setting` capability          |
| `mealPoint`                              | `mealPoint`                              | `ClientMealSettingsView`                    |
| `fieldSetting`                           | `fieldSetting`                           | `ClientFieldSettingsView`                   |
| `fieldSettingDetail`                     | `fieldSettingDetail`                     | focused field setting detail view           |
| `loginSetting`                           | `loginSetting`                           | `ClientLoginSettingsView`                   |
| `loginSettingEmployeeNumber`             | `loginSettingEmployeeNumber`             | focused employee number login view          |
| `loginSettingThirdParty`                 | `loginSettingThirdParty`                 | focused third-party login view              |
| `loginSettingThirdPartyDetail`           | `loginSettingThirdPartyDetail`           | focused third-party login detail view       |
| `loginSettingThirdPartyAssociateSetting` | `loginSettingThirdPartyAssociateSetting` | focused third-party associate setting view  |
| `loginSettingThirdPartyMealplanSetting`  | `loginSettingThirdPartyMealplanSetting`  | focused third-party meal plan setting view  |
| `passwordSetting`                        | `passwordSetting`                        | `ClientPasswordSettingsView`                |
| `passwordComplexitySetting`              | `passwordComplexitySetting`              | focused password complexity view            |
| `passwordPeriodSetting`                  | `passwordPeriodSetting`                  | focused password period view                |

Plan settings page modes from old `PlanSettingPageEnum`:

| Old pageType                | New routeMode               | Target view or capability                     |
| --------------------------- | --------------------------- | --------------------------------------------- |
| default                     | read                        | `PlanSettingsView`                            |
| `baseInfo`                  | `baseInfo`                  | focused plan base info view                   |
| `baseInfoEdit`              | `baseInfoEdit`              | focused plan base info edit view              |
| `operationDay`              | `operationDay`              | focused operation day view                    |
| `restriction`               | `restriction`               | focused merchant restriction view             |
| `memberCount`               | `memberCount`               | focused member count view, if still reachable |
| `clientMemberList`          | `clientMemberList`          | `features/client-member` capability           |
| `clientMemberDetail`        | `clientMemberDetail`        | `features/client-member` capability           |
| `openTimesDinnerIn`         | `openTimesDinnerIn`         | focused dinner-in open times view             |
| `openTimesGroupDelivery`    | `openTimesGroupDelivery`    | focused group delivery open times view        |
| `maximumOrderAmount`        | `maximumOrderAmount`        | focused maximum order amount view             |
| `hidePrice`                 | `hidePrice`                 | focused hide price view                       |
| `hidePriceAndMealPoint`     | `hidePriceAndMealPoint`     | focused hide price and meal point view        |
| `disableAppendDish`         | `disableAppendDish`         | focused disable append dish view              |
| `hiddenAccountTypes`        | `hiddenAccountTypes`        | focused hidden account types view             |
| `dishRemark`                | `dishRemark`                | focused dish remark view                      |
| `deliveryRemark`            | `deliveryRemark`            | focused delivery remark view                  |
| `orderRule`                 | `orderRule`                 | focused order rule view                       |
| `paymentMethod`             | `paymentMethod`             | `features/payment-method` capability          |
| `paymentMethodSelectConfig` | `paymentMethodSelectConfig` | `features/payment-method` capability          |
| `manuallyConfirmOrder`      | `manuallyConfirmOrder`      | focused manually confirm order view           |
| `occupationTime`            | `occupationTime`            | focused occupation time view                  |
| `orderTransfer`             | `orderTransfer`             | focused order transfer view                   |
| `merchantOrderVerification` | `merchantOrderVerification` | focused merchant verification view            |
| `pickupSetting`             | `pickupSetting`             | focused pickup setting view                   |
| `pickUpMealCodeRule`        | `pickUpMealCodeRule`        | focused pickup meal code view                 |
| `menuStyle`                 | `menuStyle`                 | focused menu style view                       |
| `financeConfig`             | `financeConfig`             | focused finance config view                   |
| `financeConfigAmount`       | `financeConfigAmount`       | focused finance amount view                   |
| `financeConfigMealType`     | `financeConfigMealType`     | focused finance meal type view                |
| `location`                  | `location`                  | focused location setting view                 |

Client order page modes from old `ClientOrderPageEnum`:

| Old pageType            | New routeMode           | Target view                 |
| ----------------------- | ----------------------- | --------------------------- |
| default                 | read                    | `ClientOrderDetailView`     |
| `clientMemberOrderList` | `clientMemberOrderList` | `ClientMemberOrderListView` |

Old client list and plan detail currently define empty pageType enums, so they migrate as default route
pages unless old `planet-h5` adds reachable pageTypes later.

Every row above that is implemented must have at least route mode dispatch coverage or focused view/hook
coverage, depending on the risk of the migrated behavior.

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

Route components that need params should follow this shape:

```tsx
export function SomeRoute({ routeParams }: RouteStackPageProps) {
  const params = useParams({ strict: false, shouldThrow: false });
  const id = routeParams?.id ?? params?.id ?? "";
}
```

Do not introduce direct `window.history` handling.

## Business Component Migration

Old `src/comps` components can move to `shared/ui` only when they are business-agnostic.

Examples:

```txt
Button
NavBar
Loading
EmptyState
ErrorState
InfoRow
Field
```

Old `src/biz/features` and `src/biz/comps` stay business-aware and must not move to `shared/ui`.

Examples:

```txt
payment-method
client-member
select-merchant
select-meican-staff
card-setting
```

Move these to focused feature capability modules under `src/features/<capability>`. Owning pages pass context through props, and saving remains in the owning page's mutation flow.

## Form and Validation Migration

Old form state and imperative page-local validation should be migrated to:

```txt
React Hook Form
Zod
features/<module>/views
features/<module>/mutations
application/<module>
domain/<module>
```

Use Zod for validation-bearing forms. Put pure business validation in `domain` when it is not tied to React form rendering.

## Assets Migration

Reusable icon SVG files go to:

```txt
src/shared/assets/icons
```

Export reusable SVG icons from:

```txt
src/shared/assets/icons/index.ts
```

Use the `?react` import suffix for icon components. Keep SVG filenames in kebab-case and preserve `viewBox`.

Illustration or image SVG files go to:

```txt
src/shared/assets/images
```

## Migration Order

Migrate by page flow, not by old directory.

Recommended order:

1. Client list.
2. Client detail default page.
3. Client detail route modes such as meal plans, settings, name and remark, support, login settings, password settings, and notification settings.
4. Plan detail.
5. Plan settings.
6. Client order detail and member order list.
7. Shared business capability modules required by the migrated flows.
8. Shared UI and assets discovered during those migrations.

Each migrated flow should include:

- Route registration.
- Route metadata.
- Page route component.
- Feature view.
- Query or mutation hook.
- Application use case.
- Domain entity and repository contract.
- Mock repository and deterministic mock data.
- Focused tests for the migrated behavior.

## Testing

Use the narrowest useful test for each migration:

- Domain rules: colocated `*.test.ts`.
- Use cases: `src/application/<module>/*UseCases.test.ts`.
- Mock repositories: `src/infrastructure/repositories/<module>`.
- Query hooks and views: tests under the relevant feature folder.
- Route metadata: `src/app/router/routeMeta.test.ts`.
- Route mode dispatch: tests under the relevant route file in `src/pages/<module>`.

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

## Prohibited Shortcuts

Do not:

- Copy old `src/apps`, `src/biz`, or `src/comps` folders directly into the new project.
- Import old API clients from new pages or features.
- Call real APIs.
- Recreate old hybrid navigation, SSO, login callback, or deployment behavior.
- Put business components in `shared/ui`.
- Put large layouts inside `pages`.
- Let views know backend response shapes.
- Add same-resource URL paths just to replace old `pageType`.
- Duplicate server state in Zustand.
- Add a second route table or manual pathname matcher for stack rendering.
