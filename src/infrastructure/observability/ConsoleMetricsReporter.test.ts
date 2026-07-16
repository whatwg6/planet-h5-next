import { afterEach, describe, expect, it, vi } from "vitest";

import { ConsoleMetricsReporter } from "./ConsoleMetricsReporter";
import type { NavigationTimingEvent } from "./types";

describe("ConsoleMetricsReporter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes a prefix and a structured event", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const event = { eventName: "navigation_timing" } as NavigationTimingEvent;

    new ConsoleMetricsReporter().report(event);

    expect(info).toHaveBeenCalledWith("[metrics]", event);
  });
});
