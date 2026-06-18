import type { MerchantDetail, MerchantSummary } from "@/domain/merchant/Merchant";
import type { MerchantRepository } from "@/domain/merchant/MerchantRepository";
import { axiosClient } from "@/infrastructure/http/axiosClient";

export const merchantRepositoryHttp: MerchantRepository = {
  async listMerchants(params) {
    const response = await axiosClient.get<MerchantSummary[]>("/merchants", { params });
    return response.data;
  },
  async getMerchantDetail(merchantId) {
    const response = await axiosClient.get<MerchantDetail>(`/merchants/${merchantId}`);
    return response.data;
  },
};
