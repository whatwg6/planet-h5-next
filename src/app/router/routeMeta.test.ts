import { describe, expect, it } from "vitest";

import { routeMeta } from "./routeMeta";

describe("routeMeta", () => {
  it("defines metadata for every route in the spec", () => {
    expect(Object.keys(routeMeta).sort()).toEqual([
      "/client",
      "/client/$clientId",
      "/client/$clientId/plans/$planId",
      "/client/$clientId/plans/settings",
      "/merchant",
      "/merchant/$merchantId",
      "/ops/client",
      "/ops/client/$clientId",
      "/ops/client/$clientId/plan/$planId",
      "/ops/client/$clientId/plan/$planId/order/$orderParams",
      "/ops/client/$clientId/plan/$planId/setting",
    ]);
  });
});
