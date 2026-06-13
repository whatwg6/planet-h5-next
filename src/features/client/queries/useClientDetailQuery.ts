import { useQuery } from "@tanstack/react-query";

import { useCases } from "@/app/bootstrap/useCases";
import { queryKeys } from "@/infrastructure/query/queryKeys";

export function useClientDetailQuery(clientId: string) {
  return useQuery({ queryKey: queryKeys.clients.detail(clientId), queryFn: () => useCases.getClientDetail(clientId) });
}
