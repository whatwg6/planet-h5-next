import type { createAppRouter } from "@/app/router/router";
import { ConsoleMetricsReporter } from "@/infrastructure/observability/ConsoleMetricsReporter";
import { installNavigationTiming } from "@/infrastructure/observability/navigationTiming";

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

  installNavigationTiming({
    reporter,
    environment: import.meta.env.MODE,
    enabled: enabledFlag === undefined || enabledFlag === "true",
    sampleRate: 1,
    getRouteTemplate,
  });
}
