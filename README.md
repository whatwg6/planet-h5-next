# Planet H5 Next

Planet H5 Next 是一个移动端 H5 业务前端。当前业务范围覆盖客户、商户、方案详情与方案设置等页面，代码采用适合 React 应用的轻量 Clean Architecture。

## Tech Stack

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
- Vitest
- React Testing Library
- MSW

## Commands

```bash
pnpm dev
pnpm build
pnpm test
pnpm test:watch
pnpm lint
```

`pnpm dev` 启动 Vite H5 开发服务。`pnpm lint` 当前执行 TypeScript no-emit 检查。

## Project Shape

```txt
src/
  app/              App bootstrap, providers, router, repository/use-case composition
  pages/            TanStack Router route entry components
  features/         Feature views, query hooks, mutation hooks, UI state, feature components
  application/      Use cases that coordinate repository calls
  domain/           Entities, repository contracts, pure business rules
  infrastructure/   HTTP clients, repositories, DTO/mappers, mock data, query keys
  shared/           Business-agnostic shared UI and utilities
  test/             Vitest/MSW test setup
```

The intended dependency direction is:

```txt
pages -> features -> application -> domain
infrastructure -> domain
```

`domain` must stay framework-free. `features` may use React and TanStack Query, but should call business behavior through `application` use cases. `pages` should stay thin route entry components.

## Main Routes

```txt
/client
/client/$clientId
/client/$clientId/plans/settings
/client/$clientId/plans/$planId
/merchant
/merchant/$merchantId
```

Route metadata lives in `src/app/router/routeMeta.ts`. Route definitions live in `src/app/router/routeTree.tsx`.

H5 page switching is rendered through `src/app/router/RouteStack.tsx`. The root route owns this stack so a `PUSH` navigation keeps the previous page mounted and hidden instead of unmounting it. The stack uses TanStack Router's current match, route component, route params, and history key; do not add a second manual pathname matcher or route table for keep-alive behavior.

## Development Guide

- Add or change business entities in `src/domain/<module>`.
- Add business actions in `src/application/<module>`.
- Add repository implementations, DTOs, and mappers in `src/infrastructure/repositories/<module>`.
- Compose repositories in `src/app/bootstrap/repositories.ts`.
- Compose use cases in `src/app/bootstrap/useCases.ts`.
- Add TanStack Query keys in `src/infrastructure/query/queryKeys.ts`.
- Add feature query/mutation hooks under `src/features/<module>/queries` or `src/features/<module>/mutations`.
- Add route entry components in `src/pages/<module>`.
- For route components that read path params, accept the optional `routeParams` prop from `RouteStack` first, then fall back to `useParams({ strict: false, shouldThrow: false })`.
- Put reusable H5 UI primitives in `src/shared/ui` only when they have no client, merchant, or plan business meaning.

## Architecture Docs

- Design: `docs/superpowers/specs/2026-06-13-planet-h5-frontend-architecture-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-13-planet-h5-frontend-architecture.md`

For AI coding agents, also read `AGENTS.md` before editing.
