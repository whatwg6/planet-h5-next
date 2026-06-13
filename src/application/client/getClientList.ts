import type { ClientListParams } from "@/domain/client/Client";
import type { ClientRepository } from "@/domain/client/ClientRepository";

export function getClientList(repository: ClientRepository, params: ClientListParams) {
  return repository.listClients(params);
}
