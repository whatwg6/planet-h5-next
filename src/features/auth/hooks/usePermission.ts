import type { PermissionCode } from "@/domain/auth/Auth";
import { hasPermission } from "@/domain/auth/authRules";
import { useCurrentSessionQuery } from "@/features/auth/queries/useCurrentSessionQuery";

export function usePermission(code: PermissionCode) {
  const query = useCurrentSessionQuery();

  return hasPermission(query.data ?? null, code);
}
