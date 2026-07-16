import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MetricType } from "web-vitals";

import type { MetricsReporter } from "./MetricsReporter";
import {
  buildPerformanceMetricEvent,
  createPerformanceObserverMetricsInstaller,
  ratePerformanceMetric,
} from "./performanceObserverMetrics";
import type { PerformanceMetricEvent } from "./types";

type MetricCallback = (metric: MetricType) => void;

function webVital(
  name: MetricType["name"],
  value: number,
  navigationType: MetricType["navigationType"] = "navigate",
): MetricType {
  return {
    name,
    value,
    navigationType,
    rating: "good",
    delta: value,
    id: `v1-${name}`,
    entries: [],
  } as MetricType;
}

describe("performance metric events", () => {
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

  it("builds a privacy-safe event and rejects invalid values", () => {
    expect(
      buildPerformanceMetricEvent("LCP", 2_123.45, {
        environment: "test",
        routeTemplate: " /ops/client/$clientId ",
        navigationType: "reload",
        observedAt: new Date("2026-07-16T08:00:00.000Z"),
      }),
    ).toEqual({
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
    expect(buildPerformanceMetricEvent("FCP", Number.NaN, { environment: "test" })).toBeUndefined();
    expect(buildPerformanceMetricEvent("CLS", -1, { environment: "test" })).toBeUndefined();
  });
});

describe("createPerformanceObserverMetricsInstaller", () => {
  let callbacks: MetricCallback[];
  let reported: PerformanceMetricEvent[];
  let reporter: MetricsReporter;

  beforeEach(() => {
    callbacks = [];
    reported = [];
    reporter = {
      report: vi.fn((event) => {
        if (event.eventName === "performance_metric") reported.push(event);
      }),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function install(
    overrides: Partial<
      Parameters<ReturnType<typeof createPerformanceObserverMetricsInstaller>>[0]
    > = {},
    random = () => 0,
    throwingCollector = false,
  ) {
    const collectors = Array.from({ length: 5 }, (_, index) => (callback: MetricCallback) => {
      if (throwingCollector && index === 1) throw new Error("unsupported metric");
      callbacks.push(callback);
    });
    const installer = createPerformanceObserverMetricsInstaller(random, collectors);
    const cleanup = installer({
      reporter,
      environment: "test",
      enabled: true,
      sampleRate: 1,
      getRouteTemplate: () => "/ops/client/$clientId",
      ...overrides,
    });
    return { installer, cleanup };
  }

  it("registers all web-vitals collectors and reports each metric once", () => {
    install();
    const metrics = [
      webVital("FCP", 50),
      webVital("LCP", 2_200),
      webVital("CLS", 0.12),
      webVital("INP", 180),
      webVital("TTFB", 120),
    ];
    callbacks.forEach((callback, index) => callback(metrics[index]));
    callbacks[1](webVital("LCP", 2_400));

    expect(reported.map(({ metric, value }) => [metric, value])).toEqual([
      ["FCP", 50],
      ["LCP", 2_200],
      ["CLS", 0.12],
      ["INP", 180],
      ["TTFB", 120],
    ]);
  });

  it("normalizes navigation types supported by the existing event schema", () => {
    install();
    callbacks[0](webVital("FCP", 50, "back-forward"));
    callbacks[1](webVital("LCP", 100, "back-forward-cache"));

    expect(reported[0].navigationType).toBe("back_forward");
    expect(reported[1]).not.toHaveProperty("navigationType");
  });

  it("freezes the first non-empty route template", () => {
    let routeTemplate: string | undefined;
    install({ getRouteTemplate: () => routeTemplate });
    callbacks[0](webVital("FCP", 50));
    routeTemplate = "/ops/client/$clientId";
    callbacks[1](webVital("LCP", 100));
    routeTemplate = "/ops/client/$clientId/plan/$planId";
    callbacks[2](webVital("CLS", 0.1));

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
  ])("registers no collectors when %s", (_label, enabled, sampleRate, randomValue) => {
    install({ enabled, sampleRate }, () => randomValue);
    expect(callbacks).toHaveLength(0);
  });

  it("isolates collector and reporter failures", async () => {
    reporter = {
      report: vi
        .fn()
        .mockImplementationOnce(() => {
          throw new Error("sync failure");
        })
        .mockRejectedValueOnce(new Error("async failure")),
    };
    expect(() => install({}, () => 0, true)).not.toThrow();
    expect(callbacks).toHaveLength(4);
    expect(() => callbacks[0](webVital("FCP", 50))).not.toThrow();
    callbacks[1](webVital("LCP", 100));
    await Promise.resolve();
  });

  it("uses one sampling decision and stops reporting after cleanup", () => {
    const random = vi.fn(() => 0);
    const { cleanup } = install({}, random);
    cleanup();
    callbacks[0](webVital("FCP", 50));

    expect(random).toHaveBeenCalledOnce();
    expect(reported).toEqual([]);
  });

  it("is idempotent across repeated installation", () => {
    const { installer } = install();
    installer({ reporter, environment: "test", enabled: true, sampleRate: 1 });
    expect(callbacks).toHaveLength(5);
  });

  it("emits only the stable event fields", () => {
    install();
    callbacks[0](webVital("FCP", 50));
    expect(Object.keys(reported[0]).sort()).toEqual(
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
  });
});
