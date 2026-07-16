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

export type PerformanceMetricName = "FCP" | "LCP" | "CLS" | "INP" | "TTFB";

export type PerformanceMetricRating = "good" | "needs-improvement" | "poor";

export type PerformanceMetricEvent = {
  eventName: "performance_metric";
  schemaVersion: 1;
  observedAt: string;
  environment: string;
  routeTemplate?: string;
  metric: PerformanceMetricName;
  value: number;
  rating: PerformanceMetricRating;
  navigationType?: "navigate" | "reload" | "back_forward" | "prerender";
};

export type MetricsEvent = NavigationTimingEvent | PerformanceMetricEvent;

export type NavigationTimingOptions = {
  reporter: import("./MetricsReporter").MetricsReporter;
  environment: string;
  enabled: boolean;
  sampleRate: number;
  getRouteTemplate?: () => string | undefined;
};

export type PerformanceObserverMetricsOptions = {
  reporter: import("./MetricsReporter").MetricsReporter;
  environment: string;
  enabled: boolean;
  sampleRate: number;
  getRouteTemplate?: () => string | undefined;
};
