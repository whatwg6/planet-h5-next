import type { MerchantRepository } from "@/domain/merchant/MerchantRepository";
import { axiosClient } from "@/infrastructure/http/axiosClient";

import type { MerchantDetailDto, MerchantSummaryDto } from "./merchantDto";
import { mapMerchantDetailDto, mapMerchantSummaryDto } from "./merchantMapper";

export const merchantRepositoryHttp: MerchantRepository = {
  async listMerchants(params) {
    const response = await axiosClient.get<MerchantSummaryDto[]>("/merchants", { params });
    return response.data.map(mapMerchantSummaryDto);
  },
  async getMerchantDetail(merchantId) {
    const response = await axiosClient.get<MerchantDetailDto>(`/merchants/${merchantId}`);
    return mapMerchantDetailDto(response.data);
  },
};
