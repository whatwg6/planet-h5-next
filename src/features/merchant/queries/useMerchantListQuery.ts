import { useQuery } from "@tanstack/react-query";

import { useCases } from "@/app/bootstrap/useCases";
import type { MerchantListParams } from "@/domain/merchant/Merchant";
import { queryKeys } from "@/infrastructure/query/queryKeys";

export function useMerchantListQuery(params: MerchantListParams) {
  return useQuery({ queryKey: queryKeys.merchants.list(params), queryFn: () => useCases.getMerchantList(params) });
}
