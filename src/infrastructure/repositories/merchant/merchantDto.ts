export type MerchantSummaryDto = {
  id: string;
  name: string;
  city?: string;
};

export type MerchantDetailDto = MerchantSummaryDto & {
  fields: Record<string, string>;
};
