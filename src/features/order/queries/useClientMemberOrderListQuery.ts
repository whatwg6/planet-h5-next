import { useQuery } from "@tanstack/react-query";

import { listClientMemberOrders } from "@/application/order/listClientMemberOrders";
import type { ParsedOrderParams } from "@/domain/order/Order";
import { queryKeys } from "@/infrastructure/query/queryKeys";
import { orderRepositoryMock } from "@/infrastructure/repositories/order/orderRepository.mock";

export function useClientMemberOrderListQuery(
  clientId: string,
  planId: string,
  params: ParsedOrderParams,
) {
  return useQuery({
    queryKey: queryKeys.orders.memberList(clientId, planId, params.raw),
    queryFn: () => listClientMemberOrders(orderRepositoryMock, { clientId, planId, params }),
  });
}
