# Planet H5 Next

Planet H5 Next 是一个移动端 H5 业务前端。当前业务范围覆盖客户、商户、方案详情、方案设置与订单等页面，代码采用适合 React H5 应用的轻量 Clean Architecture。

架构意图、分层边界和变更规则以 `docs/architecture-design.md` 为准。AI coding agents 或需要按仓库约束改代码的贡献者，还应先阅读 `AGENTS.md`。

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
- vite-plugin-svgr
- Vitest
- React Testing Library
- MSW

完整技术选型和架构说明见 `docs/architecture-design.md`。

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

## Project Map

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

核心分层方向是：

```txt
pages -> features -> application -> domain
infrastructure -> domain
```

详细边界、数据流、状态管理、共享 UI 和 SVG asset 规则见 `docs/architecture-design.md`。

## Main Routes

```txt
/ops/client
/ops/client/$clientId
/ops/client/$clientId/plan/$planId
/ops/client/$clientId/plan/$planId/setting
/ops/client/$clientId/plan/$planId/order/$orderParams
/merchant
/merchant/$merchantId
```

Route metadata lives in `src/app/router/routeMeta.ts`. Route definitions live in `src/app/router/routeTree.tsx`. The canonical migrated business route shape uses `/ops/...`; local compatibility routes may exist where documented in the architecture guide.

## Architecture Docs

- `docs/architecture-design.md`: architecture intent, boundaries, patterns, and explicit decisions.
- `AGENTS.md`: operational checklist for agents and contributors making changes.
