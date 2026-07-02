export const permissionCodes = [
  "client:list:view",
  "client:detail:view",
  "client:settings:edit",
  "plan:detail:view",
  "plan:settings:edit",
  "order:view",
] as const;

export type PermissionCode = (typeof permissionCodes)[number];

export type CurrentUserSession = {
  userId: string;
  name: string;
  permissions: PermissionCode[];
};
