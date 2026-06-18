import type { MerchantRepository } from "@/domain/merchant/MerchantRepository";
import { merchantMockData } from "@/infrastructure/mock/merchantMockData";

export const merchantRepositoryMock: MerchantRepository = {
  async listMerchants(params) {
    return merchantMockData
      .map((merchant) => ({ id: merchant.id, name: merchant.name, city: merchant.city }))
      .filter((merchant) => !params.keyword || merchant.name.includes(params.keyword) || merchant.city?.includes(params.keyword));
  },
  async getMerchantDetail(merchantId) {
    const merchant = merchantMockData.find((item) => item.id === merchantId);
    if (!merchant) throw new Error("Merchant not found");
    return merchant;
  },
};
