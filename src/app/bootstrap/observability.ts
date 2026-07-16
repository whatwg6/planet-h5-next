import type { createAppRouter } from "@/app/router/router";
import { ConsoleMetricsReporter } from "@/infrastructure/observability/ConsoleMetricsReporter";
import { installNavigationTiming } from "@/infrastructure/observability/navigationTiming";
import { installPerformanceObserverMetrics } from "@/infrastructure/observability/performanceObserverMetrics";

type AppRouter = ReturnType<typeof createAppRouter>;

const reporter = new ConsoleMetricsReporter();
let currentRouter: AppRouter | undefined;

function getRouteTemplate(): string | undefined {
  if (currentRouter?.state.status !== "idle") return undefined;

  const leafMatch = currentRouter.state.matches.at(-1);
  if (leafMatch?.status !== "success") return undefined;

  const routeTemplate = leafMatch.fullPath.trim();
  return routeTemplate || undefined;
}

export function installObservability(router: AppRouter): void {
  currentRouter = router;
  const enabledFlag = import.meta.env.VITE_NAVIGATION_TIMING_ENABLED;
  const performanceMetricsEnabledFlag = import.meta.env.VITE_PERFORMANCE_METRICS_ENABLED;
  const configuredSampleRate = import.meta.env.VITE_PERFORMANCE_METRICS_SAMPLE_RATE;

  installNavigationTiming({
    reporter,
    environment: import.meta.env.MODE,
    enabled: enabledFlag === undefined || enabledFlag === "true",
    sampleRate: 1,
    getRouteTemplate,
  });

  installPerformanceObserverMetrics({
    reporter,
    environment: import.meta.env.MODE,
    enabled:
      performanceMetricsEnabledFlag === undefined || performanceMetricsEnabledFlag === "true",
    sampleRate: configuredSampleRate === undefined ? 1 : Number(configuredSampleRate),
    getRouteTemplate,
  });
}
