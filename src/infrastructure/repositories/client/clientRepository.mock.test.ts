import { describe, expect, it } from "vitest";

import { clientRepositoryMock } from "./clientRepository.mock";

describe("clientRepositoryMock", () => {
  it("filters client summaries by name keyword", async () => {
    const clients = await clientRepositoryMock.listClients({ keyword: " 星河 " });

    expect(clients).toHaveLength(1);
    expect(clients[0]).toEqual(expect.objectContaining({ id: "c3", name: "星河便利店" }));
  });

  it("filters client summaries by phone keyword", async () => {
    const clients = await clientRepositoryMock.listClients({ keyword: "15512880010" });

    expect(clients).toHaveLength(1);
    expect(clients[0]).toEqual(expect.objectContaining({ id: "c12", name: "麦田烘焙" }));
  });

  it("returns empty results without throwing for unmatched keywords", async () => {
    await expect(clientRepositoryMock.listClients({ keyword: "不存在的客户" })).resolves.toEqual(
      [],
    );
  });

  it("returns deterministic newest-first summaries when params are empty", async () => {
    const clients = await clientRepositoryMock.listClients({});

    expect(clients.slice(0, 3).map((client) => client.id)).toEqual(["c1", "c2", "c3"]);
  });

  it("preserves developer test markers on list summaries", async () => {
    const clients = await clientRepositoryMock.listClients({ keyword: "客户 A" });

    expect(clients[0]).toEqual(expect.objectContaining({ id: "c1", isDeveloperTest: true }));
  });

  it("updates name and setting summary values in memory", async () => {
    const updated = await clientRepositoryMock.updateClient({
      clientId: "c3",
      values: { name: "星河便利店 Pro", remark: "已更新备注" },
    });

    expect(updated.name).toBe("星河便利店 Pro");
    expect(updated.remark).toBe("已更新备注");
    expect(updated.settings.find((setting) => setting.id === "nameAndRemark")).toEqual(
      expect.objectContaining({ value: "星河便利店 Pro" }),
    );
  });

  it("updates support and login setting summaries in memory", async () => {
    const updated = await clientRepositoryMock.updateClient({
      clientId: "c4",
      values: {
        support: { contactName: "客服小新", contactPhone: "400-200-0002" },
        login: {
          emailLoginEnabled: false,
          personalAccountBindingEnabled: false,
          passwordlessPersonalLoginEnabled: false,
          dapiLoginEnabled: true,
        },
      },
    });

    expect(updated.settingDetails?.support.contactName).toBe("客服小新");
    expect(updated.settings.find((setting) => setting.id === "support")).toEqual(
      expect.objectContaining({ value: "客服小新" }),
    );
    expect(updated.settings.find((setting) => setting.id === "loginSetting")).toEqual(
      expect.objectContaining({ value: "1 项已开启" }),
    );
  });

  it("updates simple client setting summaries in memory", async () => {
    const updated = await clientRepositoryMock.updateClient({
      clientId: "c6",
      values: {
        passwordSetting: {
          requiredEnabled: false,
          complexityRule: "default",
          periodEnabled: false,
          periodDays: 90,
        },
        notification: {
          enabled: false,
          title: "午餐预订提醒",
          content: "请及时订餐。",
        },
        appVersion: {
          ios: {
            defaultVersion: "4.38.0",
            availableVersions: ["4.38.0", "4.40.0"],
            useCustomVersion: true,
            customVersion: "4.40.0",
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

    expect(updated.settings.find((setting) => setting.id === "passwordSetting")).toEqual(
      expect.objectContaining({ value: "未开启" }),
    );
    expect(updated.settings.find((setting) => setting.id === "notification")).toEqual(
      expect.objectContaining({ value: "已关闭" }),
    );
    expect(updated.settings.find((setting) => setting.id === "appVersion")).toEqual(
      expect.objectContaining({ value: "4.40.0" }),
    );
  });

  it("updates structured client setting summaries in memory", async () => {
    const updated = await clientRepositoryMock.updateClient({
      clientId: "c5",
      values: {
        departments: [
          { id: "d10", name: "总部", source: "manual" },
          { id: "d11", name: "第三方部门", source: "thirdParty", disabled: true },
        ],
        costCenters: [{ id: "cc10", name: "总部预算" }],
        fieldSettings: {
          fields: [
            { key: "email", title: "邮箱", requirement: "required", emailDomains: ["mc.com"] },
            { key: "employeeNumber", title: "登录名", requirement: "disabled" },
            { key: "name", title: "取餐昵称", requirement: "optional" },
            { key: "department", title: "部门", requirement: "optional" },
            { key: "costCenter", title: "成本中心", requirement: "disabled" },
          ],
          enableDisplayRealName: true,
          enableEditRealName: true,
        },
      },
    });

    expect(updated.settings.find((setting) => setting.id === "department")).toEqual(
      expect.objectContaining({ value: "1 个" }),
    );
    expect(updated.settings.find((setting) => setting.id === "costCenter")).toEqual(
      expect.objectContaining({ value: "1 个" }),
    );
    expect(updated.settings.find((setting) => setting.id === "fieldSetting")).toEqual(
      expect.objectContaining({ value: "3 项已开启" }),
    );
  });

  it("updates meal setting details and summaries in memory", async () => {
    const updated = await clientRepositoryMock.updateClient({
      clientId: "c7",
      values: {
        mealPoint: {
          enabled: true,
          points: [
            { id: "mp1", name: "早餐餐点" },
            { id: "mp2", name: "午餐餐点" },
            { id: "mp3", name: "晚餐餐点", disabled: true },
          ],
          selectedPointIds: ["mp1", "mp2"],
        },
        mealType: {
          mealTypes: [
            { id: "mt1", name: "早餐" },
            { id: "mt2", name: "午餐" },
          ],
          selectedMealTypeIds: ["mt2"],
        },
        mealGroup: {
          mealGroups: [
            { id: "mg1", name: "默认用餐组" },
            { id: "mg2", name: "历史用餐组", disabled: true },
          ],
          selectedMealGroupIds: [],
        },
      },
    });

    expect(updated.settingDetails?.mealPoint.selectedPointIds).toEqual(["mp1", "mp2"]);
    expect(updated.settings.find((setting) => setting.id === "mealPoint")).toEqual(
      expect.objectContaining({ value: "2 个餐点" }),
    );
    expect(updated.settings.find((setting) => setting.id === "mealType")).toEqual(
      expect.objectContaining({ value: "1 个餐次" }),
    );
    expect(updated.settings.find((setting) => setting.id === "mealGroup")).toEqual(
      expect.objectContaining({ value: "未选择" }),
    );
  });
});
