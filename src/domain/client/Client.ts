export type ClientSummary = {
  id: string;
  name: string;
  phone?: string;
  updatedAt?: string;
  isDeveloperTest?: boolean;
};

export type ClientMealPlanSummary = {
  id: string;
  name: string;
  businessType: "groupDelivery" | "dineIn";
  updatedAt?: string;
};

export type ClientSettingSummary = {
  id: string;
  title: string;
  group: "basic" | "account" | "payment" | "address" | "advanced";
  value?: string;
  description?: string;
  mode?: string;
  disabled?: boolean;
};

export type ClientDetail = ClientSummary & {
  remark?: string;
  fields: Record<string, string>;
  mealPlans: ClientMealPlanSummary[];
  settings: ClientSettingSummary[];
};

export type ClientListParams = {
  keyword?: string;
};

export type UpdateClientInput = {
  clientId: string;
  values: Record<string, string>;
};
