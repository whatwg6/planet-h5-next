import { useQuery } from "@tanstack/react-query";

import { useCases } from "@/app/bootstrap/useCases";
import { queryKeys } from "@/infrastructure/query/queryKeys";

export function useMerchantDetailQuery(merchantId: string) {
  return useQuery({ queryKey: queryKeys.merchants.detail(merchantId), queryFn: () => useCases.getMerchantDetail(merchantId) });
}
