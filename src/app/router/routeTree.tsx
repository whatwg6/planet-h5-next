import { createRootRoute, createRoute } from "@tanstack/react-router";

import { RouteStack } from "@/app/router/RouteStack";

import { ClientDetailRoute } from "@/pages/client/ClientDetailRoute";
import { ClientListRoute } from "@/pages/client/ClientListRoute";
import { ClientOrderRoute } from "@/pages/order/ClientOrderRoute";
import { PlanDetailRoute } from "@/pages/plan/PlanDetailRoute";
import { PlanSettingsRoute } from "@/pages/plan/PlanSettingsRoute";

const rootRoute = createRootRoute({ component: RouteStack });
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/" });
const opsClientListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ops/client",
  component: ClientListRoute,
});
const opsClientDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ops/client/$clientId",
  component: ClientDetailRoute,
});
const opsPlanDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ops/client/$clientId/plan/$planId",
  component: PlanDetailRoute,
});
const opsPlanSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ops/client/$clientId/plan/$planId/setting",
  component: PlanSettingsRoute,
});
const opsClientOrderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ops/client/$clientId/plan/$planId/order/$orderParams",
  component: ClientOrderRoute,
});
export const routeTree = rootRoute.addChildren([
  indexRoute,
  opsClientListRoute,
  opsClientDetailRoute,
  opsPlanDetailRoute,
  opsPlanSettingsRoute,
  opsClientOrderRoute,
]);
