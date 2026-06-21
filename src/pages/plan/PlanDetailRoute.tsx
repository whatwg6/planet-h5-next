import { useNavigate, useParams, useRouterState } from "@tanstack/react-router";

import type { RouteStackPageProps } from "@/app/router/RouteStack";
import { RouteModeSwitch } from "@/app/router/RouteModeSwitch";
import { PlanDetailView } from "@/features/plan/views/PlanDetailView";

export function PlanDetailRoute({ routeParams }: RouteStackPageProps) {
  const params = useParams({ strict: false, shouldThrow: false });
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const clientId = routeParams?.clientId ?? params?.clientId ?? "";
  const planId = routeParams?.planId ?? params?.planId ?? "";
  const openSettings = () => {
    const settingsPath = pathname.startsWith("/ops/client")
      ? "/ops/client/$clientId/plan/$planId/setting"
      : "/client/$clientId/plans/settings";

    void navigate({
      to: settingsPath,
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
