import type { SavePlanSettingsInput } from "@/domain/plan/Plan";
import type { PlanRepository } from "@/domain/plan/PlanRepository";
import { validatePlanSettings } from "@/domain/plan/planRules";

export function savePlanSettings(repository: PlanRepository, input: SavePlanSettingsInput) {
  const error = validatePlanSettings(input);
  if (error) return Promise.reject(new Error(error));
  return repository.savePlanSettings(input);
}
