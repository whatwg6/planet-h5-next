import { useParams } from "@tanstack/react-router";

import { PlanSettingsView } from "@/features/plan/views/PlanSettingsView";

export function PlanSettingsRoute() {
  const { clientId } = useParams({ strict: false });
  return <PlanSettingsView clientId={clientId ?? ""} />;
}
