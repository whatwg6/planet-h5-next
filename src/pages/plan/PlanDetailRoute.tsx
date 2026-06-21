import { useParams } from "@tanstack/react-router";

import type { RouteStackPageProps } from "@/app/router/RouteStack";
import { RouteModeSwitch } from "@/app/router/RouteModeSwitch";
import { PlanDetailView } from "@/features/plan/views/PlanDetailView";

export function PlanDetailRoute({ routeParams }: RouteStackPageProps) {
  const params = useParams({ strict: false, shouldThrow: false });
  return (
    <RouteModeSwitch
      fallback={
        <PlanDetailView
          clientId={routeParams?.clientId ?? params?.clientId ?? ""}
          planId={routeParams?.planId ?? params?.planId ?? ""}
        />
      }
    />
  );
}
