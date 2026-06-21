import { useParams } from "@tanstack/react-router";

import type { RouteStackPageProps } from "@/app/router/RouteStack";
import { RouteModeSwitch } from "@/app/router/RouteModeSwitch";
import { PlanSettingsView } from "@/features/plan/views/PlanSettingsView";

export function PlanSettingsRoute({ routeParams }: RouteStackPageProps) {
  const params = useParams({ strict: false, shouldThrow: false });
  return <RouteModeSwitch fallback={<PlanSettingsView clientId={routeParams?.clientId ?? params?.clientId ?? ""} />} />;
}
