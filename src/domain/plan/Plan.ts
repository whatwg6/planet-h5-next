export type PlanRule = {
  id: string;
  label: string;
  values: Record<string, string>;
};

export type PlanDetail = {
  id: string;
  clientId: string;
  name: string;
  fields: Record<string, string>;
  rules: PlanRule[];
  updatedAt?: string;
};

export type SavePlanSettingsInput = {
  clientId: string;
  planId?: string;
  name: string;
  fields: Record<string, string>;
  rules: PlanRule[];
};
