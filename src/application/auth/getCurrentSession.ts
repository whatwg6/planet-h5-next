import type { AuthRepository } from "@/domain/auth/AuthRepository";

export function getCurrentSession(repository: AuthRepository) {
  return repository.getCurrentSession();
}
