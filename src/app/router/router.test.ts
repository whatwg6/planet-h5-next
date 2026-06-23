import { createMemoryHistory, createRouter } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "./routeTree";
import { routerBasepath } from "./router";

describe("router", () => {
  it("keeps hash route paths independent from the Vite asset base path", () => {
    expect(routerBasepath).toBe("/");
  });

  it.each([
    ["/ops/client", "/ops/client"],
    ["/ops/client/c1", "/ops/client/$clientId"],
    ["/ops/client/c1/plan/p1", "/ops/client/$clientId/plan/$planId"],
    ["/ops/client/c1/plan/p1/setting", "/ops/client/$clientId/plan/$planId/setting"],
    [
      "/ops/client/c1/plan/p1/order/CO20260621001-t1781971200000",
      "/ops/client/$clientId/plan/$planId/order/$orderParams",
    ],
  ])("matches the migrated ops client route %s", async (pathname, expectedFullPath) => {
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: [pathname] }),
    });

    await router.load();

    expect(router.state.matches.at(-1)?.fullPath).toBe(expectedFullPath);
  });

  it.each([
    "/client",
    "/client/c1",
    "/client/c1/plan/p1",
    "/plan/p1",
    "/order/CO20260621001-t1781971200000",
  ])("does not register migrated client compatibility route %s", async (pathname) => {
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: [pathname] }),
    });

    await router.load();

    expect(router.state.matches.map((match) => match.fullPath)).not.toContain(pathname);
    expect(router.state.matches).toHaveLength(1);
  });
});
