import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric, type MetricType } from "web-vitals";

import type {
  PerformanceMetricEvent,
  PerformanceMetricName,
  PerformanceMetricRating,
  PerformanceObserverMetricsOptions,
} from "./types";

const thresholds: Record<PerformanceMetricName, readonly [number, number]> = {
  FCP: [1_800, 3_000],
  LCP: [2_500, 4_000],
  CLS: [0.1, 0.25],
  INP: [200, 500],
  TTFB: [800, 1_800],
};

type WebVitalsCollector = (callback: (metric: MetricType) => void) => void;
type WebVitalsApi = readonly WebVitalsCollector[];

const webVitalsCollectors: WebVitalsApi = [
  (callback) => onFCP(callback),
  (callback) => onLCP(callback),
  (callback) => onCLS(callback),
  (callback) => onINP(callback),
  (callback) => onTTFB(callback),
];

function isNonNegativeFinite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function normalizeNavigationType(
  navigationType: Metric["navigationType"],
): PerformanceMetricEvent["navigationType"] | undefined {
  if (navigationType === "back-forward") return "back_forward";
  if (
    navigationType === "navigate" ||
    navigationType === "reload" ||
    navigationType === "prerender"
  ) {
    return navigationType;
  }
  return undefined;
}

export function ratePerformanceMetric(
  metric: PerformanceMetricName,
  value: number,
): PerformanceMetricRating {
  const [good, poor] = thresholds[metric];
  if (value <= good) return "good";
  if (value <= poor) return "needs-improvement";
  return "poor";
}

export function buildPerformanceMetricEvent(
  metric: PerformanceMetricName,
  value: number,
  context: {
    environment: string;
    routeTemplate?: string;
    navigationType?: PerformanceMetricEvent["navigationType"];
    observedAt?: Date;
  },
): PerformanceMetricEvent | undefined {
  if (!isNonNegativeFinite(value)) return undefined;

  const routeTemplate = context.routeTemplate?.trim();
  return {
    eventName: "performance_metric",
    schemaVersion: 1,
    observedAt: (context.observedAt ?? new Date()).toISOString(),
    environment: context.environment,
    ...(routeTemplate ? { routeTemplate } : {}),
    metric,
    value,
    rating: ratePerformanceMetric(metric, value),
    ...(context.navigationType ? { navigationType: context.navigationType } : {}),
  };
}

export function createPerformanceObserverMetricsInstaller(
  random: () => number = Math.random,
  collectors: WebVitalsApi = webVitalsCollectors,
) {
  let installed = false;
  let active = false;
  let frozenRouteTemplate: string | undefined;

  const cleanup = () => {
    active = false;
  };

  return (options: PerformanceObserverMetricsOptions): (() => void) => {
    if (installed) return cleanup;
    installed = true;

    if (
      !options.enabled ||
      !Number.isFinite(options.sampleRate) ||
      options.sampleRate < 0 ||
      options.sampleRate > 1 ||
      random() >= options.sampleRate ||
      typeof window === "undefined" ||
      typeof document === "undefined"
    ) {
      return cleanup;
    }

    active = true;
    const reportedMetrics = new Set<PerformanceMetricName>();

    const resolveRouteTemplate = () => {
      if (frozenRouteTemplate) return frozenRouteTemplate;
      try {
        const routeTemplate = options.getRouteTemplate?.()?.trim();
        if (routeTemplate) frozenRouteTemplate = routeTemplate;
      } catch {
        // Route attribution is optional.
      }
      return frozenRouteTemplate;
    };

    const reportMetric = (metric: MetricType) => {
      if (!active || reportedMetrics.has(metric.name)) return;
      const event = buildPerformanceMetricEvent(metric.name, metric.value, {
        environment: options.environment,
        routeTemplate: resolveRouteTemplate(),
        navigationType: normalizeNavigationType(metric.navigationType),
      });
      if (!event) return;

      reportedMetrics.add(metric.name);
      try {
        void Promise.resolve(options.reporter.report(event)).catch(() => undefined);
      } catch {
        // Metrics reporting must never affect application behavior.
      }
    };

    for (const collect of collectors) {
      try {
        collect(reportMetric);
      } catch {
        // Unsupported metrics and observer failures are isolated by metric.
      }
    }

    return cleanup;
  };
}

type WindowWithPerformanceMetricsInstaller = Window & {
  __planetH5PerformanceObserverMetricsInstaller?: ReturnType<
    typeof createPerformanceObserverMetricsInstaller
  >;
};

export function installPerformanceObserverMetrics(
  options: PerformanceObserverMetricsOptions,
): () => void {
  if (typeof window === "undefined") return () => undefined;
  const documentWindow = window as WindowWithPerformanceMetricsInstaller;
  documentWindow.__planetH5PerformanceObserverMetricsInstaller ??=
    createPerformanceObserverMetricsInstaller();
  return documentWindow.__planetH5PerformanceObserverMetricsInstaller(options);
}
