import { permissionCodes, type CurrentUserSession } from "@/domain/auth/Auth";

export const currentUserSessionMock: CurrentUserSession = {
  userId: "ops-u1",
  name: "运营用户",
  permissions: [...permissionCodes],
};
