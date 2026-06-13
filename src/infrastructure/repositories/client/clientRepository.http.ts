import type { ClientRepository } from "@/domain/client/ClientRepository";
import { axiosClient } from "@/infrastructure/http/axiosClient";

import type { ClientDetailDto, ClientSummaryDto } from "./clientDto";
import { mapClientDetailDto, mapClientSummaryDto } from "./clientMapper";

export const clientRepositoryHttp: ClientRepository = {
  async listClients(params) {
    const response = await axiosClient.get<ClientSummaryDto[]>("/clients", { params });
    return response.data.map(mapClientSummaryDto);
  },
  async getClientDetail(clientId) {
    const response = await axiosClient.get<ClientDetailDto>(`/clients/${clientId}`);
    return mapClientDetailDto(response.data);
  },
  async updateClient(input) {
    const response = await axiosClient.patch<ClientDetailDto>(`/clients/${input.clientId}`, input);
    return mapClientDetailDto(response.data);
  },
};
