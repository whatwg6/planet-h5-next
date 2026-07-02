import { createRootRouteWithContext, createRoute } from "@tanstack/react-router";

import { requirePermission } from "@/app/auth/requirePermission";
import { RouteStack } from "@/app/router/RouteStack";
import { RouteErrorComponent } from "@/app/router/RouteErrorComponent";
import type { AppRouterContext } from "@/app/router/routerContext";

import { ClientDetailRoute } from "@/pages/client/ClientDetailRoute";
import { ClientListRoute } from "@/pages/client/ClientListRoute";
import { ClientOrderRoute } from "@/pages/order/ClientOrderRoute";
import { PlanDetailRoute } from "@/pages/plan/PlanDetailRoute";
import { PlanSettingsRoute } from "@/pages/plan/PlanSettingsRoute";

const rootRoute = createRootRouteWithContext<AppRouterContext>()({
  component: RouteStack,
  errorComponent: RouteErrorComponent,
});
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/" });
const opsClientListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ops/client",
  component: ClientListRoute,
  beforeLoad: ({ context }) => requirePermission(context.queryClient, "client:list:view"),
});
const opsClientDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ops/client/$clientId",
  component: ClientDetailRoute,
  beforeLoad: ({ context }) => requirePermission(context.queryClient, "client:detail:view"),
});
const opsPlanDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ops/client/$clientId/plan/$planId",
  component: PlanDetailRoute,
  beforeLoad: ({ context }) => requirePermission(context.queryClient, "plan:detail:view"),
});
const opsPlanSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ops/client/$clientId/plan/$planId/setting",
  component: PlanSettingsRoute,
  beforeLoad: ({ context }) => requirePermission(context.queryClient, "plan:settings:edit"),
});
const opsClientOrderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ops/client/$clientId/plan/$planId/order/$orderParams",
  component: ClientOrderRoute,
  beforeLoad: ({ context }) => requirePermission(context.queryClient, "order:view"),
});
export const routeTree = rootRoute.addChildren([
  indexRoute,
  opsClientListRoute,
  opsClientDetailRoute,
  opsPlanDetailRoute,
  opsPlanSettingsRoute,
  opsClientOrderRoute,
]);
