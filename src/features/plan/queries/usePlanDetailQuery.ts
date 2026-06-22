import { useQuery } from "@tanstack/react-query";

import { getPlanDetail } from "@/application/plan/getPlanDetail";
import { planRepository } from "@/infrastructure/repositories/plan";
import { queryKeys } from "@/infrastructure/query/queryKeys";

export function usePlanDetailQuery(clientId: string, planId: string) {
  return useQuery({
    queryKey: queryKeys.plans.detail(clientId, planId),
    queryFn: () => getPlanDetail(planRepository, clientId, planId),
    enabled: Boolean(clientId && planId),
  });
}
