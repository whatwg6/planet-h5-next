import type { ClientListParams } from "@/domain/client/Client";
import type { ClientRepository } from "@/domain/client/ClientRepository";
import { normalizeClientListParams } from "@/domain/client/clientRules";

export function getClientList(repository: ClientRepository, params: ClientListParams = {}) {
  return repository.listClients(normalizeClientListParams(params));
}
