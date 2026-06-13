import type { SavePlanSettingsInput } from "@/domain/plan/Plan";
import type { PlanRepository } from "@/domain/plan/PlanRepository";

export function savePlanSettings(repository: PlanRepository, input: SavePlanSettingsInput) {
  if (!input.clientId.trim()) return Promise.reject(new Error("clientId is required"));
  return repository.savePlanSettings(input);
}
