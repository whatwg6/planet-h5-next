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
pnpm format
pnpm format:check
```

`pnpm dev` 启动 Vite H5 开发服务。`pnpm lint` 当前执行 TypeScript no-emit 检查。`pnpm format` 使用 Prettier 格式化项目文件，`pnpm format:check` 只检查格式。
GitHub Pages workflow 由 `.github/workflows/deploy-github-pages.yml` 执行，先运行 `pnpm lint`、`pnpm format:check` 和 `pnpm test`，再通过 `VITE_BASE_PATH=/planet-h5-next/` 构建适配仓库子路径的静态资源。

## Project Shape

```txt
src/
  app/              App bootstrap, providers, router and route-state helpers
  pages/            TanStack Router route entry components
  features/         Feature views, query hooks, mutation hooks, UI state, feature components
  application/      Use cases that coordinate repository calls
  domain/           Entities, repository contracts, pure business rules
  infrastructure/   HTTP clients, repositories, mock data, query keys
  shared/           Business-agnostic shared UI and utilities
    assets/          Business-agnostic icons, images, and brand assets
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

Same-URL page modes are represented with TanStack Router history state, not separate URL paths. Use `routeModeState(mode)` from `src/app/router/historyState.ts` when pushing a mode, and wrap route entry rendering with `RouteModeSwitch` from `src/app/router/RouteModeSwitch.tsx`. The normal page goes in `fallback`; additional states such as `edit`, `preview`, or future workflow states go in `modes`. Feature views should receive ordinary props and remain unaware of `location.state`.

## Development Guide

- Add or change business entities in `src/domain/<module>`.
- Add business actions in `src/application/<module>`.
- Add repository implementations in `src/infrastructure/repositories/<module>`.
- Import use case functions directly from `src/application/<module>` and repository implementations directly from `src/infrastructure/repositories/<module>` in feature hooks. No central DI container.
- Add TanStack Query keys in `src/infrastructure/query/queryKeys.ts`.
- Add feature query/mutation hooks under `src/features/<module>/queries` or `src/features/<module>/mutations`.
- Add route entry components in `src/pages/<module>`.
- For route components that read path params, accept the optional `routeParams` prop from `RouteStack` first, then fall back to `useParams({ strict: false, shouldThrow: false })`.
- Route entry components should render through `RouteModeSwitch`; put the normal page in `fallback`, add mode branches in `modes`, and do not read `location.state` from feature views.
- Put reusable H5 UI primitives in `src/shared/ui` only when they have no client, merchant, or plan business meaning.

## SVG Assets

SVG files have two supported import modes:

- Component icons: place reusable icon SVG files in `src/shared/assets/icons`, export them from `src/shared/assets/icons/index.ts`, and import them with the `?react` suffix.

  ```tsx
  export { default as ArrowLeftIcon } from "./arrow-left.svg?react";
  ```

- Static assets: place brand SVGs in `src/shared/assets/brand` and illustration/image SVGs in `src/shared/assets/images`, then import them without `?react` to get a URL for `<img src={...} />`.

Icon SVGs should keep their `viewBox` and use kebab-case filenames such as `arrow-left.svg`. The SVGR pipeline removes fixed fill/stroke attributes and injects `fill="currentColor"` for component-style icon imports.

## Architecture Docs

- Design: `docs/architecture-design.md`

`docs/architecture-design.md` defines the architecture intent and boundaries. `AGENTS.md` defines how agents and contributors should make code changes within those constraints.

For AI coding agents, also read `AGENTS.md` before editing.
