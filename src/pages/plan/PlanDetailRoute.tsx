import { useNavigate, useParams } from "@tanstack/react-router";

import type { RouteStackPageProps } from "@/app/router/RouteStack";
import { RouteModeSwitch } from "@/app/router/RouteModeSwitch";
import { PlanDetailView } from "@/features/plan/views/PlanDetailView";

export function PlanDetailRoute({ routeParams }: RouteStackPageProps) {
  const params = useParams({ strict: false, shouldThrow: false });
  const navigate = useNavigate();
  const clientId = routeParams?.clientId ?? params?.clientId ?? "";
  const planId = routeParams?.planId ?? params?.planId ?? "";
  const openSettings = () => {
    void navigate({
      to: "/ops/client/$clientId/plan/$planId/setting",
      params: { clientId, planId },
    });
  };

  return (
    <RouteModeSwitch
      defaultPage={
        <PlanDetailView clientId={clientId} planId={planId} onOpenSettings={openSettings} />
      }
    />
  );
}
