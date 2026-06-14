import { useMutation, useQueryClient } from "@tanstack/react-query";

import { savePlanSettings } from "@/application/plan/savePlanSettings";
import { planRepositoryMock } from "@/infrastructure/repositories/plan/planRepository.mock";
import type { SavePlanSettingsInput } from "@/domain/plan/Plan";
import { queryKeys } from "@/infrastructure/query/queryKeys";

import { usePlanDraftStore } from "../store/planDraftStore";

export function useSavePlanSettingsMutation() {
  const queryClient = useQueryClient();
  const setSaveMessage = usePlanDraftStore((state) => state.setSaveMessage);

  return useMutation({
    mutationFn: (input: SavePlanSettingsInput) => savePlanSettings(planRepositoryMock, input),
    onSuccess: (plan) => {
      setSaveMessage("已保存");
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.detail(plan.clientId, plan.id) });
    },
  });
}
