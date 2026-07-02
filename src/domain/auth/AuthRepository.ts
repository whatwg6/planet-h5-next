import type { CurrentUserSession } from "./Auth";

export type AuthRepository = {
  getCurrentSession(): Promise<CurrentUserSession | null>;
};
