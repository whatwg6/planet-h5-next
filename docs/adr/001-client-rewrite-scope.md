# ADR-001: Client Rewrite Scope

## Status

Accepted

## Context

`planet-h5-next` already contains a partial client business rewrite, but the current implementation is closer to an architecture demo than a complete business replacement. Some UI and interactions are simplified, and some behavior diverges from the legacy client implementation. For example, customer departments are currently modeled as a flat editable list, while the legacy implementation uses a tree with manual and third-party synchronized departments.

Continuing with patch-by-patch fixes would make the target behavior harder to reason about.

## Decision

- Rewrite only the client business line in the current `planet-h5-next` project.
- Use the legacy `planet-h5/src/apps/client` implementation only as a reference for UI, behavior, and interaction parity.
- Keep routing, paths, technology choices, and architecture boundaries aligned with the current project.
- Keep the current route paths:
  - `/ops/client`
  - `/ops/client/$clientId`
  - `/ops/client/$clientId/plan/$planId`
  - `/ops/client/$clientId/plan/$planId/setting`
  - `/ops/client/$clientId/plan/$planId/order/$orderParams`
- Use `routeMode` for same-URL child pages, detail modes, and edit modes. Do not add extra paths for modes such as department edit.
- Include plan and order flows because they are part of the current client route chain, but implement them after client settings.
- Explicitly exclude hybrid integration, SSO, global interceptors, Orval integration, system pages, and dev pages from this rewrite.

## Consequences

- Existing simplified client, plan, and order implementations may be replaced.
- Pages that visibly diverge from legacy behavior, such as department settings, should be treated as rewrite candidates rather than incremental patch targets.
- The rewrite should not preserve legacy source structure. It should preserve business behavior inside the current project's architecture.
