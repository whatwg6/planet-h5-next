import { describe, expect, it } from "vitest";

import {
  hasClientIdentity,
  normalizeClientAppVersionSetting,
  normalizeClientLoginSetting,
  uniqueClientSelectionIds,
  validateClientAppVersionSetting,
  validateClientName,
  validateClientNotificationSetting,
  validateClientPasswordSetting,
  validateClientRemark,
  validateClientSelection,
} from "./clientRules";

describe("clientRules boundary", () => {
  it("only checks whether a client identity is present", () => {
    expect(hasClientIdentity({ id: "c1" })).toBe(true);
    expect(hasClientIdentity({ id: "" })).toBe(false);
  });

  it("validates name and remark edit limits", () => {
    expect(validateClientName("客户 A")).toBeUndefined();
    expect(validateClientName(" ")).toBe("名称不能为空");
    expect(validateClientName("123456789012345678901")).toBe("超出最大 20 个字符限制");
    expect(validateClientRemark("1234567890123456789012345678901")).toBe("超出最大 30 个字符限制");
  });

  it("turns off passwordless login when personal account binding is disabled", () => {
    expect(
      normalizeClientLoginSetting({
        personalAccountBindingEnabled: false,
        passwordlessPersonalLoginEnabled: true,
      }),
    ).toEqual({
      personalAccountBindingEnabled: false,
      passwordlessPersonalLoginEnabled: false,
    });
  });

  it("validates simple client setting values", () => {
    expect(
      validateClientPasswordSetting({
        requiredEnabled: true,
        complexityRule: "default",
        periodEnabled: true,
        periodDays: 0,
      }),
    ).toBe("修改周期需为 1-365 天");

    expect(
      validateClientNotificationSetting({
        enabled: true,
        title: " ",
        content: "公告内容",
      }),
    ).toBe("公告标题不能为空");

    expect(
      validateClientAppVersionSetting({
        ios: {
          defaultVersion: "4.38.0",
          availableVersions: ["4.38.0"],
          useCustomVersion: true,
          customVersion: "",
        },
        android: {
          defaultVersion: "4.38.0",
          availableVersions: ["4.38.0"],
          useCustomVersion: false,
        },
      }),
    ).toBe("iOS 自定义版本不能为空");
  });

  it("clears custom app versions when system default is selected", () => {
    expect(
      normalizeClientAppVersionSetting({
        ios: {
          defaultVersion: "4.38.0",
          availableVersions: ["4.38.0"],
          useCustomVersion: false,
          customVersion: "4.40.0",
        },
        android: {
          defaultVersion: "4.38.0",
          availableVersions: ["4.38.0"],
          useCustomVersion: true,
          customVersion: " 4.40.0 ",
        },
      }),
    ).toEqual({
      ios: {
        defaultVersion: "4.38.0",
        availableVersions: ["4.38.0"],
        useCustomVersion: false,
        customVersion: undefined,
      },
      android: {
        defaultVersion: "4.38.0",
        availableVersions: ["4.38.0"],
        useCustomVersion: true,
        customVersion: "4.40.0",
      },
    });
  });

  it("validates structured client selection values", () => {
    expect(
      validateClientSelection({
        label: "餐点",
        optionIds: ["mp1", "mp2"],
        selectedIds: [],
      }),
    ).toBe("至少选择一个餐点");

    expect(
      validateClientSelection({
        label: "餐次",
        optionIds: ["mt1"],
        selectedIds: ["missing"],
      }),
    ).toBe("餐次不存在");

    expect(
      validateClientSelection({
        label: "用餐组",
        optionIds: ["mg1", "mg2"],
        selectedIds: ["mg2"],
        disabledOptionIds: ["mg2"],
      }),
    ).toBe("用餐组已停用");

    expect(uniqueClientSelectionIds(["mp1", "mp1", "mp2"])).toEqual(["mp1", "mp2"]);
  });
});
