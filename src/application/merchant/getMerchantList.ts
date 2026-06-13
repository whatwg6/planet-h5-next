import type { MerchantListParams } from "@/domain/merchant/Merchant";
import type { MerchantRepository } from "@/domain/merchant/MerchantRepository";

export function getMerchantList(repository: MerchantRepository, params: MerchantListParams) {
  return repository.listMerchants(params);
}
