import { describe, expect, it } from "vitest";

import { hasPlanIdentity, validatePlanSettings } from "./planRules";

const validFields = {
  owner: "运营 A",
  businessType: "团餐配送",
  menuStyle: "标准菜单",
  hidePrice: "否",
  hidePriceMealPoint: "否",
  dishRemark: "允许填写",
  deliveryRemark: "允许填写",
  pickupCode: "开启",
  financeConfig: "月结",
  maximumOrderAmount: "50.00",
  merchantOrderVerification: "开启",
  hiddenAccountTypes: "无",
  disableAppendDish: "关闭",
};

describe("planRules boundary", () => {
  it("only checks whether a plan identity is present", () => {
    expect(hasPlanIdentity({ id: "p1" })).toBe(true);
    expect(hasPlanIdentity({ id: "" })).toBe(false);
  });

  it("validates simple and structured plan setting input", () => {
    expect(
      validatePlanSettings({
        clientId: "c1",
        planId: "p1",
        name: "方案 A",
        fields: validFields,
        rules: [{ id: "open-times", label: "营业时间", values: { value: "09:00-18:00" } }],
      }),
    ).toBeUndefined();

    expect(
      validatePlanSettings({
        clientId: "c1",
        planId: "p1",
        name: "方案 A",
        fields: { ...validFields, maximumOrderAmount: "50.001" },
        rules: [],
      }),
    ).toBe("maximumOrderAmount must be a valid amount");

    expect(
      validatePlanSettings({
        clientId: "c1",
        planId: "p1",
        name: "方案 A",
        fields: validFields,
        rules: [{ id: "open-times", label: "营业时间", values: { value: "" } }],
      }),
    ).toBe("Plan rules must be complete");
  });

  it("validates structured plan rule values", () => {
    expect(
      validatePlanSettings({
        clientId: "c1",
        planId: "p1",
        name: "方案 A",
        fields: validFields,
        rules: [{ id: "open-times", label: "营业时间", values: { value: "9:00-18:00" } }],
      }),
    ).toBe("open-times must be HH:mm-HH:mm");

    expect(
      validatePlanSettings({
        clientId: "c1",
        planId: "p1",
        name: "方案 A",
        fields: validFields,
        rules: [{ id: "occupation-time", label: "占用时间", values: { value: "0 分钟" } }],
      }),
    ).toBe("occupation-time must be positive minutes");

    expect(
      validatePlanSettings({
        clientId: "c1",
        planId: "p1",
        name: "方案 A",
        fields: validFields,
        rules: [{ id: "pickup-setting", label: "取餐设置", values: { value: "凭码领取" } }],
      }),
    ).toBe("pickup-setting must describe pickup method");

    expect(
      validatePlanSettings({
        clientId: "c1",
        planId: "p1",
        name: "方案 A",
        fields: validFields,
        rules: [{ id: "location-setting", label: "地址设置", values: { value: "使用门店" } }],
      }),
    ).toBe("location-setting must describe address rule");
  });
});
