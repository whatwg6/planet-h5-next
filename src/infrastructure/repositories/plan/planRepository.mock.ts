import type { PlanRepository } from "@/domain/plan/PlanRepository";
import { planMockData } from "@/infrastructure/mock/planMockData";

import { mapPlanDetailDto } from "./planMapper";

export const planRepositoryMock: PlanRepository = {
  async getPlanDetail(clientId, planId) {
    const plan = planMockData.find((item) => item.client_id === clientId && item.id === planId);
    if (!plan) throw new Error("Plan not found");
    return mapPlanDetailDto(plan);
  },
  async savePlanSettings(input) {
    const next = {
      id: input.planId ?? `p${planMockData.length + 1}`,
      client_id: input.clientId,
      name: input.name,
      fields: input.fields,
      rules: input.rules,
      updated_at: new Date().toISOString(),
    };
    const index = planMockData.findIndex((item) => item.id === next.id);
    if (index >= 0) planMockData[index] = next;
    else planMockData.push(next);
    return mapPlanDetailDto(next);
  },
};
