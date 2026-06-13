import type { ClientRepository } from "@/domain/client/ClientRepository";

export function getClientDetail(repository: ClientRepository, clientId: string) {
  if (!clientId.trim()) return Promise.reject(new Error("clientId is required"));
  return repository.getClientDetail(clientId);
}
