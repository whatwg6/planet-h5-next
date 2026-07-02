import { useQuery } from "@tanstack/react-query";

import { getCurrentSession } from "@/application/auth/getCurrentSession";
import { authRepository } from "@/infrastructure/repositories/auth";
import { queryKeys } from "@/infrastructure/query/queryKeys";

export function useCurrentSessionQuery() {
  return useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: () => getCurrentSession(authRepository),
  });
}
