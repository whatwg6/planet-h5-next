import { useQuery } from "@tanstack/react-query";

import { getClientList } from "@/application/client/getClientList";
import { normalizeClientListParams } from "@/domain/client/clientRules";
import { clientRepository } from "@/infrastructure/repositories/client";
import type { ClientListParams } from "@/domain/client/Client";
import { queryKeys } from "@/infrastructure/query/queryKeys";

export function useClientListQuery(params: ClientListParams) {
  const queryParams = normalizeClientListParams(params);

  return useQuery({
    queryKey: queryKeys.clients.list(queryParams),
    queryFn: () => getClientList(clientRepository, queryParams),
  });
}
