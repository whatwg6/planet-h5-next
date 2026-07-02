import type { QueryClient } from "@tanstack/react-query";

import { getCurrentSession } from "@/application/auth/getCurrentSession";
import { AuthRequiredError, ForbiddenAccessError } from "@/app/auth/accessErrors";
import type { PermissionCode } from "@/domain/auth/Auth";
import { hasPermission } from "@/domain/auth/authRules";
import { authRepository } from "@/infrastructure/repositories/auth";
import { queryKeys } from "@/infrastructure/query/queryKeys";

export async function requirePermission(queryClient: QueryClient, code: PermissionCode) {
  const session = await queryClient.ensureQueryData({
    queryKey: queryKeys.auth.session,
    queryFn: () => getCurrentSession(authRepository),
  });

  if (!session) throw new AuthRequiredError();
  if (!hasPermission(session, code)) throw new ForbiddenAccessError();
}
