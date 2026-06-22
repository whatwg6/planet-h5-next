import { useQuery } from "@tanstack/react-query";

import { listClientMemberOrders } from "@/application/order/listClientMemberOrders";
import type { ParsedOrderParams } from "@/domain/order/Order";
import { queryKeys } from "@/infrastructure/query/queryKeys";
import { orderRepository } from "@/infrastructure/repositories/order";

export function useClientMemberOrderListQuery(
  clientId: string,
  planId: string,
  params: ParsedOrderParams,
) {
  return useQuery({
    queryKey: queryKeys.orders.memberList(clientId, planId, params.raw),
    queryFn: () => listClientMemberOrders(orderRepository, { clientId, planId, params }),
  });
}
