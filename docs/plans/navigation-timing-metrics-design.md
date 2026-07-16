# Navigation Timing Metrics Design

## Status

- Status: implemented
- Scope: document-level Navigation Timing collection
- Initial reporter: browser console
- Intended implementer: follow-up coding agent

## Background

Planet H5 Next currently has no observability SDK or metrics upload endpoint. The application is a
Vite/React H5 single-page application using TanStack Router with hash history and a custom
`RouteStack`.

Navigation Timing describes a browser document navigation. It is suitable for initial entry,
refresh, and document-level back/forward navigation. It does not describe route changes performed
inside the already loaded SPA. Route transition timing must be designed as a separate metric so the
two populations are not mixed.

The first implementation will collect a stable Navigation Timing event and write it to
`console.info`. Collection and reporting must be separated so an HTTP or SDK reporter can replace
the console later without changing metric calculation or application integration.

## Goals

- Collect one complete Navigation Timing event per document load.
- Use `PerformanceNavigationTiming`; do not use the deprecated `performance.timing` API.
- Define stable metric names, units, validity rules, and event schema.
- Attribute the event to a low-cardinality TanStack route template when one is available.
- Avoid exposing route parameters, query values, hashes, or full URLs.
- Keep collection independent from any future upload endpoint or monitoring vendor.
- Make installation idempotent under React Strict Mode and development hot reload behavior.
- Fail silently when browser timing APIs are unavailable or incomplete.

## Non-goals

- Uploading events to a backend.
- Reintroducing the legacy project's Sentry or monitoring wiring.
- Measuring TanStack Router SPA transitions.
- Measuring Core Web Vitals such as LCP, CLS, or INP.
- Defining alert thresholds or performance SLOs before production baselines exist.
- Collecting incomplete navigations when a document is closed before `load` completes.
- Treating BFCache restoration as a fresh document navigation.

## Terminology

- **Document navigation**: a browser navigation that creates or restores a document.
- **SPA navigation**: a route change handled inside the existing document.
- **Route template**: a low-cardinality route identifier such as
  `/ops/client/$clientId`, never a concrete route containing a client ID.
- **Reporter**: an output adapter that accepts a metric event. The initial reporter uses the
  console; a later reporter may use HTTP, `sendBeacon`, or a monitoring SDK.

## Architecture

Add the following modules:

```text
src/
  app/bootstrap/
    observability.ts
  infrastructure/observability/
    ConsoleMetricsReporter.ts
    MetricsReporter.ts
    navigationTiming.ts
    navigationTiming.test.ts
    types.ts
```

Do not create a route-template matcher or copy route definitions into observability code.
`src/app/router/routeTree.tsx` remains the only route registration table.

Responsibilities:

- `types.ts`: stable event and configuration types.
- `MetricsReporter.ts`: reporter interface only.
- `ConsoleMetricsReporter.ts`: structured `console.info` implementation.
- `navigationTiming.ts`: feature detection, entry reading, validation, metric calculation, and
  one-shot lifecycle handling.
- `observability.ts`: application composition that supplies configuration, reporter, and route
  context.

The infrastructure collector must not import React, business features, domain repositories, Axios,
or TanStack Query.

## Reporter Contract

Use a generic reporter contract so future metric families can share it:

```ts
export type MetricsEvent = NavigationTimingEvent;

export interface MetricsReporter {
  report(event: MetricsEvent): void | Promise<void>;
}
```

The collector must not wait for the reporter and must contain synchronous throws and rejected
promises from it. Observability failures must never interrupt application rendering or navigation.

The initial implementation is:

```ts
export class ConsoleMetricsReporter implements MetricsReporter {
  report(event: MetricsEvent) {
    console.info("[metrics]", event);
  }
}
```

Use one prefix argument and one structured object argument. Do not stringify the object; keeping it
structured makes local inspection and tests easier.

When an upload endpoint exists, add a separate implementation such as
`HttpMetricsReporter.ts`. Do not add an unused endpoint environment variable in the console-only
phase.

## Event Schema

All durations are milliseconds. Sizes are bytes.

```ts
export type NavigationTimingEvent = {
  eventName: "navigation_timing";
  schemaVersion: 1;
  observedAt: string;
  environment: string;
  routeTemplate?: string;
  navigationType: "navigate" | "reload" | "back_forward" | "prerender";
  nextHopProtocol?: string;
  cacheStatus: "network" | "local-cache" | "unknown";
  timings: {
    redirectMs: number;
    dnsMs: number;
    tcpMs: number;
    tlsMs?: number;
    requestToFirstByteMs: number;
    ttfbMs: number;
    responseDownloadMs: number;
    domParseMs: number;
    domContentLoadedMs: number;
    domCompleteMs: number;
    loadMs: number;
  };
  sizes: {
    transferSize: number;
    encodedBodySize: number;
    decodedBodySize: number;
  };
};
```

Field rules:

- `observedAt` is an ISO 8601 wall-clock timestamp created when the event is built.
- `environment` comes from `import.meta.env.MODE` through installer configuration. The collector
  itself must not read Vite environment variables.
- `routeTemplate` is optional. Omit it when the router has no settled leaf match.
- `nextHopProtocol` is optional because browsers may omit it for privacy or caching reasons.
- No event field may include `window.location.href`, raw `pathname`, raw hash, search parameters,
  user IDs, or business entity IDs.

Do not add browser user-agent strings, device IDs, session IDs, network IP data, or user identity to
this initial schema.

## Metric Definitions

Given a completed `PerformanceNavigationTiming` entry `entry`, calculate:

| Event field            | Calculation                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------- |
| `redirectMs`           | `entry.redirectEnd - entry.redirectStart`                                               |
| `dnsMs`                | `entry.domainLookupEnd - entry.domainLookupStart`                                       |
| `tcpMs`                | `entry.connectEnd - entry.connectStart`                                                 |
| `tlsMs`                | `entry.connectEnd - entry.secureConnectionStart`, only when `secureConnectionStart > 0` |
| `requestToFirstByteMs` | `entry.responseStart - entry.requestStart`                                              |
| `ttfbMs`               | `entry.responseStart - entry.startTime`                                                 |
| `responseDownloadMs`   | `entry.responseEnd - entry.responseStart`                                               |
| `domParseMs`           | `entry.domInteractive - entry.responseEnd`                                              |
| `domContentLoadedMs`   | `entry.domContentLoadedEventEnd - entry.startTime`                                      |
| `domCompleteMs`        | `entry.domComplete - entry.startTime`                                                   |
| `loadMs`               | `entry.loadEventEnd - entry.startTime`                                                  |

Some phases overlap by definition. In particular, `tlsMs` is a subset of `tcpMs`, and `ttfbMs`
includes all work between navigation start and the first response byte. These fields must not be
summed to derive a total.

Zero is valid for reused connections, cached responses, missing redirect phases, and operations
whose timestamps are equal. Every emitted duration must be finite and non-negative. If a required
calculation is negative or non-finite, skip the entire event instead of coercing misleading data.

Only build an event when `loadEventEnd > 0`. This prevents a partially populated entry from being
reported as a complete navigation.

## Cache Classification

Use transfer sizes only as a coarse classification:

```text
local-cache  transferSize == 0 and decodedBodySize > 0
network      transferSize > 0
unknown      all other cases
```

This is not a precise HTTP cache diagnostic. Service workers, privacy controls, and cross-origin
restrictions can affect size fields. Dashboards and future documentation must describe it as an
approximation.

## Route Attribution

The app uses hash history, so the document URL alone does not provide a safe route dimension.
Observability must obtain the current route template from TanStack Router rather than manually
matching `window.location.hash`.

The installer accepts a callback:

```ts
type NavigationTimingOptions = {
  reporter: MetricsReporter;
  environment: string;
  enabled: boolean;
  sampleRate: number;
  getRouteTemplate?: () => string | undefined;
};
```

Application composition supplies a callback that reads the current leaf match's route identifier
from the same router instance rendered by `RouterProvider`. The expected values are registered route
templates such as `/ops/client/$clientId`.

Before accepting a route template, verify that it is a non-empty string from router match metadata.
Never fall back to a raw hash or concrete pathname. If no safe value is available, omit
`routeTemplate`.

Because `AppProviders` currently owns router creation, install observability from that composition
boundary after the router is created. Keep the installation itself in
`src/app/bootstrap/observability.ts`; do not place calculation logic in the React component.

If implementation shows that TanStack Router's public match metadata does not expose a stable
template, omit the field in phase one. Do not solve that problem by duplicating route definitions.

## Lifecycle

The collector uses the following sequence:

1. Validate `enabled` and `sampleRate`.
2. Make one sampling decision for the document.
3. Install at most once for the document, even if the React effect is invoked more than once.
4. If `document.readyState === "complete"`, schedule collection in a new task.
5. Otherwise, register a one-time `window.load` listener and schedule collection in a new task from
   that listener.
6. Read `performance.getEntriesByType("navigation")` and select the first
   `PerformanceNavigationTiming` entry.
7. Require a complete and valid entry, build the event, and report it at most once.
8. Remove any listeners after reporting or teardown.

Scheduling a new task after `load` allows `loadEventEnd` to be populated. `queueMicrotask` is not
sufficiently explicit for this requirement; use `setTimeout(..., 0)` or an equivalent task.

An internal installation record should distinguish these states:

```text
not-installed -> waiting-for-load -> scheduled -> reported
                                      \-> skipped-invalid
```

Expose a cleanup function for tests and future non-React consumers. Cleanup must remove listeners
and pending timers but must not make a second report possible in the same document.

No `PerformanceObserver` is required for phase one because the completed navigation entry remains
available through the Performance Timeline.

## Sampling and Configuration

Initial configuration:

- `enabled`: controlled by `VITE_NAVIGATION_TIMING_ENABLED` and defaults to enabled when unset.
- `sampleRate`: `1` during the console-only validation phase.
- `environment`: `import.meta.env.MODE`.

Parse the enabled flag explicitly; do not rely on truthiness of environment variable strings.
Accept only `sampleRate` values from `0` through `1`. Invalid values must disable collection and
write no metric log.

Sampling occurs before listeners are installed. Use `Math.random() < sampleRate`. The random
function may be injected internally for deterministic tests, but it is not part of the public
application API unless needed.

Console output in production has no aggregation value. Before production rollout, explicitly
choose whether the console reporter remains enabled for diagnostics or the feature remains disabled
until a real reporter is available.

## Browser and Failure Behavior

Skip collection without logging errors when any of the following applies:

- The feature is disabled or not sampled.
- `window`, `document`, or `performance` is unavailable.
- `performance.getEntriesByType` is unavailable.
- There is no navigation entry.
- The entry is not complete.
- Required timing or size fields are invalid.

Reporter errors must be contained. Development diagnostics may use a separate guarded debug option,
but the metric reporter must not recursively report its own failures.

Do not add a fallback to deprecated `PerformanceTiming`. Modern supported browsers without
`PerformanceNavigationTiming` should simply produce no event.

## BFCache and Prerendering

`navigationType === "back_forward"` is retained when supplied by the navigation entry.

A `pageshow` event with `persisted === true` represents BFCache restoration and does not produce a
new Navigation Timing entry. Phase one must not emit the original entry again on `pageshow`. A future
`page_restore` event can measure BFCache restore behavior separately.

If the browser reports `navigationType === "prerender"`, retain that type. More detailed prerender
activation metrics using `activationStart` are deferred until there is a demonstrated need.

## Testing Strategy

### Unit tests

Test the pure event builder with synthetic entry-shaped objects:

- Calculates every duration using the documented boundaries.
- Preserves valid zero-duration phases.
- Includes `tlsMs` only when `secureConnectionStart > 0`.
- Classifies network, local-cache, and unknown size combinations.
- Rejects negative, `NaN`, and infinite required values.
- Rejects entries with `loadEventEnd === 0`.
- Omits optional route and protocol fields when unavailable.
- Never copies entry names or raw URLs into the event.

Test installation behavior with fake timers and mocked Performance APIs:

- Waits for `load` when the document is not complete.
- Schedules collection after `load` rather than collecting inline.
- Collects after installation when the document is already complete.
- Installs and reports only once when invoked repeatedly.
- Honors enabled state and sample rate.
- Removes listeners and timers during cleanup.
- Contains synchronous and asynchronous reporter failures.

Test `ConsoleMetricsReporter` with a `console.info` spy and restore the spy after each test so normal
test output is not polluted.

### Browser test

Add one focused Playwright test only if unit tests cannot adequately validate the browser entry. The
test may capture console messages prefixed with `[metrics]`, open a concrete hash route, and assert:

- Exactly one navigation event is written.
- `schemaVersion` and metric fields are present.
- Durations are finite and non-negative.
- The output contains no concrete client, plan, or order identifiers.

Avoid brittle assertions on exact timing values.

### Required verification

Run:

```bash
pnpm lint
pnpm format:check
pnpm test
pnpm build
```

Run `pnpm e2e` if browser-level coverage or application startup behavior changes.

## Implementation Sequence

1. Add event, reporter, and configuration types.
2. Implement and test the pure Navigation Timing event builder.
3. Implement and test one-shot lifecycle installation.
4. Implement and test `ConsoleMetricsReporter`.
5. Compose the reporter and collector in `app/bootstrap/observability.ts`.
6. Integrate with the router instance from `AppProviders`, using current match metadata for the
   optional route template.
7. Add the Vite environment type for `VITE_NAVIGATION_TIMING_ENABLED` and document its default.
8. Run the required verification commands.

## Acceptance Criteria

- A full document load produces at most one `[metrics]` console entry when enabled and sampled.
- The console event matches schema version 1 and all required duration values are finite and
  non-negative.
- React Strict Mode does not cause duplicate events.
- Unsupported or incomplete timing APIs do not affect application behavior.
- No raw URL, hash, search parameter, or concrete route parameter appears in the event.
- Route attribution, when present, comes from TanStack Router match metadata.
- No second route table or manual pathname matcher is introduced.
- SPA route changes do not emit additional Navigation Timing events.
- Replacing the console reporter later does not require changes to collection or metric calculation.

## Future Reporter Extension

Once an endpoint contract exists, add an `HttpMetricsReporter` behind the existing interface. Decide
the following before implementation:

- Endpoint and same-origin or cross-origin behavior.
- Authentication and credential policy.
- JSON content type and CORS implications.
- Batching, retry, queue limits, and deduplication identifiers.
- `sendBeacon` versus `fetch({ keepalive: true })` behavior.
- Production sample rate and environment-specific enablement.
- Data retention and privacy review.

Do not modify the Navigation Timing schema solely to accommodate a transport. If a payload envelope
is required by the backend, map the stable event into that envelope inside the HTTP reporter.

## Follow-up Metrics

After Navigation Timing is stable, design separate event families for:

- SPA route start to route committed.
- Route start to critical query data available.
- Route start to page ready for interaction.
- Core Web Vitals.

These metrics need explicit lifecycle semantics for cached `RouteStack` frames, forward/back
transitions, route modes, and TanStack Query cache hits. They must not reuse `navigation_timing` or
its duration fields.
