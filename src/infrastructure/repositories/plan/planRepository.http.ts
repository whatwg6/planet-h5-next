import type { PlanDetail } from "@/domain/plan/Plan";
import type { PlanRepository } from "@/domain/plan/PlanRepository";
import { axiosClient } from "@/infrastructure/http/axiosClient";

export const planRepositoryHttp: PlanRepository = {
  async getPlanDetail(clientId, planId) {
    const response = await axiosClient.get<PlanDetail>(`/clients/${clientId}/plans/${planId}`);
    return response.data;
  },
  async savePlanSettings(input) {
    const response = await axiosClient.post<PlanDetail>(`/clients/${input.clientId}/plans`, input);
    return response.data;
  },
};
