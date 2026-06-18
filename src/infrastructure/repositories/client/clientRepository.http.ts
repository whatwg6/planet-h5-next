import type { ClientDetail, ClientSummary } from "@/domain/client/Client";
import type { ClientRepository } from "@/domain/client/ClientRepository";
import { axiosClient } from "@/infrastructure/http/axiosClient";

export const clientRepositoryHttp: ClientRepository = {
  async listClients(params) {
    const response = await axiosClient.get<ClientSummary[]>("/clients", { params });
    return response.data;
  },
  async getClientDetail(clientId) {
    const response = await axiosClient.get<ClientDetail>(`/clients/${clientId}`);
    return response.data;
  },
  async updateClient(input) {
    const response = await axiosClient.patch<ClientDetail>(`/clients/${input.clientId}`, input);
    return response.data;
  },
};
