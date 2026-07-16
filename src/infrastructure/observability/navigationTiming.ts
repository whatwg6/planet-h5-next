import type { NavigationTimingOptions, NavigationTimingEvent } from "./types";

type NavigationEntry = Pick<
  PerformanceNavigationTiming,
  | "connectEnd"
  | "connectStart"
  | "decodedBodySize"
  | "domComplete"
  | "domContentLoadedEventEnd"
  | "domInteractive"
  | "domainLookupEnd"
  | "domainLookupStart"
  | "encodedBodySize"
  | "entryType"
  | "loadEventEnd"
  | "nextHopProtocol"
  | "redirectEnd"
  | "redirectStart"
  | "requestStart"
  | "responseEnd"
  | "responseStart"
  | "secureConnectionStart"
  | "startTime"
  | "transferSize"
  | "type"
>;

type InstallationState =
  | "not-installed"
  | "waiting-for-load"
  | "scheduled"
  | "reported"
  | "skipped-invalid";

const navigationTypes = new Set<NavigationTimingEvent["navigationType"]>([
  "navigate",
  "reload",
  "back_forward",
  "prerender",
]);

const requiredNumberFields: (keyof NavigationEntry)[] = [
  "connectEnd",
  "connectStart",
  "decodedBodySize",
  "domComplete",
  "domContentLoadedEventEnd",
  "domInteractive",
  "domainLookupEnd",
  "domainLookupStart",
  "encodedBodySize",
  "loadEventEnd",
  "redirectEnd",
  "redirectStart",
  "requestStart",
  "responseEnd",
  "responseStart",
  "startTime",
  "transferSize",
];

function isNonNegativeFinite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function classifyCache(entry: NavigationEntry): NavigationTimingEvent["cacheStatus"] {
  if (entry.transferSize > 0) return "network";
  if (entry.transferSize === 0 && entry.decodedBodySize > 0) return "local-cache";
  return "unknown";
}

export function buildNavigationTimingEvent(
  entry: NavigationEntry,
  context: {
    environment: string;
    routeTemplate?: string;
    observedAt?: Date;
  },
): NavigationTimingEvent | undefined {
  if (
    entry.entryType !== "navigation" ||
    entry.loadEventEnd <= 0 ||
    !navigationTypes.has(entry.type) ||
    requiredNumberFields.some((field) => !isNonNegativeFinite(entry[field])) ||
    !isNonNegativeFinite(entry.secureConnectionStart)
  ) {
    return undefined;
  }

  const timings = {
    redirectMs: entry.redirectEnd - entry.redirectStart,
    dnsMs: entry.domainLookupEnd - entry.domainLookupStart,
    tcpMs: entry.connectEnd - entry.connectStart,
    requestToFirstByteMs: entry.responseStart - entry.requestStart,
    ttfbMs: entry.responseStart - entry.startTime,
    responseDownloadMs: entry.responseEnd - entry.responseStart,
    domParseMs: entry.domInteractive - entry.responseEnd,
    domContentLoadedMs: entry.domContentLoadedEventEnd - entry.startTime,
    domCompleteMs: entry.domComplete - entry.startTime,
    loadMs: entry.loadEventEnd - entry.startTime,
    ...(entry.secureConnectionStart > 0
      ? { tlsMs: entry.connectEnd - entry.secureConnectionStart }
      : {}),
  };

  if (Object.values(timings).some((value) => !isNonNegativeFinite(value))) {
    return undefined;
  }

  const routeTemplate = context.routeTemplate?.trim();
  const nextHopProtocol = entry.nextHopProtocol?.trim();

  return {
    eventName: "navigation_timing",
    schemaVersion: 1,
    observedAt: (context.observedAt ?? new Date()).toISOString(),
    environment: context.environment,
    ...(routeTemplate ? { routeTemplate } : {}),
    navigationType: entry.type,
    ...(nextHopProtocol ? { nextHopProtocol } : {}),
    cacheStatus: classifyCache(entry),
    timings,
    sizes: {
      transferSize: entry.transferSize,
      encodedBodySize: entry.encodedBodySize,
      decodedBodySize: entry.decodedBodySize,
    },
  };
}

export function createNavigationTimingInstaller(random: () => number = Math.random) {
  let state: InstallationState = "not-installed";
  let loadListener: (() => void) | undefined;
  let timer: number | undefined;

  const clearPendingWork = () => {
    if (loadListener && typeof window !== "undefined") {
      window.removeEventListener("load", loadListener);
      loadListener = undefined;
    }
    if (timer !== undefined && typeof window !== "undefined") {
      window.clearTimeout(timer);
      timer = undefined;
    }
  };

  const cleanup = () => {
    clearPendingWork();
    if (state !== "reported") state = "skipped-invalid";
  };

  return (options: NavigationTimingOptions): (() => void) => {
    if (state !== "not-installed") return cleanup;

    if (
      !options.enabled ||
      !Number.isFinite(options.sampleRate) ||
      options.sampleRate < 0 ||
      options.sampleRate > 1 ||
      random() >= options.sampleRate ||
      typeof window === "undefined" ||
      typeof document === "undefined" ||
      typeof performance === "undefined" ||
      typeof performance.getEntriesByType !== "function"
    ) {
      state = "skipped-invalid";
      return cleanup;
    }

    const collect = () => {
      timer = undefined;
      if (state !== "scheduled") return;

      let entry: PerformanceEntry | undefined;
      try {
        entry = performance.getEntriesByType("navigation")[0];
      } catch {
        state = "skipped-invalid";
        return;
      }

      let routeTemplate: string | undefined;
      try {
        routeTemplate = options.getRouteTemplate?.();
      } catch {
        // Route attribution is optional and must not prevent the metric.
      }

      const event = entry
        ? buildNavigationTimingEvent(entry as unknown as NavigationEntry, {
            environment: options.environment,
            routeTemplate,
          })
        : undefined;

      if (!event) {
        state = "skipped-invalid";
        return;
      }

      state = "reported";
      try {
        void Promise.resolve(options.reporter.report(event)).catch(() => undefined);
      } catch {
        // Metrics reporting must never affect application behavior.
      }
    };

    const scheduleCollection = () => {
      if (state !== "waiting-for-load") return;
      if (loadListener) {
        window.removeEventListener("load", loadListener);
        loadListener = undefined;
      }
      state = "scheduled";
      timer = window.setTimeout(collect, 0);
    };

    if (document.readyState === "complete") {
      state = "waiting-for-load";
      scheduleCollection();
    } else {
      state = "waiting-for-load";
      loadListener = scheduleCollection;
      window.addEventListener("load", loadListener, { once: true });
    }

    return cleanup;
  };
}

type WindowWithNavigationTimingInstaller = Window & {
  __planetH5NavigationTimingInstaller?: ReturnType<typeof createNavigationTimingInstaller>;
};

export function installNavigationTiming(options: NavigationTimingOptions): () => void {
  if (typeof window === "undefined") return () => undefined;

  const documentWindow = window as WindowWithNavigationTimingInstaller;
  documentWindow.__planetH5NavigationTimingInstaller ??= createNavigationTimingInstaller();
  return documentWindow.__planetH5NavigationTimingInstaller(options);
}
