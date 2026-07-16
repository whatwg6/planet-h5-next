# Planet H5 Next

Planet H5 Next is a mobile H5 business frontend. The current business scope covers mock-backed migrated client business flows: client list, client detail and settings, plan detail, plan setting, and client order pages. The codebase uses a lightweight Clean Architecture adapted for React H5 applications.

`docs/architecture-design.md` for the full technology selection and architecture details.

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
- Playwright

## Commands

```bash
pnpm dev
pnpm build
pnpm test
pnpm test:watch
pnpm e2e
pnpm lint
pnpm format
pnpm format:check
```

- `pnpm dev` — starts the Vite H5 development server.
- `pnpm e2e` — runs Playwright end-to-end tests against a Vite dev server.
- `pnpm lint` — runs TypeScript project-reference checks with `tsc -b`.
- `pnpm format` — formats project files with Prettier.
- `pnpm format:check` — verifies formatting without writing changes.

## Performance diagnostics

Navigation timing diagnostics are enabled by default and emit one structured `[metrics]` console
entry for each completed document load. Set `VITE_NAVIGATION_TIMING_ENABLED=false` to disable them.
They do not measure in-app SPA route changes.

Document-level performance metrics are also enabled by default. The browser's native Performance
Timeline and `PerformanceObserver` APIs collect FCP, LCP, CLS, INP, and TTFB and temporarily report
each finalized metric as a structured `[metrics]` console entry. Set
`VITE_PERFORMANCE_METRICS_ENABLED=false` to disable collection, or set
`VITE_PERFORMANCE_METRICS_SAMPLE_RATE` to a value from `0` through `1` to sample whole document
metric families (the default is `1`). Invalid sample rates disable this collector.

These metrics describe the initial document lifecycle only. In-app SPA route changes do not start
new Web Vitals page loads, and console output is a diagnostic reporter rather than a production
aggregation backend.

Playwright e2e tests run against the local Google Chrome channel to avoid browser binary
downloads in restricted or slow networks. Install Google Chrome on the machine before
running `pnpm e2e`.

The GitHub Pages workflow is defined in `.github/workflows/deploy-github-pages.yml`.

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
e2e/                Playwright end-to-end tests
```

The core dependency direction is:

```txt
pages -> features -> application -> domain
infrastructure -> domain
```

## Main Routes

```txt
/ops/client
/ops/client/$clientId
/ops/client/$clientId/plan/$planId
/ops/client/$clientId/plan/$planId/setting
/ops/client/$clientId/plan/$planId/order/$orderParams
```

- Route definitions — `src/app/router/routeTree.tsx`
