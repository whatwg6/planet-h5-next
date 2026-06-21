import { createHashHistory, createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree";

export const routerBasepath = "/";
const history = createHashHistory();

export const router = createRouter({ routeTree, basepath: routerBasepath, history });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
