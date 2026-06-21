import type { ClientRepository } from "@/domain/client/ClientRepository";
import { clientMockData } from "@/infrastructure/mock/clientMockData";

export const clientRepositoryMock: ClientRepository = {
  async listClients(params) {
    return clientMockData
      .map((client) => ({
        id: client.id,
        name: client.name,
        phone: client.phone,
        updatedAt: client.updatedAt,
        isDeveloperTest: client.isDeveloperTest,
      }))
      .filter(
        (client) =>
          !params.keyword ||
          client.name.includes(params.keyword) ||
          client.phone?.includes(params.keyword),
      );
  },
  async getClientDetail(clientId) {
    const client = clientMockData.find((item) => item.id === clientId);
    if (!client) throw new Error("Client not found");
    return client;
  },
  async updateClient(input) {
    const client = clientMockData.find((item) => item.id === input.clientId);
    if (!client) throw new Error("Client not found");
    const { name, remark, ...fields } = input.values;
    client.fields = { ...client.fields, ...fields };
    client.name = input.values.name ?? client.name;
    client.remark = remark ?? client.remark;
    client.settings = client.settings.map((setting) =>
      setting.id === "nameAndRemark" ? { ...setting, value: client.name } : setting,
    );
    return client;
  },
};
