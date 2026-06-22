import { useQuery } from "@tanstack/react-query";

import { getClientOrderDetail } from "@/application/order/getClientOrderDetail";
import type { ParsedOrderParams } from "@/domain/order/Order";
import { queryKeys } from "@/infrastructure/query/queryKeys";
import { orderRepository } from "@/infrastructure/repositories/order";

export function useClientOrderDetailQuery(
  clientId: string,
  planId: string,
  params: ParsedOrderParams,
) {
  return useQuery({
    queryKey: queryKeys.orders.detail(clientId, planId, params.raw),
    queryFn: () => getClientOrderDetail(orderRepository, { clientId, planId, params }),
  });
}
