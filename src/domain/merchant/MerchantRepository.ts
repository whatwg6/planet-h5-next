import type { MerchantDetail, MerchantListParams, MerchantSummary } from "./Merchant";

export type MerchantRepository = {
  listMerchants(params: MerchantListParams): Promise<MerchantSummary[]>;
  getMerchantDetail(merchantId: string): Promise<MerchantDetail>;
};
