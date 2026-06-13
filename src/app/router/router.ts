import { createHashHistory, createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree";

const basepath = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";
const history = createHashHistory();

export const router = createRouter({ routeTree, basepath, history });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
