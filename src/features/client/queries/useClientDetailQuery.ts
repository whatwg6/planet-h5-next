import { useQuery } from "@tanstack/react-query";

import { getClientDetail } from "@/application/client/getClientDetail";
import { clientRepositoryMock } from "@/infrastructure/repositories/client/clientRepository.mock";
import { queryKeys } from "@/infrastructure/query/queryKeys";

export function useClientDetailQuery(clientId: string) {
  return useQuery({
    queryKey: queryKeys.clients.detail(clientId),
    queryFn: () => getClientDetail(clientRepositoryMock, clientId),
  });
}
