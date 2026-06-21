import type { SavePlanSettingsInput } from "./Plan";

export function hasPlanIdentity(plan: { id: string }) {
  return plan.id.trim().length > 0;
}

const timeRangePattern = /^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/;

function hasValue(input: SavePlanSettingsInput, field: string) {
  return Boolean(input.fields[field]?.trim());
}

export function validatePlanSettings(input: SavePlanSettingsInput) {
  if (!input.clientId.trim()) return "clientId is required";
  if (!input.name.trim()) return "Plan name is required";

  const requiredFields = [
    "owner",
    "businessType",
    "menuStyle",
    "hidePrice",
    "hidePriceMealPoint",
    "dishRemark",
    "deliveryRemark",
    "pickupCode",
    "financeConfig",
    "merchantOrderVerification",
    "hiddenAccountTypes",
    "disableAppendDish",
  ];
  if (requiredFields.some((field) => !hasValue(input, field))) {
    return "Plan simple settings must be complete";
  }

  const maximumOrderAmount = input.fields.maximumOrderAmount;
  if (!maximumOrderAmount || !/^\d+(\.\d{1,2})?$/.test(maximumOrderAmount)) {
    return "maximumOrderAmount must be a valid amount";
  }

  const invalidRule = input.rules.find((rule) => {
    if (!rule.id.trim() || !rule.label.trim()) return true;
    return Object.values(rule.values).some((value) => !value.trim());
  });

  if (invalidRule) return "Plan rules must be complete";

  const ruleById = Object.fromEntries(input.rules.map((rule) => [rule.id, rule]));
  const openTimes = ruleById["open-times"]?.values.value;
  if (openTimes && !timeRangePattern.test(openTimes)) {
    return "open-times must be HH:mm-HH:mm";
  }

  const occupationTime = ruleById["occupation-time"]?.values.value;
  if (occupationTime && !/^[1-9]\d*\s*分钟$/.test(occupationTime)) {
    return "occupation-time must be positive minutes";
  }

  const pickupSetting = ruleById["pickup-setting"]?.values.value;
  if (pickupSetting && !pickupSetting.includes("取餐")) {
    return "pickup-setting must describe pickup method";
  }

  const locationSetting = ruleById["location-setting"]?.values.value;
  if (locationSetting && !locationSetting.includes("地址")) {
    return "location-setting must describe address rule";
  }

  return undefined;
}
