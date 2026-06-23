# Planet H5 Next

Planet H5 Next is a mobile H5 business frontend. The current business scope covers client, merchant, plan detail, plan setting, and order pages. The codebase uses a lightweight Clean Architecture adapted for React H5 applications.

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
/merchant
/merchant/$merchantId
```

- Route definitions — `src/app/router/routeTree.tsx`
