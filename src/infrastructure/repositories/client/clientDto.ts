export type ClientSummaryDto = {
  id: string;
  name: string;
  phone?: string;
  updated_at?: string;
};

export type ClientDetailDto = ClientSummaryDto & {
  fields: Record<string, string>;
  plan_ids: string[];
};
