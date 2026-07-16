import type { MetricsEvent } from "./types";

export interface MetricsReporter {
  report(event: MetricsEvent): void | Promise<void>;
}
