# Agent Guide

This file is the working guide for AI coding agents in this repository.

## First Read

Before making code changes, inspect the relevant files and keep these anchors in mind:

- `README.md` for project overview and commands.
- `docs/superpowers/specs/2026-06-13-planet-h5-frontend-architecture-design.md` for architecture intent.
- `src/app/router/routeTree.tsx` and `src/app/router/routeMeta.ts` for route structure.
- `src/app/bootstrap/queryClient.ts` for TanStack Query client configuration.
- `src/infrastructure/query/queryKeys.ts` for TanStack Query key conventions.

## Architecture Rules

Follow this dependency direction:

```txt
pages -> features -> application -> domain
infrastructure -> domain
```

- `domain` contains entities, repository contracts, and pure business rules. Do not import React, TanStack Query, Axios, or browser APIs here.
- `application` contains use cases. Use cases receive repository contracts and coordinate business operations.
- `infrastructure` implements repositories, HTTP, mock data, and query keys.
- `features` owns React views, hooks, local UI state, and business-facing components for one module.
- `pages` are thin TanStack Router entry components.
- `shared/ui` is for H5 UI primitives without client, merchant, or plan business meaning.

Do not bypass use cases from feature code when the behavior is business-level. Do not place HTTP details in views.

## Common Change Paths

When adding a new route:

1. Add route metadata in `src/app/router/routeMeta.ts`.
2. Add the route component under `src/pages/<module>`.
3. Add or update the view under `src/features/<module>/views`.
4. Register the route in `src/app/router/routeTree.tsx`.
5. If the route reads path params, let the route component accept optional `routeParams` from `src/app/router/RouteStack.tsx` and fall back to `useParams({ strict: false, shouldThrow: false })`.
6. Add route tests when metadata or behavior changes.

Route keep-alive is centralized in `src/app/router/RouteStack.tsx`. It stores TanStack Router's current matched route component and params by history key, then hides inactive stack entries instead of unmounting them. Do not add a separate route list or manual pathname matcher for stack rendering; `routeTree.tsx` remains the source of route registration.

When adding a new server-backed query:

1. Add or extend the domain repository contract in `src/domain/<module>`.
2. Add a use case in `src/application/<module>`.
3. Add the repository implementation in `src/infrastructure/repositories/<module>`.
4. Add a stable key in `src/infrastructure/query/queryKeys.ts`.
5. Add a feature hook in `src/features/<module>/queries` that imports the use case and repository directly.

When adding a mutation:

1. Model business input in `domain` or `application`, depending on whether it is a domain concept or use-case command.
2. Add repository contract and implementation changes.
3. Add the use case.
4. Add a feature mutation hook under `src/features/<module>/mutations`.
5. Invalidate or update query cache using keys from `src/infrastructure/query/queryKeys.ts`.

When adding UI:

- Prefer existing `src/shared/ui` primitives.
- Keep H5 mobile layout constraints in mind.
- Keep route components thin; put page composition in feature views.
- Avoid adding shared components until at least two feature areas need the same business-agnostic primitive.

## Testing Expectations

Use the narrowest useful test for the change:

- Domain rules: colocated `*.test.ts` beside the rule file.
- Use cases: `src/application/<module>/*UseCases.test.ts`.
- Repository implementations: tests under `src/infrastructure/repositories/<module>`.
- Query hooks and views: React Testing Library tests under the relevant feature folder.
- Route metadata: `src/app/router/routeMeta.test.ts`.

Before handing work back, run at least:

```bash
pnpm lint
pnpm test
```

For broad or risky changes, also run:

```bash
pnpm build
```

## Style And Maintenance

- Keep TypeScript strict and avoid `any` unless the boundary truly requires it.
- Prefer existing naming and folder patterns over introducing a new abstraction.
- Keep mock data deterministic.
- Keep query keys centralized in `src/infrastructure/query/queryKeys.ts`.
- Do not rewrite unrelated files or reformat the repository as a side effect.
- Do not revert user changes unless explicitly asked.
- Update `README.md` or this file when changing project structure, commands, or architectural rules.
