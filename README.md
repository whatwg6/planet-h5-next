# Planet H5 Next

Planet H5 Next is a mobile H5 business frontend. The current business scope covers client, merchant, plan detail, plan setting, and order pages. The codebase uses a lightweight Clean Architecture adapted for React H5 applications.

`docs/architecture-design.md` is the source of truth for architectural intent, layer boundaries, and change rules. AI coding agents and contributors making code changes under repository constraints should also read `AGENTS.md` first.

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

See `docs/architecture-design.md` for the full technology selection and architecture details.

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

`pnpm dev` starts the Vite H5 development server. `pnpm lint` currently runs a TypeScript no-emit check. `pnpm format` formats project files with Prettier, while `pnpm format:check` only verifies formatting.
The GitHub Pages workflow is defined in `.github/workflows/deploy-github-pages.yml`. It runs `pnpm lint`, `pnpm format:check`, and `pnpm test` before building static assets with `VITE_BASE_PATH=/planet-h5-next/` so they work under the repository subpath.

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

The core dependency direction is:

```txt
pages -> features -> application -> domain
infrastructure -> domain
```

See `docs/architecture-design.md` for detailed rules around boundaries, data flow, state management, shared UI, and SVG assets.

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
