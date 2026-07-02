import type { AuthRepository } from "@/domain/auth/AuthRepository";
import { currentUserSessionMock } from "@/infrastructure/mock/authMockData";

export const authRepositoryMock: AuthRepository = {
  async getCurrentSession() {
    return structuredClone(currentUserSessionMock);
  },
};
