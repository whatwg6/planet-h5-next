import { useQuery } from "@tanstack/react-query";

import { getMerchantList } from "@/application/merchant/getMerchantList";
import { merchantRepositoryMock } from "@/infrastructure/repositories/merchant/merchantRepository.mock";
import type { MerchantListParams } from "@/domain/merchant/Merchant";
import { queryKeys } from "@/infrastructure/query/queryKeys";

export function useMerchantListQuery(params: MerchantListParams) {
  return useQuery({ queryKey: queryKeys.merchants.list(params), queryFn: () => getMerchantList(merchantRepositoryMock, params) });
}
