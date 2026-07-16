import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MetricsReporter } from "./MetricsReporter";
import {
  buildPerformanceMetricEvent,
  calculateCls,
  calculateTtfb,
  createPerformanceObserverMetricsInstaller,
  getLcpValue,
  ratePerformanceMetric,
  selectInp,
} from "./performanceObserverMetrics";
import type { PerformanceMetricEvent, PerformanceMetricName } from "./types";

type TestEntry = PerformanceEntry & Record<string, unknown>;

class MockPerformanceObserver {
  static supportedEntryTypes = [
    "paint",
    "navigation",
    "largest-contentful-paint",
    "layout-shift",
    "event",
  ];

  static instances = new Map<string, MockPerformanceObserver>();
  static throwingTypes = new Set<string>();

  readonly callback: PerformanceObserverCallback;
  records: PerformanceEntry[] = [];
  disconnected = false;

  constructor(callback: PerformanceObserverCallback) {
    this.callback = callback;
  }

  observe(options: PerformanceObserverInit) {
    if (MockPerformanceObserver.throwingTypes.has(options.type ?? "")) {
      throw new Error("unsupported observer option");
    }
    MockPerformanceObserver.instances.set(options.type ?? "", this);
  }

  disconnect() {
    this.disconnected = true;
  }

  takeRecords() {
    return this.records.splice(0);
  }

  emit(...entries: PerformanceEntry[]) {
    this.callback({ getEntries: () => entries } as PerformanceObserverEntryList, this as never);
  }
}

function entry(overrides: Record<string, unknown>): TestEntry {
  return {
    entryType: "test",
    name: "private-entry-name",
    startTime: 0,
    duration: 0,
    toJSON: () => ({}),
    ...overrides,
  } as TestEntry;
}

function navigationEntry(
  overrides: Record<string, unknown> = {},
): PerformanceNavigationTiming & { activationStart: number } {
  return entry({
    entryType: "navigation",
    name: "https://example.test/secret-client-id",
    type: "navigate",
    startTime: 0,
    activationStart: 0,
    responseStart: 120,
    ...overrides,
  }) as unknown as PerformanceNavigationTiming & { activationStart: number };
}

describe("performance metric calculations", () => {
  it.each([
    ["FCP", 1_800, "good"],
    ["FCP", 1_801, "needs-improvement"],
    ["FCP", 3_001, "poor"],
    ["LCP", 2_500, "good"],
    ["LCP", 4_000, "needs-improvement"],
    ["LCP", 4_001, "poor"],
    ["CLS", 0.1, "good"],
    ["CLS", 0.25, "needs-improvement"],
    ["CLS", 0.251, "poor"],
    ["INP", 200, "good"],
    ["INP", 500, "needs-improvement"],
    ["INP", 501, "poor"],
    ["TTFB", 800, "good"],
    ["TTFB", 1_800, "needs-improvement"],
    ["TTFB", 1_801, "poor"],
  ] as const)("rates %s=%s as %s", (metric, value, rating) => {
    expect(ratePerformanceMetric(metric, value)).toBe(rating);
  });

  it("builds a small event and rejects invalid values", () => {
    const event = buildPerformanceMetricEvent("LCP", 2_123.45, {
      environment: "test",
      routeTemplate: " /ops/client/$clientId ",
      navigationType: "reload",
      observedAt: new Date("2026-07-16T08:00:00.000Z"),
    });

    expect(event).toEqual({
      eventName: "performance_metric",
      schemaVersion: 1,
      observedAt: "2026-07-16T08:00:00.000Z",
      environment: "test",
      routeTemplate: "/ops/client/$clientId",
      metric: "LCP",
      value: 2_123.45,
      rating: "good",
      navigationType: "reload",
    });
    expect(JSON.stringify(event)).not.toContain("secret");
    expect(buildPerformanceMetricEvent("FCP", Number.NaN, { environment: "test" })).toBeUndefined();
    expect(buildPerformanceMetricEvent("CLS", -1, { environment: "test" })).toBeUndefined();
  });

  it("calculates normal and prerender TTFB", () => {
    expect(calculateTtfb(navigationEntry())).toBe(120);
    expect(calculateTtfb(navigationEntry({ activationStart: 80, responseStart: 150 }))).toBe(70);
    expect(
      calculateTtfb(navigationEntry({ activationStart: 200, responseStart: 150 })),
    ).toBeUndefined();
  });

  it("prefers LCP render time, then load time, then start time", () => {
    expect(getLcpValue(entry({ startTime: 30, loadTime: 20, renderTime: 10 }))).toBe(10);
    expect(getLcpValue(entry({ startTime: 30, loadTime: 20, renderTime: 0 }))).toBe(20);
    expect(getLcpValue(entry({ startTime: 30, loadTime: 0, renderTime: 0 }))).toBe(30);
  });

  it("calculates the maximum CLS session window and excludes recent input", () => {
    const shifts = [
      entry({ startTime: 0, value: 0.1, hadRecentInput: false }),
      entry({ startTime: 999, value: 0.2, hadRecentInput: false }),
      entry({ startTime: 1_999, value: 0.9, hadRecentInput: false }),
      entry({ startTime: 2_100, value: 5, hadRecentInput: true }),
      entry({ startTime: 6_000, value: 0.4, hadRecentInput: false }),
    ];
    expect(calculateCls(shifts)).toBeCloseTo(0.9);
  });

  it.each([
    [49, 300],
    [50, 200],
    [100, 100],
  ])("selects INP for interaction count %s", (count, expected) => {
    expect(
      selectInp(
        new Map([
          [1, 300],
          [2, 200],
          [3, 100],
        ]),
        count,
      ),
    ).toBe(expected);
  });
});

describe("createPerformanceObserverMetricsInstaller", () => {
  let reported: PerformanceMetricEvent[];
  let reporter: MetricsReporter;
  let cleanups: Array<() => void>;

  beforeEach(() => {
    MockPerformanceObserver.instances.clear();
    MockPerformanceObserver.throwingTypes.clear();
    MockPerformanceObserver.supportedEntryTypes = [
      "paint",
      "navigation",
      "largest-contentful-paint",
      "layout-shift",
      "event",
    ];
    vi.stubGlobal("PerformanceObserver", MockPerformanceObserver);
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    vi.spyOn(performance, "getEntriesByType").mockReturnValue([navigationEntry()]);
    Object.defineProperty(performance, "interactionCount", {
      configurable: true,
      value: 49,
    });
    reported = [];
    cleanups = [];
    reporter = {
      report: vi.fn((event) => {
        if (event.eventName === "performance_metric") reported.push(event);
      }),
    };
  });

  afterEach(() => {
    for (const cleanup of cleanups) cleanup();
    delete (performance as Performance & { interactionCount?: number }).interactionCount;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function install(
    overrides: Partial<
      Parameters<ReturnType<typeof createPerformanceObserverMetricsInstaller>>[0]
    > = {},
    random = () => 0,
  ) {
    const installer = createPerformanceObserverMetricsInstaller(random);
    const cleanup = installer({
      reporter,
      environment: "test",
      enabled: true,
      sampleRate: 1,
      getRouteTemplate: () => "/ops/client/$clientId",
      ...overrides,
    });
    cleanups.push(cleanup);
    return { installer, cleanup };
  }

  const observer = (type: string) => {
    const value = MockPerformanceObserver.instances.get(type);
    expect(value, `missing ${type} observer`).toBeDefined();
    return value!;
  };

  it("registers buffered observers and reports FCP and TTFB once", () => {
    install();
    observer("paint").emit(
      entry({ entryType: "paint", name: "first-paint", startTime: 10 }),
      entry({ entryType: "paint", name: "first-contentful-paint", startTime: 50 }),
    );
    observer("navigation").emit(navigationEntry());
    observer("paint").emit(entry({ name: "first-contentful-paint", startTime: 90 }));

    expect(reported.map(({ metric, value }) => [metric, value])).toEqual([
      ["FCP", 50],
      ["TTFB", 120],
    ]);
    expect(observer("paint").disconnected).toBe(true);
    expect(observer("navigation").disconnected).toBe(true);
  });

  it("finalizes the latest LCP once on first input", () => {
    install();
    observer("largest-contentful-paint").emit(
      entry({ startTime: 100, renderTime: 110 }),
      entry({ startTime: 200, renderTime: 220 }),
    );
    window.dispatchEvent(new MouseEvent("click"));
    window.dispatchEvent(new KeyboardEvent("keydown"));

    expect(reported.filter(({ metric }) => metric === "LCP").map(({ value }) => value)).toEqual([
      220,
    ]);
  });

  it("drains and finalizes LCP, CLS, and INP on pagehide", () => {
    install();
    observer("largest-contentful-paint").records.push(entry({ startTime: 100, renderTime: 130 }));
    observer("layout-shift").records.push(
      entry({ startTime: 100, value: 0.1, hadRecentInput: false }),
      entry({ startTime: 500, value: 0.2, hadRecentInput: false }),
    );
    observer("event").records.push(
      entry({ duration: 80, interactionId: 1 }),
      entry({ duration: 120, interactionId: 1 }),
      entry({ duration: 90, interactionId: 2 }),
    );
    window.dispatchEvent(new PageTransitionEvent("pagehide"));

    expect(Object.fromEntries(reported.map(({ metric, value }) => [metric, value]))).toEqual({
      LCP: 130,
      CLS: 0.30000000000000004,
      INP: 120,
    });
  });

  it("reports zero CLS and independently skips unsupported INP", () => {
    MockPerformanceObserver.supportedEntryTypes = ["paint", "layout-shift"];
    delete (performance as Performance & { interactionCount?: number }).interactionCount;
    install();
    window.dispatchEvent(new PageTransitionEvent("pagehide"));

    expect(reported.filter(({ metric }) => metric === "CLS")).toEqual([
      expect.objectContaining({ value: 0 }),
    ]);
    expect(MockPerformanceObserver.instances.has("event")).toBe(false);
  });

  it("skips a metric whose observation throws without disabling other metrics", () => {
    MockPerformanceObserver.throwingTypes.add("layout-shift");
    install();
    observer("paint").emit(entry({ name: "first-contentful-paint", startTime: 50 }));
    window.dispatchEvent(new PageTransitionEvent("pagehide"));

    expect(reported.some(({ metric }) => metric === "FCP")).toBe(true);
    expect(reported.some(({ metric }) => metric === "CLS")).toBe(false);
  });

  it("filters entries at or after the first hidden time", () => {
    vi.spyOn(performance, "now").mockReturnValue(100);
    const visibility = vi.spyOn(document, "visibilityState", "get");
    install();
    observer("largest-contentful-paint").records.push(entry({ startTime: 100, renderTime: 110 }));
    visibility.mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));

    expect(reported.some(({ metric }) => metric === "LCP")).toBe(false);
  });

  it("freezes the first non-empty route template", () => {
    let routeTemplate: string | undefined;
    install({ getRouteTemplate: () => routeTemplate });
    observer("paint").emit(entry({ name: "first-contentful-paint", startTime: 50 }));
    routeTemplate = "/ops/client/$clientId";
    observer("navigation").emit(navigationEntry());
    routeTemplate = "/ops/client/$clientId/plan/$planId";
    observer("largest-contentful-paint").emit(entry({ startTime: 100, renderTime: 110 }));
    window.dispatchEvent(new MouseEvent("click"));

    expect(reported[0]).not.toHaveProperty("routeTemplate");
    expect(reported.slice(1).map(({ routeTemplate: route }) => route)).toEqual([
      "/ops/client/$clientId",
      "/ops/client/$clientId",
    ]);
  });

  it.each([
    ["disabled", false, 1, 0],
    ["not sampled", true, 0.5, 0.75],
    ["invalid rate", true, Number.NaN, 0],
  ])("installs no observers when %s", (_label, enabled, sampleRate, randomValue) => {
    install({ enabled, sampleRate }, () => randomValue);
    expect(MockPerformanceObserver.instances.size).toBe(0);
  });

  it("is idempotent across repeated installation, cleanup, and lifecycle events", () => {
    const { installer, cleanup } = install();
    const instanceCount = MockPerformanceObserver.instances.size;
    installer({ reporter, environment: "test", enabled: true, sampleRate: 1 });
    cleanup();
    window.dispatchEvent(new PageTransitionEvent("pagehide"));

    expect(MockPerformanceObserver.instances.size).toBe(instanceCount);
    expect(reported).toEqual([]);
    expect(
      [...MockPerformanceObserver.instances.values()].every(({ disconnected }) => disconnected),
    ).toBe(true);
  });

  it("contains synchronous and asynchronous reporter failures", async () => {
    reporter = {
      report: vi
        .fn()
        .mockImplementationOnce(() => {
          throw new Error("sync failure");
        })
        .mockRejectedValueOnce(new Error("async failure")),
    };
    install();
    expect(() =>
      observer("paint").emit(entry({ name: "first-contentful-paint", startTime: 50 })),
    ).not.toThrow();
    observer("navigation").emit(navigationEntry());
    await Promise.resolve();
  });

  it("uses one sampling decision for the complete family", () => {
    const random = vi.fn(() => 0);
    install({}, random);
    expect(random).toHaveBeenCalledOnce();
  });

  it("emits only the stable privacy-safe event fields", () => {
    install();
    observer("paint").emit(entry({ name: "first-contentful-paint", startTime: 50 }));
    const keys = Object.keys(reported[0]).sort();
    expect(keys).toEqual(
      [
        "environment",
        "eventName",
        "metric",
        "navigationType",
        "observedAt",
        "rating",
        "routeTemplate",
        "schemaVersion",
        "value",
      ].sort(),
    );
    expect(JSON.stringify(reported[0])).not.toContain("secret-client-id");
  });
});
