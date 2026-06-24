export type PlanRule = {
  id:
    | "open-times"
    | "operation-day"
    | "occupation-time"
    | "restriction"
    | "order-rule"
    | "order-transfer"
    | "manual-confirm-order"
    | "pickup-setting"
    | "location-setting";
  label: string;
  values: Record<string, string>;
};

export type PlanSettingSummary = {
  id: string;
  title: string;
  group: "basic" | "order" | "menu" | "restriction" | "pickup" | "finance" | "advanced";
  value?: string;
  description?: string;
  disabled?: boolean;
  editable: "simple" | "structured";
};

export type PlanDetail = {
  id: string;
  clientId: string;
  name: string;
  fields: Record<string, string>;
  settings: PlanSettingSummary[];
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
