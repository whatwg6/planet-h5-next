import { createHashHistory, createRouter } from "@tanstack/react-router";

import { createQueryClient } from "@/app/bootstrap/queryClient";

import { routeTree } from "./routeTree";
import type { AppRouterContext } from "./routerContext";

export const routerBasepath = "/";

export function createAppRouter(context: AppRouterContext) {
  return createRouter({
    routeTree,
    basepath: routerBasepath,
    history: createHashHistory(),
    context,
  });
}

export const router = createAppRouter({ queryClient: createQueryClient() });

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
