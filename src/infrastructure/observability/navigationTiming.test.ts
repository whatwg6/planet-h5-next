import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MetricsReporter } from "./MetricsReporter";
import { buildNavigationTimingEvent, createNavigationTimingInstaller } from "./navigationTiming";

function createNavigationEntry(
  overrides: Partial<PerformanceNavigationTiming> = {},
): PerformanceNavigationTiming {
  return {
    entryType: "navigation",
    type: "navigate",
    startTime: 0,
    redirectStart: 0,
    redirectEnd: 0,
    domainLookupStart: 5,
    domainLookupEnd: 10,
    connectStart: 10,
    secureConnectionStart: 15,
    connectEnd: 30,
    requestStart: 35,
    responseStart: 50,
    responseEnd: 80,
    domInteractive: 90,
    domContentLoadedEventEnd: 100,
    domComplete: 110,
    loadEventEnd: 120,
    transferSize: 1_000,
    encodedBodySize: 800,
    decodedBodySize: 2_000,
    nextHopProtocol: "h2",
    name: "https://example.test/#/ops/client/secret-client-id?token=secret",
    ...overrides,
  } as PerformanceNavigationTiming;
}

describe("buildNavigationTimingEvent", () => {
  it("calculates the documented timing boundaries and keeps output URL-free", () => {
    const event = buildNavigationTimingEvent(createNavigationEntry(), {
      environment: "test",
      routeTemplate: "/ops/client/$clientId",
      observedAt: new Date("2026-07-16T08:00:00.000Z"),
    });

    expect(event).toEqual({
      eventName: "navigation_timing",
      schemaVersion: 1,
      observedAt: "2026-07-16T08:00:00.000Z",
      environment: "test",
      routeTemplate: "/ops/client/$clientId",
      navigationType: "navigate",
      nextHopProtocol: "h2",
      cacheStatus: "network",
      timings: {
        redirectMs: 0,
        dnsMs: 5,
        tcpMs: 20,
        tlsMs: 15,
        requestToFirstByteMs: 15,
        ttfbMs: 50,
        responseDownloadMs: 30,
        domParseMs: 10,
        domContentLoadedMs: 100,
        domCompleteMs: 110,
        loadMs: 120,
      },
      sizes: {
        transferSize: 1_000,
        encodedBodySize: 800,
        decodedBodySize: 2_000,
      },
    });
    expect(JSON.stringify(event)).not.toContain("secret");
  });

  it("preserves zero phases and omits unavailable optional fields", () => {
    const event = buildNavigationTimingEvent(
      createNavigationEntry({
        secureConnectionStart: 0,
        nextHopProtocol: "",
      }),
      { environment: "test", routeTemplate: "   " },
    );

    expect(event?.timings.redirectMs).toBe(0);
    expect(event?.timings).not.toHaveProperty("tlsMs");
    expect(event).not.toHaveProperty("routeTemplate");
    expect(event).not.toHaveProperty("nextHopProtocol");
  });

  it.each([
    [1_000, 2_000, "network"],
    [0, 2_000, "local-cache"],
    [0, 0, "unknown"],
  ] as const)(
    "classifies transferSize=%s and decodedBodySize=%s as %s",
    (transferSize, decodedBodySize, expected) => {
      const event = buildNavigationTimingEvent(
        createNavigationEntry({ transferSize, decodedBodySize }),
        { environment: "test" },
      );

      expect(event?.cacheStatus).toBe(expected);
    },
  );

  it.each([
    ["incomplete", { loadEventEnd: 0 }],
    ["negative duration", { responseStart: 34 }],
    ["NaN timestamp", { domComplete: Number.NaN }],
    ["infinite size", { transferSize: Number.POSITIVE_INFINITY }],
  ])("rejects an entry with %s", (_label, overrides) => {
    expect(
      buildNavigationTimingEvent(createNavigationEntry(overrides), { environment: "test" }),
    ).toBeUndefined();
  });
});

describe("createNavigationTimingInstaller", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  function arrange(
    readyState: DocumentReadyState,
    reporter: MetricsReporter = { report: vi.fn() },
    random = () => 0,
  ) {
    vi.spyOn(document, "readyState", "get").mockReturnValue(readyState);
    vi.spyOn(performance, "getEntriesByType").mockReturnValue([createNavigationEntry()]);
    const install = createNavigationTimingInstaller(random);
    const options = {
      reporter,
      environment: "test",
      enabled: true,
      sampleRate: 1,
      getRouteTemplate: () => "/ops/client/$clientId",
    };
    return { install, options, reporter };
  }

  it("waits for load and collects in a later task", () => {
    const { install, options, reporter } = arrange("loading");
    install(options);

    window.dispatchEvent(new Event("load"));
    expect(reporter.report).not.toHaveBeenCalled();

    vi.runAllTimers();
    expect(reporter.report).toHaveBeenCalledOnce();
  });

  it("schedules collection when the document is already complete", () => {
    const { install, options, reporter } = arrange("complete");
    install(options);

    expect(reporter.report).not.toHaveBeenCalled();
    vi.runAllTimers();

    expect(reporter.report).toHaveBeenCalledOnce();
  });

  it("installs and reports at most once", () => {
    const { install, options, reporter } = arrange("complete");
    install(options);
    install(options);

    vi.runAllTimers();
    window.dispatchEvent(new Event("load"));
    vi.runAllTimers();

    expect(reporter.report).toHaveBeenCalledOnce();
  });

  it.each([
    ["disabled", false, 1, 0],
    ["not sampled", true, 0.5, 0.75],
    ["invalid low rate", true, -0.1, 0],
    ["invalid high rate", true, 1.1, 0],
  ])("does not install when %s", (_label, enabled, sampleRate, randomValue) => {
    const { install, options, reporter } = arrange("complete", undefined, () => randomValue);
    install({ ...options, enabled, sampleRate });
    vi.runAllTimers();

    expect(reporter.report).not.toHaveBeenCalled();
  });

  it("removes listeners and timers during cleanup without allowing another report", () => {
    const removeListener = vi.spyOn(window, "removeEventListener");
    const first = arrange("loading");
    const cleanup = first.install(first.options);
    cleanup();
    window.dispatchEvent(new Event("load"));
    first.install(first.options);
    vi.runAllTimers();

    expect(removeListener).toHaveBeenCalledWith("load", expect.any(Function));
    expect(first.reporter.report).not.toHaveBeenCalled();

    vi.restoreAllMocks();
    const second = arrange("complete");
    const cancelTimer = second.install(second.options);
    cancelTimer();
    vi.runAllTimers();
    expect(second.reporter.report).not.toHaveBeenCalled();
  });

  it("contains synchronous and asynchronous reporter failures", async () => {
    const synchronous = arrange("complete", {
      report: () => {
        throw new Error("sync failure");
      },
    });
    synchronous.install(synchronous.options);
    expect(() => vi.runAllTimers()).not.toThrow();

    vi.restoreAllMocks();
    const asynchronous = arrange("complete", {
      report: () => Promise.reject(new Error("async failure")),
    });
    asynchronous.install(asynchronous.options);
    vi.runAllTimers();
    await Promise.resolve();
  });
});
