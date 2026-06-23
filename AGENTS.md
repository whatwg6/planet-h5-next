# Agent Guide

This file is the working guide for AI coding agents in this repository.

## First Read

Before making code changes, inspect the relevant files and keep these anchors in mind:

- `README.md` for project overview and commands.
- `docs/architecture-design.md` for architecture intent. Follow its rules before changing code.

## Common Change Paths

When adding a new route:

1. Add the route component under `src/pages/<module>`.
2. Add or update the view under `src/features/<module>/views`.
3. Register the route in `src/app/router/routeTree.tsx`.
4. If the route reads path params, call `useParams({ strict: false, shouldThrow: false })` in the route component.
5. Render route entry content through `RouteModeSwitch` from `src/app/router/RouteModeSwitch.tsx`; put the normal page in `defaultPage`, and add same-URL page modes in `modes` when needed.
6. Add route tests when registration or behavior changes.

Route stack navigation is centralized in `src/app/router/RouteStack.tsx`. It stores TanStack Router's current matched route component and params by history key for page-stack transitions. Do not add a separate route list or manual pathname matcher for stack rendering; `routeTree.tsx` remains the source of route registration.

Route state based page modes are resolved by router helpers and used from `pages`, not `features`. Use `src/app/router/historyState.ts` for the `location.state.routeMode` protocol and `src/app/router/RouteModeSwitch.tsx` for every route entry's mode dispatch. Keep feature views unaware of `location.state`.

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

When adding SVG assets:

- Follow the SVG asset boundary in `docs/architecture-design.md`.
- Put reusable icon SVG files in `src/shared/assets/icons` and export them from `src/shared/assets/icons/index.ts` with the `?react` suffix.
- Put brand SVGs in `src/shared/assets/brand` and illustration/image SVGs in `src/shared/assets/images`.
- Keep icon `viewBox` values, use kebab-case filenames, and rely on the SVGR pipeline to remove fixed fill/stroke attributes and inject `fill="currentColor"`.

## Testing Expectations

Use the narrowest useful test for the change:

- Domain rules: colocated `*.test.ts` beside the rule file.
- Use cases: `src/application/<module>/*UseCases.test.ts`.
- Repository implementations: tests under `src/infrastructure/repositories/<module>`.
- Query hooks and views: React Testing Library tests under the relevant feature folder.
- Route registration: tests under `src/app/router`.
- Route mode dispatch: tests under the relevant route file in `src/pages/<module>`.
- End-to-end route flows: Playwright tests under `e2e/`.

Before handing work back, run at least:

```bash
pnpm lint
pnpm format:check
pnpm test
```

For broad or risky changes, also run:

```bash
pnpm build
```

For browser-level route, navigation, or user-flow changes, also run:

```bash
pnpm e2e
```

Playwright uses the local Google Chrome channel.

## Style And Maintenance

- Keep TypeScript strict and avoid `any` unless the boundary truly requires it.
- Prefer existing naming and folder patterns over introducing a new abstraction.
- Keep mock data deterministic.
- Keep query keys centralized in `src/infrastructure/query/queryKeys.ts`.
- Use `pnpm format` to apply Prettier formatting when needed; use `pnpm format:check` for verification.
- Do not rewrite unrelated files or reformat the repository as a side effect.
- Do not revert user changes unless explicitly asked.
- Update `README.md`, `AGENTS.md`, and `docs/architecture-design.md` when changing project structure, commands, test tooling, or architectural rules.
