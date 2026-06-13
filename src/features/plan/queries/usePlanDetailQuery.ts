import { useQuery } from "@tanstack/react-query";

import { useCases } from "@/app/bootstrap/useCases";
import { queryKeys } from "@/infrastructure/query/queryKeys";

export function usePlanDetailQuery(clientId: string, planId: string) {
  return useQuery({ queryKey: queryKeys.plans.detail(clientId, planId), queryFn: () => useCases.getPlanDetail(clientId, planId) });
}
