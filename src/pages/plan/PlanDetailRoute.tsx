import { useParams } from "@tanstack/react-router";

import { PlanDetailView } from "@/features/plan/views/PlanDetailView";

export function PlanDetailRoute() {
  const { clientId, planId } = useParams({ strict: false });
  return <PlanDetailView clientId={clientId ?? ""} planId={planId ?? ""} />;
}
