import type { CurrentUserSession } from "@/domain/auth/Auth";
import type { AuthRepository } from "@/domain/auth/AuthRepository";
import { axiosClient } from "@/infrastructure/http/axiosClient";

export const authRepositoryHttp: AuthRepository = {
  async getCurrentSession() {
    const response = await axiosClient.get<CurrentUserSession | null>("/auth/session");
    return response.data;
  },
};
