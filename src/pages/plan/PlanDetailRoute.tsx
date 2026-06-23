import { useNavigate, useParams } from "@tanstack/react-router";

import { RouteModeSwitch } from "@/app/router/RouteModeSwitch";
import { PlanDetailView } from "@/features/plan/views/PlanDetailView";

export function PlanDetailRoute() {
  const params = useParams({ strict: false, shouldThrow: false });
  const navigate = useNavigate();
  const clientId = params?.clientId ?? "";
  const planId = params?.planId ?? "";
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
