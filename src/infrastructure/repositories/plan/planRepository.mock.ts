import type { PlanDetail, PlanSettingSummary } from "@/domain/plan/Plan";
import type { PlanRepository } from "@/domain/plan/PlanRepository";
import { planMockData } from "@/infrastructure/mock/planMockData";

function updateSettingValues(settings: PlanSettingSummary[], plan: PlanDetail) {
  const ruleValueById = Object.fromEntries(
    plan.rules.map((rule) => [rule.id, Object.values(rule.values).join(" / ")]),
  );
  const valueBySettingId: Record<string, string | undefined> = {
    "base-info": plan.name,
    "menu-style": plan.fields.menuStyle,
    "hide-price": plan.fields.hidePrice,
    "hide-price-meal-point": plan.fields.hidePriceMealPoint,
    "dish-remark": plan.fields.dishRemark,
    "delivery-remark": plan.fields.deliveryRemark,
    "pickup-code": plan.fields.pickupCode,
    "finance-config": plan.fields.financeConfig,
    "maximum-order-amount": plan.fields.maximumOrderAmount,
    "merchant-order-verification": plan.fields.merchantOrderVerification,
    "hidden-account-types": plan.fields.hiddenAccountTypes,
    "disable-append-dish": plan.fields.disableAppendDish,
    "open-times": ruleValueById["open-times"],
    "operation-day": ruleValueById["operation-day"],
    "occupation-time": ruleValueById["occupation-time"],
    restriction: ruleValueById.restriction,
    "order-rule": ruleValueById["order-rule"],
    "order-transfer": ruleValueById["order-transfer"],
    "manual-confirm-order": ruleValueById["manual-confirm-order"],
    "pickup-setting": ruleValueById["pickup-setting"],
    "location-setting": ruleValueById["location-setting"],
  };

  return settings.map((setting) => ({
    ...setting,
    value: valueBySettingId[setting.id] ?? setting.value,
  }));
}

export const planRepositoryMock: PlanRepository = {
  async getPlanDetail(clientId, planId) {
    const plan = planMockData.find((item) => item.clientId === clientId && item.id === planId);
    if (!plan) throw new Error("Plan not found");
    return plan;
  },
  async savePlanSettings(input) {
    const existing = input.planId
      ? planMockData.find((item) => item.clientId === input.clientId && item.id === input.planId)
      : undefined;
    const next: PlanDetail = {
      id: input.planId ?? `p${planMockData.length + 1}`,
      clientId: input.clientId,
      name: input.name,
      fields: input.fields,
      settings: [],
      rules: input.rules,
      updatedAt: new Date().toISOString(),
    };
    next.settings = updateSettingValues(existing?.settings ?? [], next);
    const index = planMockData.findIndex(
      (item) => item.clientId === input.clientId && item.id === next.id,
    );
    if (index >= 0) planMockData[index] = next;
    else planMockData.push(next);
    return next;
  },
};
