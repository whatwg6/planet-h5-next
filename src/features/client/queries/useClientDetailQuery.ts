import { useQuery } from "@tanstack/react-query";

import { getClientDetail } from "@/app/bootstrap/useCases";
import { queryKeys } from "@/infrastructure/query/queryKeys";

export function useClientDetailQuery(clientId: string) {
  return useQuery({ queryKey: queryKeys.clients.detail(clientId), queryFn: () => getClientDetail(clientId) });
}
