import { useQuery } from "@tanstack/react-query";

import { getMerchantDetail } from "@/application/merchant/getMerchantDetail";
import { merchantRepository } from "@/infrastructure/repositories/merchant";
import { queryKeys } from "@/infrastructure/query/queryKeys";

export function useMerchantDetailQuery(merchantId: string) {
  return useQuery({
    queryKey: queryKeys.merchants.detail(merchantId),
    queryFn: () => getMerchantDetail(merchantRepository, merchantId),
  });
}
