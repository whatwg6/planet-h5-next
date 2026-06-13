import type { PlanDetail, SavePlanSettingsInput } from "./Plan";

export type PlanRepository = {
  getPlanDetail(clientId: string, planId: string): Promise<PlanDetail>;
  savePlanSettings(input: SavePlanSettingsInput): Promise<PlanDetail>;
};
