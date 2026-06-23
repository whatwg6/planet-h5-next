import { useParams } from "@tanstack/react-router";

import { RouteModeSwitch } from "@/app/router/RouteModeSwitch";
import { PlanSettingsView } from "@/features/plan/views/PlanSettingsView";

export function PlanSettingsRoute() {
  const params = useParams({ strict: false, shouldThrow: false });
  return (
    <RouteModeSwitch
      defaultPage={
        <PlanSettingsView clientId={params?.clientId ?? ""} planId={params?.planId ?? ""} />
      }
    />
  );
}
