import { useQuery } from "@tanstack/react-query";

import { getMerchantDetail } from "@/application/merchant/getMerchantDetail";
import { merchantRepositoryMock } from "@/infrastructure/repositories/merchant/merchantRepository.mock";
import { queryKeys } from "@/infrastructure/query/queryKeys";

export function useMerchantDetailQuery(merchantId: string) {
  return useQuery({
    queryKey: queryKeys.merchants.detail(merchantId),
    queryFn: () => getMerchantDetail(merchantRepositoryMock, merchantId),
  });
}
