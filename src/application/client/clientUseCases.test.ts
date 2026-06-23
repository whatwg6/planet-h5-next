import { describe, expect, it, vi } from "vitest";

import type { ClientRepository } from "@/domain/client/ClientRepository";

import { getClientDetail } from "./getClientDetail";
import { getClientList } from "./getClientList";
import { updateClient } from "./updateClient";

const repository: ClientRepository = {
  listClients: vi.fn().mockResolvedValue([{ id: "c1", name: "客户 A" }]),
  getClientDetail: vi.fn().mockResolvedValue({
    id: "c1",
    name: "客户 A",
    fields: {},
    mealPlans: [],
    settings: [],
  }),
  updateClient: vi.fn().mockResolvedValue({
    id: "c1",
    name: "客户 A",
    fields: {},
    mealPlans: [],
    settings: [],
  }),
};

describe("client use cases", () => {
  it("delegates list params to the repository", async () => {
    await getClientList(repository, { keyword: " A " });
    expect(repository.listClients).toHaveBeenCalledWith({ keyword: "A" });
  });

  it("accepts missing client list params", async () => {
    await getClientList(repository);
    expect(repository.listClients).toHaveBeenCalledWith({});
  });

  it("rejects empty client ids before detail lookup", async () => {
    await expect(getClientDetail(repository, " ")).rejects.toThrow("clientId is required");
  });

  it("delegates client detail lookups to the repository by client id", async () => {
    await getClientDetail(repository, "c1");

    expect(repository.getClientDetail).toHaveBeenCalledWith("c1");
  });

  it("passes update values through without applying business decisions", async () => {
    await updateClient(repository, { clientId: "c1", values: { name: "客户 A" } });
    expect(repository.updateClient).toHaveBeenCalledWith({
      clientId: "c1",
      values: { name: "客户 A" },
    });
  });

  it("rejects invalid name updates before repository mutation", async () => {
    await expect(
      updateClient(repository, { clientId: "c1", values: { name: " " } }),
    ).rejects.toThrow("名称不能为空");
  });

  it("normalizes login updates before repository mutation", async () => {
    await updateClient(repository, {
      clientId: "c1",
      values: {
        login: {
          emailLoginEnabled: true,
          personalAccountBindingEnabled: false,
          passwordlessPersonalLoginEnabled: true,
          dapiLoginEnabled: false,
        },
      },
    });

    expect(repository.updateClient).toHaveBeenLastCalledWith({
      clientId: "c1",
      values: {
        login: {
          emailLoginEnabled: true,
          personalAccountBindingEnabled: false,
          passwordlessPersonalLoginEnabled: false,
          dapiLoginEnabled: false,
        },
      },
    });
  });

  it("validates and normalizes simple setting updates before repository mutation", async () => {
    await expect(
      updateClient(repository, {
        clientId: "c1",
        values: {
          passwordSetting: {
            requiredEnabled: true,
            complexityRule: "default",
            periodEnabled: true,
            periodDays: 0,
          },
        },
      }),
    ).rejects.toThrow("修改周期需为 1-365 天");

    await expect(
      updateClient(repository, {
        clientId: "c1",
        values: {
          notification: {
            enabled: true,
            title: " ",
            content: "公告内容",
          },
        },
      }),
    ).rejects.toThrow("公告标题不能为空");

    await updateClient(repository, {
      clientId: "c1",
      values: {
        appVersion: {
          ios: {
            defaultVersion: "4.38.0",
            availableVersions: ["4.38.0", "4.40.0"],
            useCustomVersion: false,
            customVersion: "4.40.0",
          },
          android: {
            defaultVersion: "4.38.0",
            availableVersions: ["4.38.0", "4.40.0"],
            useCustomVersion: true,
            customVersion: " 4.40.0 ",
          },
        },
      },
    });

    expect(repository.updateClient).toHaveBeenLastCalledWith({
      clientId: "c1",
      values: {
        appVersion: {
          ios: {
            defaultVersion: "4.38.0",
            availableVersions: ["4.38.0", "4.40.0"],
            useCustomVersion: false,
            customVersion: undefined,
          },
          android: {
            defaultVersion: "4.38.0",
            availableVersions: ["4.38.0", "4.40.0"],
            useCustomVersion: true,
            customVersion: "4.40.0",
          },
        },
      },
    });
  });

  it("rejects invalid structured setting updates before repository mutation", async () => {
    await expect(
      updateClient(repository, {
        clientId: "c1",
        values: {
          departments: [{ id: "d1", name: " ", source: "manual" }],
        },
      }),
    ).rejects.toThrow("部门名称不能为空");

    await expect(
      updateClient(repository, {
        clientId: "c1",
        values: {
          costCenters: [{ id: "cc1", name: " " }],
        },
      }),
    ).rejects.toThrow("成本中心名称不能为空");

    await expect(
      updateClient(repository, {
        clientId: "c1",
        values: {
          fieldSettings: {
            fields: [
              {
                key: "email",
                title: "邮箱",
                requirement: "required",
                emailDomains: ["bad-domain"],
              },
            ],
            enableDisplayRealName: true,
            enableEditRealName: false,
          },
        },
      }),
    ).rejects.toThrow("邮箱后缀格式不正确");
  });

  it("validates and normalizes meal setting updates before repository mutation", async () => {
    await expect(
      updateClient(repository, {
        clientId: "c1",
        values: {
          mealPoint: {
            enabled: true,
            points: [{ id: "mp1", name: "早餐餐点" }],
            selectedPointIds: [],
          },
        },
      }),
    ).rejects.toThrow("至少选择一个餐点");

    await expect(
      updateClient(repository, {
        clientId: "c1",
        values: {
          mealType: {
            mealTypes: [{ id: "mt1", name: "早餐", disabled: true }],
            selectedMealTypeIds: ["mt1"],
          },
        },
      }),
    ).rejects.toThrow("餐次已停用");

    await updateClient(repository, {
      clientId: "c1",
      values: {
        mealGroup: {
          mealGroups: [
            { id: "mg1", name: "默认用餐组" },
            { id: "mg2", name: "研发用餐组" },
          ],
          selectedMealGroupIds: ["mg1", "mg1", "mg2"],
        },
      },
    });

    expect(repository.updateClient).toHaveBeenLastCalledWith({
      clientId: "c1",
      values: {
        mealGroup: {
          mealGroups: [
            { id: "mg1", name: "默认用餐组" },
            { id: "mg2", name: "研发用餐组" },
          ],
          selectedMealGroupIds: ["mg1", "mg2"],
        },
      },
    });
  });
});
