import { useQuery } from "@tanstack/react-query";

import { getPlanDetail } from "@/application/plan/getPlanDetail";
import { planRepositoryMock } from "@/infrastructure/repositories/plan/planRepository.mock";
import { queryKeys } from "@/infrastructure/query/queryKeys";

export function usePlanDetailQuery(clientId: string, planId: string) {
  return useQuery({
    queryKey: queryKeys.plans.detail(clientId, planId),
    queryFn: () => getPlanDetail(planRepositoryMock, clientId, planId),
  });
}
