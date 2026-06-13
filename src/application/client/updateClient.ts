import type { UpdateClientInput } from "@/domain/client/Client";
import type { ClientRepository } from "@/domain/client/ClientRepository";

export function updateClient(repository: ClientRepository, input: UpdateClientInput) {
  if (!input.clientId.trim()) return Promise.reject(new Error("clientId is required"));
  return repository.updateClient(input);
}
