import type { ClientDetail, ClientListParams, ClientSummary, UpdateClientInput } from "./Client";

export type ClientRepository = {
  listClients(params: ClientListParams): Promise<ClientSummary[]>;
  getClientDetail(clientId: string): Promise<ClientDetail>;
  updateClient(input: UpdateClientInput): Promise<ClientDetail>;
};
