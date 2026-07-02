import { createMemoryHistory, createRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import type { CurrentUserSession } from "@/domain/auth/Auth";
import { queryKeys } from "@/infrastructure/query/queryKeys";

import { routeTree } from "./routeTree";
import { routerBasepath } from "./router";

function createTestRouter(pathname: string, queryClient = new QueryClient()) {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [pathname] }),
    context: { queryClient },
  });
}

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
    const router = createTestRouter(pathname);

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
    const router = createTestRouter(pathname);

    await router.load();

    expect(router.state.matches.map((match) => match.fullPath)).not.toContain(pathname);
    expect(router.state.matches).toHaveLength(1);
  });

  it("blocks a registered page when the current session lacks its permission", async () => {
    const queryClient = new QueryClient();
    const session: CurrentUserSession = {
      userId: "u1",
      name: "只读用户",
      permissions: ["client:list:view"],
    };
    queryClient.setQueryData(queryKeys.auth.session, session);
    const router = createTestRouter("/ops/client/c1/plan/p1/setting", queryClient);

    await router.load();

    const error = router.state.matches.at(-1)?.error;
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).name).toBe("ForbiddenAccessError");
  });
});
