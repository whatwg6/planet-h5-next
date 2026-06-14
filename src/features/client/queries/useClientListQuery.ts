import { useQuery } from "@tanstack/react-query";

import { getClientList } from "@/application/client/getClientList";
import { clientRepositoryMock } from "@/infrastructure/repositories/client/clientRepository.mock";
import type { ClientListParams } from "@/domain/client/Client";
import { queryKeys } from "@/infrastructure/query/queryKeys";

export function useClientListQuery(params: ClientListParams) {
  return useQuery({ queryKey: queryKeys.clients.list(params), queryFn: () => getClientList(clientRepositoryMock, params) });
}
