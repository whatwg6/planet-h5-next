import { useQuery } from "@tanstack/react-query";

import { getMerchantDetail } from "@/app/bootstrap/useCases";
import { queryKeys } from "@/infrastructure/query/queryKeys";

export function useMerchantDetailQuery(merchantId: string) {
  return useQuery({ queryKey: queryKeys.merchants.detail(merchantId), queryFn: () => getMerchantDetail(merchantId) });
}
