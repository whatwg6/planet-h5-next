import type { PlanRepository } from "@/domain/plan/PlanRepository";

export function getPlanDetail(repository: PlanRepository, clientId: string, planId: string) {
  if (!clientId.trim()) return Promise.reject(new Error("clientId is required"));
  if (!planId.trim()) return Promise.reject(new Error("planId is required"));
  return repository.getPlanDetail(clientId, planId);
}
