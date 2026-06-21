import { describe, expect, it, vi } from "vitest";

import type { PlanRepository } from "@/domain/plan/PlanRepository";

import { getPlanDetail } from "./getPlanDetail";
import { savePlanSettings } from "./savePlanSettings";

const repository: PlanRepository = {
  getPlanDetail: vi.fn().mockResolvedValue({
    id: "p1",
    clientId: "c1",
    name: "方案 A",
    fields: {},
    settings: [],
    rules: [],
  }),
  savePlanSettings: vi.fn().mockResolvedValue({
    id: "p1",
    clientId: "c1",
    name: "方案 A",
    fields: {},
    settings: [],
    rules: [],
  }),
};

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
  maximumOrderAmount: "80.00",
  merchantOrderVerification: "开启",
  hiddenAccountTypes: "无",
  disableAppendDish: "关闭",
};

describe("plan use cases", () => {
  it("rejects missing ids before plan detail lookup", async () => {
    await expect(getPlanDetail(repository, "", "p1")).rejects.toThrow("clientId is required");
    await expect(getPlanDetail(repository, "c1", "")).rejects.toThrow("planId is required");
  });

  it("passes plan settings through to the repository", async () => {
    await savePlanSettings(repository, {
      clientId: "c1",
      planId: "p1",
      name: "方案 A",
      fields: validFields,
      rules: [],
    });
    expect(repository.savePlanSettings).toHaveBeenCalledWith({
      clientId: "c1",
      planId: "p1",
      name: "方案 A",
      fields: validFields,
      rules: [],
    });
  });

  it("rejects invalid plan settings before saving", async () => {
    await expect(
      savePlanSettings(repository, {
        clientId: "c1",
        planId: "p1",
        name: "",
        fields: validFields,
        rules: [],
      }),
    ).rejects.toThrow("Plan name is required");

    await expect(
      savePlanSettings(repository, {
        clientId: "c1",
        planId: "p1",
        name: "方案 A",
        fields: { ...validFields, maximumOrderAmount: "12.345" },
        rules: [],
      }),
    ).rejects.toThrow("maximumOrderAmount must be a valid amount");

    await expect(
      savePlanSettings(repository, {
        clientId: "c1",
        planId: "p1",
        name: "方案 A",
        fields: { ...validFields, hidePriceMealPoint: "" },
        rules: [],
      }),
    ).rejects.toThrow("Plan simple settings must be complete");
  });
});
