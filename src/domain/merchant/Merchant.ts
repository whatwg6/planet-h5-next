export type MerchantSummary = {
  id: string;
  name: string;
  city?: string;
};

export type MerchantDetail = MerchantSummary & {
  fields: Record<string, string>;
};

export type MerchantListParams = {
  keyword?: string;
};
