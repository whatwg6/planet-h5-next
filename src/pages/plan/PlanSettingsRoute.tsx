import { useParams } from "@tanstack/react-router";

import type { RouteStackPageProps } from "@/app/router/RouteStack";
import { PlanSettingsView } from "@/features/plan/views/PlanSettingsView";

export function PlanSettingsRoute({ routeParams }: RouteStackPageProps) {
  const params = useParams({ strict: false, shouldThrow: false });
  return <PlanSettingsView clientId={routeParams?.clientId ?? params?.clientId ?? ""} />;
}
