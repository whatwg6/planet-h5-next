import { useQuery } from "@tanstack/react-query";

import { getClientDetail } from "@/application/client/getClientDetail";
import { clientRepository } from "@/infrastructure/repositories/client";
import { queryKeys } from "@/infrastructure/query/queryKeys";

export function useClientDetailQuery(clientId: string) {
  return useQuery({
    queryKey: queryKeys.clients.detail(clientId),
    queryFn: () => getClientDetail(clientRepository, clientId),
  });
}
