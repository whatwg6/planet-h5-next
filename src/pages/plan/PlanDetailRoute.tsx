import { useParams } from "@tanstack/react-router";

import type { RouteStackPageProps } from "@/app/router/RouteStack";
import { PlanDetailView } from "@/features/plan/views/PlanDetailView";

export function PlanDetailRoute({ routeParams }: RouteStackPageProps) {
  const params = useParams({ strict: false, shouldThrow: false });
  return <PlanDetailView clientId={routeParams?.clientId ?? params?.clientId ?? ""} planId={routeParams?.planId ?? params?.planId ?? ""} />;
}
