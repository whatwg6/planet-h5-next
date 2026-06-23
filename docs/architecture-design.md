# Planet H5 Frontend Architecture Design

## Scope

This document defines the frontend architecture intent, boundaries, and conventions for `planet-h5`, a mobile H5 business application.

The application is H5 only. It may contain operationally complex business workflows, but it is not a PC admin system.

## Technology Stack

- pnpm
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
- vite-plugin-svgr
- Vitest
- React Testing Library
- MSW
- Playwright

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
- `infrastructure` contains Axios, mock data, query keys under `infrastructure/query/`, and repository implementations.
- `features` contains React views, feature queries, mutations, stores, and business components.
- `pages` contains thin TanStack Router route entry components.
- `shared/ui` contains H5 base components without client, merchant, plan, or order business meaning.
- `shared/assets` contains business-agnostic icon, image, and brand assets.

## Directory Shape

The project is organized by architectural layer first, then by business module where useful:

```txt
src/
  app/              App bootstrap, providers, router, route-state helpers
  pages/            TanStack Router route entry components
  features/         Feature views, query hooks, mutation hooks, UI state, feature components
  application/      Use cases that coordinate repository calls
  domain/           Entities, repository contracts, pure business rules
  infrastructure/   HTTP clients, repositories, mock data, query keys
  shared/           Business-agnostic shared UI, assets, utilities
    assets/         Business-agnostic icons, images, and brand assets
  test/             Vitest/MSW test setup
e2e/                Playwright end-to-end tests
```

A typical business module can have matching folders across layers:

```txt
pages/<module>/
features/<module>/
application/<module>/
domain/<module>/
infrastructure/repositories/<module>/
```

Create module folders only when the feature needs that layer.

## Route Design

Keep route ownership explicit:

- `src/app/router/routeTree.tsx` is the only route registration table.

The route layer has three central mechanisms:

- `RouteStack`: the root route renders `src/app/router/RouteStack.tsx` instead of a plain `Outlet`. It uses TanStack Router state as its source of truth for H5 page-stack transitions, including forward, back, and replace.
- `routeMode`: same-resource page modes, such as edit, preview, or workflow states, use TanStack Router history state instead of extra paths. Push the same route with `location.state.routeMode` built by `routeModeState(mode)` from `src/app/router/historyState.ts`; do not add paths like `/client/$clientId/edit` only to express a UI mode.
- `RouteModeSwitch`: route entry components dispatch modes through `src/app/router/RouteModeSwitch.tsx`. Put the normal page in `defaultPage` and same-URL modes in `modes`.

Keep these mechanisms in the route layer. `RouteStack` must not keep a second route table or manually match pathnames. Route entries that need params should read them with `useParams({ strict: false, shouldThrow: false })`. Feature views must not read `location.state`; they receive ordinary props and callbacks.

## Feature Mapping Pattern

For a server-backed page, keep the responsibility split consistent:

```txt
pages/<module>/<Route>.tsx
  -> features/<module>/views/<View>.tsx
    -> features/<module>/queries or mutations
      -> application/<module>/<useCase>.ts
        -> domain/<module>/<Repository>.ts
          -> infrastructure/repositories/<module>/*
```

Routes stay thin. Feature views own page composition and interaction. Application use cases coordinate business operations. Repository implementations hide backend and mock response details from the rest of the app.

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

Business-level behavior should go through application use cases. Views should not reach directly into HTTP clients, mock data, or backend response shapes.

## State Management Boundaries

TanStack Router owns:

- Path params
- Search params
- History-state page modes such as `location.state.routeMode`
- Link generation
- Route-level preloading where useful

TanStack Query owns server state:

- Server-backed list and detail data
- Request loading, error, retry, cache, and invalidation
- Mutation cache coordination where useful

Zustand owns local H5 interaction state:

- Drafts and unsaved-change state
- List filters before they are committed to URL search params
- List scroll positions
- Feature-local UI modes and temporary context that should not be serialized into the URL

React Hook Form and Zod own:

- Edit, settings, filter, and other validation-bearing forms
- Validation schema and typed form values

TanStack Query handles server state; Zustand must not duplicate server cache.

## Shared UI Boundary

`shared/ui` is the project's H5 base component layer.

It may include primitives such as:

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

It must not include business-specific names or logic such as client status, merchant cards, or plan rules. Business components live under `features/*/components`.

Examples:

```txt
shared/ui/InfoRow
  Good: generic label and value row

features/client/components/ClientStatusTag
  Good: knows client status business meaning

shared/ui/ClientCard
  Not allowed: client is business-specific
```

## SVG Asset Boundary

SVG files have two import modes:

- Component icons: place reusable icon SVG files in `src/shared/assets/icons`, export them from `src/shared/assets/icons/index.ts`, and import them with the `?react` suffix.
- Static assets: place brand SVGs in `src/shared/assets/brand` and illustration/image SVGs in `src/shared/assets/images`, then import them without `?react` to get a URL.

Icon SVG files should keep their `viewBox` and use kebab-case filenames. The SVGR pipeline removes fixed fill/stroke attributes and injects `fill="currentColor"` for component-style icon imports, so callers can style icon color through CSS or Tailwind text color utilities.

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

Boundary rules:

- Shared feature capability modules may depend on `shared/ui`, `shared/utils`, and pure `domain` rules.
- They must not import `pages`.
- They must not import owning feature modules such as `features/client` or `features/plan`.
- Owning feature modules pass context into the shared component through props.
- Saving still belongs to the owning page's mutation.
- The shared business component may own form fragments, validation schema, local interaction state, and UI composition.
- The shared business component should not decide which owning business flow is saving it.

This keeps reusable business UI independent while still allowing pages to use different save flows.

## Repository and Mock Strategy

Pages and views never import Axios or mock data directly.

Repository interfaces are defined in `domain`. HTTP and mock implementations live in `infrastructure`.

Feature hooks import the repository module facade from `infrastructure/repositories/<module>` and pass it into application use case functions. No central DI container.

Each repository module should expose a stable facade from `infrastructure/repositories/<module>/index.ts`. The facade exports the selected implementation as `<module>Repository`, so feature hooks do not import `*.mock` or `*.http` files directly.

Example module export:

```ts
export { clientRepositoryMock as clientRepository } from "./clientRepository.mock";
```

For example:

```ts
import { getClientList } from "@/application/client/getClientList";
import { clientRepository } from "@/infrastructure/repositories/client";

export function useClientListQuery(params: ClientListParams) {
  return useQuery({
    queryKey: queryKeys.clients.list(params),
    queryFn: () => getClientList(clientRepository, params),
  });
}
```

To switch from mock data to real APIs, prefer changing the selected implementation in `infrastructure/repositories/<module>/index.ts` so feature hooks keep importing the same facade.

Repository implementations return domain entities directly. Backend response shapes should not leak into feature views.

## Testing Strategy

Use the narrowest useful test for the change:

- Domain rules: colocated `*.test.ts` beside the rule file.
- Use cases: `src/application/<module>/*UseCases.test.ts`.
- Repository implementations: tests under `src/infrastructure/repositories/<module>`.
- Query hooks and views: React Testing Library tests under the relevant feature folder.
- Route registration: tests under `src/app/router`.
- Route mode dispatch: tests under the relevant route file in `src/pages/<module>`.
- End-to-end route flows: Playwright tests under `e2e/`.

Prioritize tests around changed behavior, risky mapping logic, validation, mutation cache updates, and route mode dispatch.

Playwright tests run against the local Google Chrome channel and start the Vite dev
server through `playwright.config.ts`. Use them for browser-level route, navigation,
and user-flow coverage rather than replacing narrower unit or React Testing Library tests.

## Explicit Decisions

- The project is H5 only.
- The project uses `pnpm` as its package manager.
- Repository contracts are defined in `domain` and exist independently of their implementations.
- Same-resource page modes are not exposed as route URLs.
- `shared/ui` is an H5 base component layer, not a PC component library.
- Reusable business components belong in focused feature capability modules, not in `shared/ui`.
- TanStack Query handles server state; Zustand handles local interaction state and drafts.
- Playwright e2e tests use the local Google Chrome channel.
