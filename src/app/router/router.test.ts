import { describe, expect, it } from "vitest";

import { routerBasepath } from "./router";

describe("router", () => {
  it("keeps hash route paths independent from the Vite asset base path", () => {
    expect(routerBasepath).toBe("/");
  });
});
