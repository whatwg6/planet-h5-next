# Web Vitals PerformanceObserver Design

## Status

- Status: approved for implementation
- Scope: document-level FCP, LCP, CLS, INP, and TTFB collection
- Collector: native Performance Timeline and `PerformanceObserver`
- Initial reporter: browser console through the existing `MetricsReporter`
- Intended implementer: delegated coding agent

## Background

Planet H5 Next already emits one document-level `navigation_timing` event after page load. Its
collector and reporter are separated under `src/infrastructure/observability`, and application
composition supplies environment and TanStack Router context from `src/app/bootstrap/observability.ts`.

The next observability increment adds user-centric loading, visual stability, and responsiveness
metrics. This implementation must use browser performance APIs directly. It must not add the
`web-vitals` package or another monitoring SDK. Until a real ingestion endpoint exists, events are
written by the existing `ConsoleMetricsReporter`.

## Goals

- Collect FCP, LCP, CLS, INP, and TTFB for the initial document lifecycle.
- Use `PerformanceObserver` with buffered entries so installation after React starts does not lose
  earlier entries.
- Reproduce the metric lifecycle and calculations defined in this document without depending on
  `web-vitals`.
- Emit a small, stable, privacy-safe event for each supported metric.
- Reuse the existing reporter abstraction, environment, route-template attribution, and failure
  containment.
- Install at most once per document under React Strict Mode and development hot reload.
- Skip unsupported metrics independently; one missing entry type must not disable the others.

## Non-goals

- Adding an HTTP, beacon, analytics, Sentry, or OpenTelemetry reporter.
- Measuring TanStack Router SPA transitions or treating them as new page loads.
- Exact feature parity with the `web-vitals` package across every browser version.
- Reporting attribution entries, DOM elements, selectors, resource URLs, or interaction targets.
- Collecting soft-navigation metrics.
- Starting a second metric lifecycle after BFCache restoration.
- Adding performance alerts, SLOs, CI budgets, or production dashboards before a baseline exists.

## Metric Set

| Metric | Meaning                   | Unit  |      Good |      Needs improvement |     Poor |
| ------ | ------------------------- | ----- | --------: | ---------------------: | -------: |
| FCP    | First Contentful Paint    | ms    | `<= 1800` | `> 1800` and `<= 3000` | `> 3000` |
| LCP    | Largest Contentful Paint  | ms    | `<= 2500` | `> 2500` and `<= 4000` | `> 4000` |
| CLS    | Cumulative Layout Shift   | score |  `<= 0.1` |  `> 0.1` and `<= 0.25` | `> 0.25` |
| INP    | Interaction to Next Paint | ms    |  `<= 200` |   `> 200` and `<= 500` |  `> 500` |
| TTFB   | Time to First Byte        | ms    |  `<= 800` |  `> 800` and `<= 1800` | `> 1800` |

LCP, CLS, and INP are Core Web Vitals. FCP and TTFB are supporting diagnostic metrics. Thresholds
are part of event construction so console validation and a future reporter use identical ratings.

## Architecture

Extend the existing modules instead of creating a second observability stack:

```text
src/
  app/bootstrap/
    observability.ts
  infrastructure/observability/
    ConsoleMetricsReporter.ts
    MetricsReporter.ts
    navigationTiming.ts
    performanceObserverMetrics.ts
    performanceObserverMetrics.test.ts
    types.ts
```

Responsibilities:

- `types.ts` defines the new event, metric-name, rating, and installer option types, and extends the
  `MetricsEvent` union.
- `performanceObserverMetrics.ts` owns feature detection, observer lifecycle, calculations,
  finalization, sampling, validation, and event construction.
- `observability.ts` supplies the shared reporter, environment, enabled flag, sample rate, and safe
  route-template callback.
- `ConsoleMetricsReporter` remains unchanged and prints `[metrics]` plus the structured event.

The collector must not import React, TanStack Router, Axios, business modules, or Vite environment
variables. It receives all application-specific values through options.

## Event Contract

Emit one event for each finalized and supported metric:

```ts
export type PerformanceMetricName = "FCP" | "LCP" | "CLS" | "INP" | "TTFB";

export type PerformanceMetricEvent = {
  eventName: "performance_metric";
  schemaVersion: 1;
  observedAt: string;
  environment: string;
  routeTemplate?: string;
  metric: PerformanceMetricName;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  navigationType?: "navigate" | "reload" | "back_forward" | "prerender";
};

export type MetricsEvent = NavigationTimingEvent | PerformanceMetricEvent;
```

Rules:

- FCP, LCP, INP, and TTFB values are milliseconds. CLS is a unitless score.
- Values must be finite and non-negative. Invalid values are not reported.
- Preserve the browser value; do not round it in the collector.
- `observedAt` is created when the event is finalized.
- `navigationType` comes only from the document's `PerformanceNavigationTiming` entry and is
  omitted when unavailable or invalid.
- Do not include `PerformanceEntry` objects, entry names, URLs, DOM nodes, selectors, input values,
  interaction targets, user-agent strings, device IDs, or business entity IDs.
- Do not copy navigation timing's network phases or sizes into these events.
- The existing `navigation_timing.timings.ttfbMs` remains unchanged. It is a detailed navigation
  diagnostic; `performance_metric/TTFB` is the standardized summary series.

## Options and Configuration

```ts
export type PerformanceObserverMetricsOptions = {
  reporter: MetricsReporter;
  environment: string;
  enabled: boolean;
  sampleRate: number;
  getRouteTemplate?: () => string | undefined;
};
```

Application configuration:

```text
VITE_PERFORMANCE_METRICS_ENABLED=true
VITE_PERFORMANCE_METRICS_SAMPLE_RATE=1
```

- The enabled flag defaults to enabled when unset and accepts only the literal string `"true"` as
  enabled when set.
- The sample rate defaults to `1` when unset. Parse it as a number and accept only values from `0`
  through `1`; invalid values disable this collector.
- Make one sampling decision for the complete five-metric family. Do not sample metrics
  independently.
- Sampling happens before observers or lifecycle listeners are installed.
- Navigation Timing keeps its existing, independent feature flag and behavior.

Console reporting is diagnostic only. This design does not claim that console output provides
production aggregation.

## Route Attribution

Route attribution remains low-cardinality and router-owned:

- Use the registered leaf match's `fullPath`, such as `/ops/client/$clientId`.
- Never inspect or report `window.location.href`, pathname, search, or hash.
- Never reconstruct route templates or add a second route table.
- Resolve the route callback defensively. A throw or missing settled match must not suppress a
  metric.
- Freeze the first non-empty route template returned during the document metric lifecycle. Later
  SPA navigation must not change the attribution of LCP, CLS, or INP.
- A metric emitted before a safe initial template is available may omit `routeTemplate`; do not
  delay finalization indefinitely or fall back to a concrete URL.

## Shared Lifecycle

Create `createPerformanceObserverMetricsInstaller(random = Math.random)` for deterministic tests
and expose `installPerformanceObserverMetrics(options)` for application use.

The public installer must store the created installer on a namespaced `window` property, matching
the existing Navigation Timing approach. Repeated installation returns cleanup behavior without
registering observers or emitting a second event for the same metric.

Installation sequence:

1. Validate enabled state and sample rate.
2. Make one sampling decision.
3. Feature-detect `window`, `document`, `performance`, and `PerformanceObserver`.
4. Read and validate the first navigation entry for optional navigation type and TTFB.
5. Register only the observers supported by `PerformanceObserver.supportedEntryTypes`.
6. Use `{ type, buffered: true }` observation rather than the deprecated `entryTypes` form.
7. Register capture listeners needed for LCP finalization and lifecycle listeners for hidden/page
   termination.
8. Report immediate metrics when their entries arrive; retain candidates for final metrics.
9. On finalization, call each observer's `takeRecords()` before calculating its final value.
10. Disconnect observers and remove listeners during finalization or cleanup.

Every observer callback, route callback, browser API read, and reporter call must be guarded.
Synchronous reporter throws and rejected promises are contained. A failure in one metric collector
must not disable the other collectors or affect application behavior.

## FCP Calculation

Observe `paint` entries with buffering.

- Find the first entry whose `name` is `"first-contentful-paint"`.
- Use `entry.startTime` as FCP.
- Report FCP once immediately and disconnect the paint observer.
- Ignore other paint entries, including `first-paint`.
- If FCP occurred after the document was first hidden, omit it.

## TTFB Calculation

Observe `navigation` entries with buffering. Do not wait for `loadEventEnd`.

- Select the first entry with `entryType === "navigation"` and `responseStart > 0`.
- Calculate `responseStart - activationStart` when `activationStart > 0`; otherwise calculate
  `responseStart - startTime`.
- Validate the result and report TTFB once immediately.
- Disconnect the navigation observer after a successful report.
- This observer is separate from the existing completed Navigation Timing collector; neither
  installer calls the other.

Using `activationStart` avoids counting time spent in prerender before activation. It does not
change the existing navigation timing event's TTFB calculation.

## LCP Calculation and Finalization

Observe `largest-contentful-paint` entries with buffering and retain the most recent valid entry as
the current candidate.

- Candidate value is `renderTime` when positive, otherwise `loadTime`, otherwise `startTime`.
- Ignore candidates occurring after the document's first hidden timestamp.
- Finalize on the earliest of:
  - a captured `keydown` event;
  - a captured `click` event;
  - the document becoming hidden;
  - `pagehide`.
- Before finalization, drain `takeRecords()` through the same candidate logic.
- Emit the retained candidate once and disconnect the observer.
- If there is no valid candidate, emit nothing.

Do not include the LCP element, URL, resource identifier, or size in the event.

## CLS Calculation and Finalization

Observe `layout-shift` entries with buffering. Ignore entries where `hadRecentInput` is true and
entries after the first hidden timestamp.

Use layout-shift session windows:

- Consecutive included shifts belong to the same session when the gap from the previous shift is
  less than `1000ms` and the total window duration from its first shift is less than `5000ms`.
- Otherwise start a new session window.
- CLS is the maximum session-window sum, not the sum of all shifts across the page lifetime.

Finalize when the document becomes hidden or receives `pagehide`. Drain records first, then report
the maximum session score once. If the observer is supported but no eligible layout shift occurred,
report `0`; this preserves zero-CLS samples in later aggregation.

## INP Calculation and Finalization

Observe `event` entries with buffering and `{ durationThreshold: 40 }`. INP support is considered
available only when:

- `event` is in `PerformanceObserver.supportedEntryTypes`; and
- `performance.interactionCount` is exposed as a finite, non-negative number.

For each entry with a positive `interactionId`:

- Group entries by `interactionId`.
- Retain the maximum `duration` for that interaction because one interaction may produce multiple
  Event Timing entries.
- Keep interaction durations sorted from longest to shortest.

At finalization, let `interactionCount` be the browser-provided count. Select the interaction at
zero-based index `min(floor(interactionCount / 50), durations.length - 1)` in the descending list.
This selects the worst interaction for fewer than 50 interactions, the second worst for 50–99,
and so on, approximating the 98th percentile while limiting the effect of outliers.

Finalize when the document becomes hidden or receives `pagehide`, after draining queued records.
Emit nothing when no eligible interaction was observed. Do not infer interaction count solely from
observed entries: the duration threshold means short interactions may not be delivered.

This phase deliberately targets the project's Chrome-based H5 support path. Browsers without the
required Event Timing and `interactionCount` APIs still report the other supported metrics.

## Visibility, Page Termination, and BFCache

Record a first-hidden timestamp using a capture-phase `visibilitychange` listener. If the document
is already hidden during installation, use `0` so buffered paint candidates are not reported as
visible user experience.

When the document first becomes hidden, finalize LCP, CLS, and INP and remove all remaining
observers and listeners. `pagehide` is a fallback finalization signal. Finalization is idempotent.

If `pagehide.persisted === true`, the initial lifecycle is still finalized. A later
`pageshow.persisted === true` does not reinstall or emit a fresh metric set. BFCache restoration and
soft navigation measurement are future, separate designs.

Cleanup before lifecycle finalization removes observers, listeners, and pending work without
emitting retained metrics. Once cleanup or finalization occurs, reinstalling in the same document
does not start a second lifecycle.

## Unsupported and Failure Behavior

Silently skip an individual metric when:

- Its required entry type is unsupported.
- Observation throws because the browser accepts the entry type but not an option.
- No valid entry or candidate exists.
- Its calculated value is negative, `NaN`, or infinite.
- A paint or layout entry occurred after first hidden.

Silently skip the whole collector when disabled, not sampled, options are invalid, or core browser
APIs are unavailable. Do not fall back to deprecated `performance.timing`.

## Testing Strategy

### Pure calculation tests

Export narrowly scoped builders or helpers where useful and test:

- Ratings at, below, and above every threshold boundary.
- Event construction for every metric and rejection of invalid values.
- TTFB with normal and prerender activation boundaries.
- LCP preference for render time, then load time, then start time.
- CLS session windows: within-gap accumulation, one-second split, five-second split, recent-input
  exclusion, and maximum-window selection.
- INP grouping by interaction ID and selection for `<50`, `50–99`, and `100–149` interactions.
- Events never contain source entry names, URLs, DOM nodes, or concrete route identifiers.

### Installer tests

Mock `PerformanceObserver` and its `supportedEntryTypes`, and verify:

- Buffered observers are registered only for supported entry types.
- One sampling decision controls all observers.
- FCP and TTFB report once when buffered entries arrive.
- LCP finalizes on first input and does not change afterward.
- LCP, CLS, and INP drain records and finalize on hidden or `pagehide`.
- CLS reports zero when supported and no eligible shifts occur.
- Missing INP support does not suppress the other four metrics.
- First-hidden filtering works.
- Initial route template freezes across later callback values.
- Repeated installation, cleanup, and multiple lifecycle events remain idempotent.
- Sync and async reporter failures are contained.

### Reporter and application tests

- Extend `ConsoleMetricsReporter.test.ts` to accept the new union member if needed; its output shape
  remains `[metrics]`, structured object.
- Test environment parsing in application composition if parsing is extracted into a helper.
- Do not assert exact real-browser timing values in unit tests.

### Browser validation

Add one focused Playwright test if the mocked observer tests cannot adequately verify startup
integration. It may preserve console logs, load a concrete hash route, cause a small interaction,
hide or navigate away from the document, and assert only:

- At least FCP and TTFB are emitted in supported Chrome.
- Event values are finite and non-negative.
- Event names and schema versions are stable.
- No console event contains concrete client, plan, or order identifiers.

Avoid exact timing and exact final-metric-count assertions, which are browser- and page-content-
dependent.

## Documentation Changes

Update `README.md` with:

- the five collected metrics;
- their document-level scope;
- the two new environment variables;
- the fact that console is the temporary reporter;
- the explicit statement that SPA route changes are not new Web Vitals page loads.

Update `docs/architecture-design.md` only if implementation introduces a new architectural rule.
The existing `infrastructure/observability` rule already covers this collector.

## Required Verification

Run:

```bash
pnpm lint
pnpm format:check
pnpm test
pnpm build
pnpm e2e
```

If a browser-level test is not added, `pnpm e2e` is still required because application startup and
browser lifecycle integration change.

## Implementation Sequence

1. Extend metric event and option types without changing the existing navigation event.
2. Implement and unit-test rating and event-building helpers.
3. Implement and unit-test FCP and TTFB observers.
4. Implement and unit-test first-hidden tracking and LCP finalization.
5. Implement and unit-test CLS session-window calculation.
6. Implement and unit-test INP interaction grouping and percentile selection.
7. Compose the installer from `src/app/bootstrap/observability.ts` with independent configuration.
8. Update README configuration documentation.
9. Run the full required verification suite and report any environment-specific limitation.
