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

export type MetricsEvent = NavigationTimingEvent;

export type NavigationTimingOptions = {
  reporter: import("./MetricsReporter").MetricsReporter;
  environment: string;
  enabled: boolean;
  sampleRate: number;
  getRouteTemplate?: () => string | undefined;
};
