import { useQuery } from "@tanstack/react-query";

import { getClientList } from "@/application/client/getClientList";
import { clientRepository } from "@/infrastructure/repositories/client";
import type { ClientListParams } from "@/domain/client/Client";
import { queryKeys } from "@/infrastructure/query/queryKeys";

export function useClientListQuery(params: ClientListParams) {
  return useQuery({
    queryKey: queryKeys.clients.list(params),
    queryFn: () => getClientList(clientRepository, params),
  });
}
