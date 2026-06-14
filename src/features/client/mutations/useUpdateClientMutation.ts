import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateClient } from "@/app/bootstrap/useCases";
import type { UpdateClientInput } from "@/domain/client/Client";
import { queryKeys } from "@/infrastructure/query/queryKeys";

export function useUpdateClientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateClientInput) => updateClient(input),
    onSuccess: (client) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(client.id) });
    },
  });
}
