import { createRootRoute, createRoute } from "@tanstack/react-router";

import { RouteStack } from "@/app/router/RouteStack";

import { ClientDetailRoute } from "@/pages/client/ClientDetailRoute";
import { ClientListRoute } from "@/pages/client/ClientListRoute";
import { MerchantDetailRoute } from "@/pages/merchant/MerchantDetailRoute";
import { MerchantListRoute } from "@/pages/merchant/MerchantListRoute";
import { PlanDetailRoute } from "@/pages/plan/PlanDetailRoute";
import { PlanSettingsRoute } from "@/pages/plan/PlanSettingsRoute";

const rootRoute = createRootRoute({ component: RouteStack });
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/" });
const clientListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/client",
  component: ClientListRoute,
});
const opsClientListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ops/client",
  component: ClientListRoute,
});
const clientDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/client/$clientId",
  component: ClientDetailRoute,
});
const opsClientDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ops/client/$clientId",
  component: ClientDetailRoute,
});
const planSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/client/$clientId/plans/settings",
  component: PlanSettingsRoute,
});
const planDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/client/$clientId/plans/$planId",
  component: PlanDetailRoute,
});
const opsPlanDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ops/client/$clientId/plan/$planId",
  component: PlanDetailRoute,
});
const merchantListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/merchant",
  component: MerchantListRoute,
});
const merchantDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/merchant/$merchantId",
  component: MerchantDetailRoute,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  clientListRoute,
  opsClientListRoute,
  clientDetailRoute,
  opsClientDetailRoute,
  planSettingsRoute,
  planDetailRoute,
  opsPlanDetailRoute,
  merchantListRoute,
  merchantDetailRoute,
]);
