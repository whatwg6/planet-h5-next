import type { ClientRepository } from "@/domain/client/ClientRepository";
import {
  buildClientSettingSummaries,
  clientMockData,
  createDefaultClientSettings,
} from "@/infrastructure/mock/clientMockData";

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
    if (input.values.name !== undefined) client.name = input.values.name;
    if (input.values.remark !== undefined) client.remark = input.values.remark;
    if (input.values.support) {
      client.settingDetails = {
        ...(client.settingDetails ?? createDefaultClientSettings()),
        support: input.values.support,
      };
    }
    if (input.values.login) {
      client.settingDetails = {
        ...(client.settingDetails ?? createDefaultClientSettings()),
        login: input.values.login,
      };
    }
    if (input.values.passwordSetting) {
      client.settingDetails = {
        ...(client.settingDetails ?? createDefaultClientSettings()),
        passwordSetting: input.values.passwordSetting,
      };
    }
    if (input.values.notification) {
      client.settingDetails = {
        ...(client.settingDetails ?? createDefaultClientSettings()),
        notification: input.values.notification,
      };
    }
    if (input.values.appVersion) {
      client.settingDetails = {
        ...(client.settingDetails ?? createDefaultClientSettings()),
        appVersion: input.values.appVersion,
      };
    }
    if (input.values.managers) {
      client.settingDetails = {
        ...(client.settingDetails ?? createDefaultClientSettings()),
        managers: input.values.managers,
      };
    }
    if (input.values.departments) {
      client.settingDetails = {
        ...(client.settingDetails ?? createDefaultClientSettings()),
        departments: input.values.departments,
      };
    }
    if (input.values.costCenters) {
      client.settingDetails = {
        ...(client.settingDetails ?? createDefaultClientSettings()),
        costCenters: input.values.costCenters,
      };
    }
    if (input.values.fieldSettings) {
      client.settingDetails = {
        ...(client.settingDetails ?? createDefaultClientSettings()),
        fieldSettings: input.values.fieldSettings,
      };
    }
    if (input.values.mealPoint) {
      client.settingDetails = {
        ...(client.settingDetails ?? createDefaultClientSettings()),
        mealPoint: input.values.mealPoint,
      };
    }
    if (input.values.mealType) {
      client.settingDetails = {
        ...(client.settingDetails ?? createDefaultClientSettings()),
        mealType: input.values.mealType,
      };
    }
    if (input.values.mealGroup) {
      client.settingDetails = {
        ...(client.settingDetails ?? createDefaultClientSettings()),
        mealGroup: input.values.mealGroup,
      };
    }
    client.settings = buildClientSettingSummaries(client);
    return client;
  },
};
