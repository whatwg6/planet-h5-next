import type { MetricsReporter } from "./MetricsReporter";
import type { MetricsEvent } from "./types";

export class ConsoleMetricsReporter implements MetricsReporter {
  report(event: MetricsEvent) {
    console.info("[metrics]", event);
  }
}
