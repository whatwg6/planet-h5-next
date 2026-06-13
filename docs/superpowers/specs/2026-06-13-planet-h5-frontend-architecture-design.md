# Planet H5 Frontend Architecture Design

## Scope

This document defines the frontend architecture for `planet-h5`, a mobile H5 business application.

The first business scope includes:

- Client list
- Client detail
- Client detail edit mode
- Plan settings
- Plan detail
- Merchant list
- Merchant detail

The application is H5 only. It may contain operationally complex business workflows, but it is not a PC admin system.

## Technology Stack

- Vite
- React 19
- TypeScript
- TanStack Router
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Axios
- Tailwind CSS
- Vitest
- React Testing Library
- MSW

## Architecture Style

The project uses a lightweight Clean Architecture adapted for React H5.

The dependency direction is:

```txt
pages
  -> features
    -> application
      -> domain

infrastructure
  -> domain
```

Rules:

- `domain` contains business entities, repository contracts, and pure business rules.
- `application` contains use cases and coordinates business actions.
- `infrastructure` contains Axios, mock data, DTOs, mappers, and repository implementations.
- `features` contains React views, feature queries, mutations, stores, and business components.
- `pages` contains TanStack Router route entry components.
- `shared/ui` contains H5 base components without client, merchant, or plan business meaning.

## Directory Structure

```txt
src/
  app/
    router/
      routeTree.tsx
      routeMeta.ts
      router.ts
    providers/
      AppProviders.tsx
    bootstrap/
      queryClient.ts
      repositories.ts
      useCases.ts

  pages/
    client/
      ClientListRoute.tsx
      ClientDetailRoute.tsx
    plan/
      PlanSettingsRoute.tsx
      PlanDetailRoute.tsx
    merchant/
      MerchantListRoute.tsx
      MerchantDetailRoute.tsx

  features/
    client/
      views/
        ClientListView.tsx
        ClientDetailView.tsx
      components/
        ClientCard.tsx
        ClientSearchBar.tsx
        ClientStatusTag.tsx
        ClientDetailReadonly.tsx
        ClientDetailEditor.tsx
        ClientEditActionBar.tsx
      queries/
        useClientListQuery.ts
        useClientDetailQuery.ts
      mutations/
        useUpdateClientMutation.ts
      store/
        clientListStore.ts
        clientDetailUiStore.ts

    plan/
      views/
        PlanSettingsView.tsx
        PlanDetailView.tsx
      components/
        PlanBasicForm.tsx
        PlanRuleEditor.tsx
        PlanSummary.tsx
      queries/
        usePlanDetailQuery.ts
      mutations/
        useSavePlanSettingsMutation.ts
      store/
        planDraftStore.ts

    merchant/
      views/
        MerchantListView.tsx
        MerchantDetailView.tsx
      components/
        MerchantCard.tsx
        MerchantSearchBar.tsx
        MerchantStatusTag.tsx
      queries/
        useMerchantListQuery.ts
        useMerchantDetailQuery.ts
      store/
        merchantListStore.ts

    setting-rule/
      components/
        SettingRuleEditor.tsx
        SettingRulePreview.tsx
      hooks/
        useSettingRuleForm.ts
      schema/
        settingRuleSchema.ts
      types.ts

  application/
    client/
      getClientList.ts
      getClientDetail.ts
      updateClient.ts
    plan/
      getPlanDetail.ts
      savePlanSettings.ts
    merchant/
      getMerchantList.ts
      getMerchantDetail.ts

  domain/
    client/
      Client.ts
      ClientRepository.ts
      clientRules.ts
    plan/
      Plan.ts
      PlanRepository.ts
      planRules.ts
    merchant/
      Merchant.ts
      MerchantRepository.ts
      merchantRules.ts

  infrastructure/
    http/
      axiosClient.ts
      httpError.ts
    repositories/
      client/
        clientRepository.http.ts
        clientRepository.mock.ts
        clientDto.ts
        clientMapper.ts
      plan/
        planRepository.http.ts
        planRepository.mock.ts
        planDto.ts
        planMapper.ts
      merchant/
        merchantRepository.http.ts
        merchantRepository.mock.ts
        merchantDto.ts
        merchantMapper.ts
    mock/
      clientMockData.ts
      planMockData.ts
      merchantMockData.ts
    query/
      queryKeys.ts

  shared/
    ui/
      Page/
      Navigation/
      List/
      Form/
      Feedback/
      DataDisplay/
    hooks/
    utils/
```

## Route Design

The H5 route map is:

```txt
/client
  Client list

/client/$clientId
  Client detail
  Client detail edit mode is internal state and is not exposed as a URL.

/client/$clientId/plans/settings
  Plan settings

/client/$clientId/plans/$planId
  Plan detail

/merchant
  Merchant list

/merchant/$merchantId
  Merchant detail
```

There is no `/client/$clientId/edit` route.

Client editing is controlled by page state or Zustand inside the client detail page. If editing requires unsaved-change checks, back interception, shared action bars, or draft reset, it belongs in `features/client/store/clientDetailUiStore.ts`.

Each route should have route metadata:

```ts
type RouteMeta = {
  title: string;
  module: "client" | "plan" | "merchant";
  keepAlive?: boolean;
};
```

Route metadata is used for page titles, analytics, future permission hooks, and H5 navigation behavior.

## Page Mapping

```txt
Client list
  pages/client/ClientListRoute.tsx
  features/client/views/ClientListView.tsx
  application/client/getClientList.ts
  domain/client/ClientRepository.ts
  infrastructure/repositories/client/*

Client detail
  pages/client/ClientDetailRoute.tsx
  features/client/views/ClientDetailView.tsx
  application/client/getClientDetail.ts
  application/client/updateClient.ts
  domain/client/ClientRepository.ts
  infrastructure/repositories/client/*

Plan settings
  pages/plan/PlanSettingsRoute.tsx
  features/plan/views/PlanSettingsView.tsx
  application/plan/savePlanSettings.ts
  domain/plan/PlanRepository.ts
  infrastructure/repositories/plan/*

Plan detail
  pages/plan/PlanDetailRoute.tsx
  features/plan/views/PlanDetailView.tsx
  application/plan/getPlanDetail.ts
  domain/plan/PlanRepository.ts
  infrastructure/repositories/plan/*

Merchant list
  pages/merchant/MerchantListRoute.tsx
  features/merchant/views/MerchantListView.tsx
  application/merchant/getMerchantList.ts
  domain/merchant/MerchantRepository.ts
  infrastructure/repositories/merchant/*

Merchant detail
  pages/merchant/MerchantDetailRoute.tsx
  features/merchant/views/MerchantDetailView.tsx
  application/merchant/getMerchantDetail.ts
  domain/merchant/MerchantRepository.ts
  infrastructure/repositories/merchant/*
```

## Data Flow

Standard read flow:

```txt
Route
  -> View
    -> Query hook
      -> Application use case
        -> Domain repository interface
          -> Infrastructure repository implementation
            -> Axios or mock
```

Standard write flow:

```txt
View
  -> Mutation hook
    -> Application use case
      -> Domain repository interface
        -> Infrastructure repository implementation
          -> Axios or mock
    -> TanStack Query invalidation
    -> UI state update
```

Client detail edit flow:

```txt
Open /client/$clientId
  -> useClientDetailQuery(clientId)
  -> render ClientDetailReadonly

Tap edit
  -> clientDetailUiStore.enterEdit()
  -> initialize React Hook Form values from client detail
  -> render ClientDetailEditor

Tap save
  -> useUpdateClientMutation()
  -> updateClient use case
  -> ClientRepository.updateClient()
  -> invalidate client detail query
  -> clientDetailUiStore.exitEdit()

Tap cancel or H5 back while dirty
  -> show confirm dialog
  -> discard draft and exit edit, or stay editing
```

## State Management Boundaries

TanStack Router owns:

- Path params
- Search params
- Route metadata
- Link generation
- Route-level preloading where useful

TanStack Query owns:

- Client list data
- Client detail data
- Merchant list data
- Merchant detail data
- Plan detail data
- Request loading, error, retry, cache, and invalidation

Zustand owns local H5 state:

- List filters before they are committed to URL search params
- List scroll positions
- Current local UI mode
- Client detail edit mode
- Unsaved-change state
- Plan settings draft state
- Temporary context that should not be serialized into the URL

React Hook Form and Zod own:

- Plan settings forms
- Client edit forms
- Future filter forms or edit forms
- Validation schema and typed form values

## Shared UI Boundary

`shared/ui` is the project's H5 base component layer.

It may include:

- `Page`
- `NavBar`
- `Button`
- `Toast`
- `ConfirmDialog`
- `ActionSheet`
- `InfiniteList`
- `PullRefresh`
- `EmptyState`
- `ErrorState`
- `LoadingState`
- `InfoRow`
- `Field`
- `Tabs`
- `BottomActionBar`

It must not include business-specific names or logic such as client status, merchant cards, or plan rules.

Business components live under `features/*/components`.

Examples:

```txt
shared/ui/InfoRow
  Good: generic label and value row

features/client/components/ClientStatusTag
  Good: knows client status business meaning

shared/ui/ClientCard
  Not allowed: client is business-specific
```

## Cross-Page Business Components

Large reusable business components must not be placed in `shared/ui`.

If a component is reused by multiple pages but still has business meaning, it should become a small feature capability module under `features`.

Example:

```txt
features/setting-rule/
  components/
    SettingRuleEditor.tsx
    SettingRulePreview.tsx
  hooks/
    useSettingRuleForm.ts
  schema/
    settingRuleSchema.ts
  types.ts
```

This kind of module is appropriate when the same setting-rule editor is used by both client setting and plan setting.

Usage:

```txt
features/client
  -> imports features/setting-rule public components

features/plan
  -> imports features/setting-rule public components
```

Boundary rules:

- `features/setting-rule` may depend on `shared/ui`, `shared/hooks`, and pure `domain` rules.
- `features/setting-rule` must not import `pages`.
- `features/setting-rule` must not import `features/client` or `features/plan`.
- `features/client` and `features/plan` pass context into the shared component through props.
- Saving still belongs to the owning page's mutation, such as `useUpdateClientMutation` or `useSavePlanSettingsMutation`.
- The shared business component may own form fragments, validation schema, local interaction state, and UI composition.
- The shared business component should not decide whether it is saving a client or a plan.

This keeps the reusable editor independent while still allowing client and plan pages to use different save flows.

## Repository and Mock Strategy

Pages and views never import Axios or mock data directly.

Repository interfaces are defined in `domain`.

HTTP and mock implementations live in `infrastructure`.

The active implementation is selected in `app/bootstrap/repositories.ts`, for example:

```ts
export const repositories = {
  clientRepository,
  planRepository,
  merchantRepository,
};
```

This keeps the UI stable when switching from mock data to real APIs.

DTO-to-domain mapping lives in `clientMapper.ts`, `planMapper.ts`, and `merchantMapper.ts`. This prevents backend response shapes from leaking into feature views.

## Testing Strategy

Unit tests:

- Domain rules
- Application use cases
- DTO mappers

Component tests:

- Feature views
- Form validation flows
- Shared H5 UI states

Integration tests:

- Query hooks with MSW
- Mutation success and error states
- Client detail edit mode and unsaved-change behavior

The highest-risk first tests are:

- Client list query and empty/error states
- Client detail edit save/cancel flow
- Plan settings validation and save mutation
- Repository mapper behavior for malformed or missing fields

## Explicit Decisions

- The project is H5 only.
- Business names are `client`, `merchant`, and `plan`.
- Client and merchant routes are grouped by module, but there is no real permission system in the first version.
- Repository contracts are designed up front, even if the first implementation uses mock data.
- Client detail edit mode is not exposed as a route URL.
- `shared/ui` is an H5 base component layer, not a PC component library.
- Reusable business components belong in focused feature capability modules such as `features/setting-rule`, not in `shared/ui`.
- TanStack Query handles server state; Zustand does not duplicate server cache.
- Zustand handles local interaction state and drafts.
