export type PlanRuleDto = {
  id: string;
  label: string;
  values: Record<string, string>;
};

export type PlanDetailDto = {
  id: string;
  client_id: string;
  name: string;
  fields: Record<string, string>;
  rules: PlanRuleDto[];
  updated_at?: string;
};
