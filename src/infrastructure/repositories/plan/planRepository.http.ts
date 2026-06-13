import type { PlanRepository } from "@/domain/plan/PlanRepository";
import { axiosClient } from "@/infrastructure/http/axiosClient";

import type { PlanDetailDto } from "./planDto";
import { mapPlanDetailDto } from "./planMapper";

export const planRepositoryHttp: PlanRepository = {
  async getPlanDetail(clientId, planId) {
    const response = await axiosClient.get<PlanDetailDto>(`/clients/${clientId}/plans/${planId}`);
    return mapPlanDetailDto(response.data);
  },
  async savePlanSettings(input) {
    const response = await axiosClient.post<PlanDetailDto>(`/clients/${input.clientId}/plans`, input);
    return mapPlanDetailDto(response.data);
  },
};
