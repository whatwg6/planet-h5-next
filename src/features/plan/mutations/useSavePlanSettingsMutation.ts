import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useCases } from "@/app/bootstrap/useCases";
import type { SavePlanSettingsInput } from "@/domain/plan/Plan";
import { queryKeys } from "@/infrastructure/query/queryKeys";

import { usePlanDraftStore } from "../store/planDraftStore";

export function useSavePlanSettingsMutation() {
  const queryClient = useQueryClient();
  const setSaveMessage = usePlanDraftStore((state) => state.setSaveMessage);

  return useMutation({
    mutationFn: (input: SavePlanSettingsInput) => useCases.savePlanSettings(input),
    onSuccess: (plan) => {
      setSaveMessage("已保存");
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.detail(plan.clientId, plan.id) });
    },
  });
}
