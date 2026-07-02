import type { CurrentUserSession, PermissionCode } from "./Auth";

export function hasPermission(session: CurrentUserSession | null, code: PermissionCode) {
  return Boolean(session?.permissions.includes(code));
}
