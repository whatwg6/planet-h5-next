import type { MerchantRepository } from "@/domain/merchant/MerchantRepository";

export function getMerchantDetail(repository: MerchantRepository, merchantId: string) {
  if (!merchantId.trim()) return Promise.reject(new Error("merchantId is required"));
  return repository.getMerchantDetail(merchantId);
}
