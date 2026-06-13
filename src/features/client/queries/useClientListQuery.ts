import { useQuery } from "@tanstack/react-query";

import { useCases } from "@/app/bootstrap/useCases";
import type { ClientListParams } from "@/domain/client/Client";
import { queryKeys } from "@/infrastructure/query/queryKeys";

export function useClientListQuery(params: ClientListParams) {
  return useQuery({ queryKey: queryKeys.clients.list(params), queryFn: () => useCases.getClientList(params) });
}
