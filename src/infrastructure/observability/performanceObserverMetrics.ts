import type {
  PerformanceMetricEvent,
  PerformanceMetricName,
  PerformanceMetricRating,
  PerformanceObserverMetricsOptions,
} from "./types";

type NavigationEntry = {
  activationStart?: number;
  entryType: string;
  responseStart: number;
  startTime: number;
  type: string;
};

type LcpEntry = PerformanceEntry & { renderTime?: number; loadTime?: number };
type LayoutShiftEntry = PerformanceEntry & { value?: number; hadRecentInput?: boolean };
type InteractionEntry = PerformanceEntry & { duration: number; interactionId?: number };
type PerformanceWithInteractions = Performance & { interactionCount?: number };

const thresholds: Record<PerformanceMetricName, readonly [number, number]> = {
  FCP: [1_800, 3_000],
  LCP: [2_500, 4_000],
  CLS: [0.1, 0.25],
  INP: [200, 500],
  TTFB: [800, 1_800],
};

const navigationTypes = new Set<PerformanceMetricEvent["navigationType"]>([
  "navigate",
  "reload",
  "back_forward",
  "prerender",
]);

function isNavigationType(
  value: string,
): value is NonNullable<PerformanceMetricEvent["navigationType"]> {
  return navigationTypes.has(value as PerformanceMetricEvent["navigationType"]);
}

function isNonNegativeFinite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
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
  const navigationType = context.navigationType;
  return {
    eventName: "performance_metric",
    schemaVersion: 1,
    observedAt: (context.observedAt ?? new Date()).toISOString(),
    environment: context.environment,
    ...(routeTemplate ? { routeTemplate } : {}),
    metric,
    value,
    rating: ratePerformanceMetric(metric, value),
    ...(navigationType && navigationTypes.has(navigationType) ? { navigationType } : {}),
  };
}

export function calculateTtfb(entry: NavigationEntry): number | undefined {
  if (
    entry.entryType !== "navigation" ||
    !isNonNegativeFinite(entry.startTime) ||
    !isNonNegativeFinite(entry.responseStart) ||
    entry.responseStart <= 0
  ) {
    return undefined;
  }

  const activationStart = isNonNegativeFinite(entry.activationStart) ? entry.activationStart : 0;
  const value = entry.responseStart - (activationStart > 0 ? activationStart : entry.startTime);
  return isNonNegativeFinite(value) ? value : undefined;
}

export function getLcpValue(entry: LcpEntry): number | undefined {
  const value =
    isNonNegativeFinite(entry.renderTime) && entry.renderTime > 0
      ? entry.renderTime
      : isNonNegativeFinite(entry.loadTime) && entry.loadTime > 0
        ? entry.loadTime
        : entry.startTime;
  return isNonNegativeFinite(value) ? value : undefined;
}

export function calculateCls(entries: readonly LayoutShiftEntry[]): number {
  let maximum = 0;
  let windowValue = 0;
  let windowStart = 0;
  let previousShift = 0;
  let hasWindow = false;

  for (const entry of entries) {
    if (
      entry.hadRecentInput ||
      !isNonNegativeFinite(entry.startTime) ||
      !isNonNegativeFinite(entry.value)
    ) {
      continue;
    }
    if (
      hasWindow &&
      entry.startTime - previousShift < 1_000 &&
      entry.startTime - windowStart < 5_000
    ) {
      windowValue += entry.value;
    } else {
      windowStart = entry.startTime;
      windowValue = entry.value;
      hasWindow = true;
    }
    previousShift = entry.startTime;
    maximum = Math.max(maximum, windowValue);
  }

  return maximum;
}

export function selectInp(
  interactions: ReadonlyMap<number, number>,
  interactionCount: number,
): number | undefined {
  if (!isNonNegativeFinite(interactionCount)) return undefined;
  const durations = [...interactions.values()]
    .filter(isNonNegativeFinite)
    .sort((left, right) => right - left);
  if (durations.length === 0) return undefined;
  return durations[Math.min(Math.floor(interactionCount / 50), durations.length - 1)];
}

export function createPerformanceObserverMetricsInstaller(random: () => number = Math.random) {
  let installed = false;
  let finished = false;
  const observers = new Map<string, PerformanceObserver>();
  let frozenRouteTemplate: string | undefined;
  let navigationType: PerformanceMetricEvent["navigationType"];
  let firstHiddenTime = Number.POSITIVE_INFINITY;
  let lcpCandidate: number | undefined;
  const clsEntries: LayoutShiftEntry[] = [];
  const interactions = new Map<number, number>();
  let clsSupported = false;
  let lcpFinalized = false;
  let clsFinalized = false;
  let inpFinalized = false;
  let fcpReported = false;
  let ttfbReported = false;

  const safeDisconnect = (type: string) => {
    const observer = observers.get(type);
    if (!observer) return;
    try {
      observer.disconnect();
    } catch {
      // Browser observer failures must not affect the application.
    }
    observers.delete(type);
  };

  const removeInputListeners = () => {
    if (typeof window === "undefined") return;
    window.removeEventListener("keydown", finalizeLcp, true);
    window.removeEventListener("click", finalizeLcp, true);
  };

  const removeLifecycleListeners = () => {
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", onVisibilityChange, true);
    }
    if (typeof window !== "undefined") window.removeEventListener("pagehide", finalizeLifecycle);
    removeInputListeners();
  };

  const resolveRouteTemplate = (options: PerformanceObserverMetricsOptions) => {
    if (frozenRouteTemplate) return frozenRouteTemplate;
    try {
      const routeTemplate = options.getRouteTemplate?.()?.trim();
      if (routeTemplate) frozenRouteTemplate = routeTemplate;
    } catch {
      // Route attribution is optional.
    }
    return frozenRouteTemplate;
  };

  const safeReport = (
    options: PerformanceObserverMetricsOptions,
    metric: PerformanceMetricName,
    value: number,
  ) => {
    const event = buildPerformanceMetricEvent(metric, value, {
      environment: options.environment,
      routeTemplate: resolveRouteTemplate(options),
      navigationType,
    });
    if (!event) return;
    try {
      void Promise.resolve(options.reporter.report(event)).catch(() => undefined);
    } catch {
      // Metrics reporting must never affect application behavior.
    }
  };

  const drain = (type: string, consume: (entries: PerformanceEntry[]) => void) => {
    const observer = observers.get(type);
    if (!observer) return;
    try {
      consume(observer.takeRecords());
    } catch {
      // A failed drain only skips queued records for that metric.
    }
  };

  const consumeLcp = (entries: PerformanceEntry[]) => {
    for (const entry of entries as LcpEntry[]) {
      const value = getLcpValue(entry);
      if (value !== undefined && entry.startTime < firstHiddenTime) lcpCandidate = value;
    }
  };

  const consumeCls = (entries: PerformanceEntry[]) => {
    for (const entry of entries as LayoutShiftEntry[]) {
      if (entry.startTime < firstHiddenTime && !entry.hadRecentInput) clsEntries.push(entry);
    }
  };

  const consumeInp = (entries: PerformanceEntry[]) => {
    for (const entry of entries as InteractionEntry[]) {
      if (
        isNonNegativeFinite(entry.duration) &&
        isNonNegativeFinite(entry.interactionId) &&
        entry.interactionId > 0
      ) {
        interactions.set(
          entry.interactionId,
          Math.max(interactions.get(entry.interactionId) ?? 0, entry.duration),
        );
      }
    }
  };

  let activeOptions: PerformanceObserverMetricsOptions | undefined;

  function finalizeLcp() {
    if (finished || lcpFinalized || !activeOptions) return;
    lcpFinalized = true;
    drain("largest-contentful-paint", consumeLcp);
    safeDisconnect("largest-contentful-paint");
    removeInputListeners();
    if (lcpCandidate !== undefined) safeReport(activeOptions, "LCP", lcpCandidate);
  }

  function finalizeCls() {
    if (finished || clsFinalized || !activeOptions) return;
    clsFinalized = true;
    drain("layout-shift", consumeCls);
    safeDisconnect("layout-shift");
    if (clsSupported) safeReport(activeOptions, "CLS", calculateCls(clsEntries));
  }

  function finalizeInp() {
    if (finished || inpFinalized || !activeOptions) return;
    inpFinalized = true;
    drain("event", consumeInp);
    safeDisconnect("event");
    const count = (performance as PerformanceWithInteractions).interactionCount;
    const value = count === undefined ? undefined : selectInp(interactions, count);
    if (value !== undefined) safeReport(activeOptions, "INP", value);
  }

  function finalizeLifecycle() {
    if (finished) return;
    finalizeLcp();
    finalizeCls();
    finalizeInp();
    finished = true;
    for (const type of [...observers.keys()]) safeDisconnect(type);
    removeLifecycleListeners();
  }

  function onVisibilityChange() {
    if (document.visibilityState !== "hidden") return;
    if (firstHiddenTime === Number.POSITIVE_INFINITY) {
      try {
        firstHiddenTime = performance.now();
      } catch {
        firstHiddenTime = 0;
      }
    }
    finalizeLifecycle();
  }

  const observe = (
    type: string,
    callback: (entries: PerformanceEntry[]) => void,
    options: PerformanceObserverInit = { type, buffered: true },
  ): boolean => {
    try {
      const observer = new PerformanceObserver((list) => {
        try {
          callback(list.getEntries());
        } catch {
          // One malformed callback batch must not affect other metrics.
        }
      });
      observers.set(type, observer);
      observer.observe(options);
      return true;
    } catch {
      safeDisconnect(type);
      return false;
    }
  };

  const cleanup = () => {
    if (finished) return;
    finished = true;
    for (const type of [...observers.keys()]) safeDisconnect(type);
    removeLifecycleListeners();
  };

  return (options: PerformanceObserverMetricsOptions): (() => void) => {
    if (installed) return cleanup;
    installed = true;
    activeOptions = options;

    if (
      !options.enabled ||
      !Number.isFinite(options.sampleRate) ||
      options.sampleRate < 0 ||
      options.sampleRate > 1 ||
      random() >= options.sampleRate ||
      typeof window === "undefined" ||
      typeof document === "undefined" ||
      typeof performance === "undefined" ||
      typeof PerformanceObserver === "undefined"
    ) {
      finished = true;
      return cleanup;
    }

    firstHiddenTime = document.visibilityState === "hidden" ? 0 : Number.POSITIVE_INFINITY;
    try {
      const navigationEntry = performance.getEntriesByType("navigation")[0] as unknown as
        | NavigationEntry
        | undefined;
      if (navigationEntry && isNavigationType(navigationEntry.type)) {
        navigationType = navigationEntry.type;
      }
    } catch {
      // Navigation metadata is optional.
    }

    document.addEventListener("visibilitychange", onVisibilityChange, true);
    window.addEventListener("pagehide", finalizeLifecycle);
    const supported = new Set(PerformanceObserver.supportedEntryTypes ?? []);

    if (supported.has("paint")) {
      observe("paint", (entries) => {
        if (fcpReported) return;
        const fcp = entries.find((entry) => entry.name === "first-contentful-paint");
        if (!fcp || fcp.startTime >= firstHiddenTime) return;
        fcpReported = true;
        safeReport(options, "FCP", fcp.startTime);
        safeDisconnect("paint");
      });
    }

    if (supported.has("navigation")) {
      observe("navigation", (entries) => {
        if (ttfbReported) return;
        const entry = entries.find(
          (item) =>
            item.entryType === "navigation" &&
            isNonNegativeFinite((item as PerformanceNavigationTiming).responseStart) &&
            (item as PerformanceNavigationTiming).responseStart > 0,
        ) as unknown as NavigationEntry | undefined;
        if (!entry) return;
        if (isNavigationType(entry.type)) navigationType = entry.type;
        const value = calculateTtfb(entry);
        if (value === undefined) return;
        ttfbReported = true;
        safeReport(options, "TTFB", value);
        safeDisconnect("navigation");
      });
    }

    if (supported.has("largest-contentful-paint")) {
      if (observe("largest-contentful-paint", consumeLcp)) {
        window.addEventListener("keydown", finalizeLcp, true);
        window.addEventListener("click", finalizeLcp, true);
      }
    }

    if (supported.has("layout-shift")) {
      clsSupported = observe("layout-shift", consumeCls);
    }

    const interactionCount = (performance as PerformanceWithInteractions).interactionCount;
    if (supported.has("event") && isNonNegativeFinite(interactionCount)) {
      observe("event", consumeInp, {
        type: "event",
        buffered: true,
        durationThreshold: 40,
      } as PerformanceObserverInit);
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
