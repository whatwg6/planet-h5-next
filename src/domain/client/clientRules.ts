import type {
  ClientAppVersionSetting,
  ClientCostCenter,
  ClientDepartment,
  ClientFieldSettings,
  ClientNotificationSetting,
  ClientPasswordSetting,
} from "@/domain/client/Client";

export function hasClientIdentity(client: { id: string }) {
  return client.id.trim().length > 0;
}

export function validateClientName(name: string) {
  const normalized = name.trim();
  if (!normalized) return "名称不能为空";
  if (normalized.length > 20) return "超出最大 20 个字符限制";
  return undefined;
}

export function validateClientRemark(remark: string) {
  if (remark.trim().length > 30) return "超出最大 30 个字符限制";
  return undefined;
}

export function normalizeClientLoginSetting<
  T extends { personalAccountBindingEnabled: boolean; passwordlessPersonalLoginEnabled: boolean },
>(setting: T): T {
  if (setting.personalAccountBindingEnabled) return setting;
  return { ...setting, passwordlessPersonalLoginEnabled: false };
}

type ClientSelectionRuleInput = {
  label: string;
  optionIds: string[];
  selectedIds: string[];
  disabledOptionIds?: string[];
  allowEmpty?: boolean;
};

export function validateClientSelection({
  label,
  optionIds,
  selectedIds,
  disabledOptionIds = [],
  allowEmpty = false,
}: ClientSelectionRuleInput) {
  if (!allowEmpty && selectedIds.length === 0) return `至少选择一个${label}`;

  const knownIds = new Set(optionIds);
  const disabledIds = new Set(disabledOptionIds);

  if (selectedIds.some((id) => !knownIds.has(id))) return `${label}不存在`;
  if (selectedIds.some((id) => disabledIds.has(id))) return `${label}已停用`;

  return undefined;
}

export function uniqueClientSelectionIds(ids: string[]) {
  return Array.from(new Set(ids));
}

export function validateClientPasswordSetting(setting: ClientPasswordSetting) {
  if (!setting.periodEnabled) return undefined;
  if (!Number.isInteger(setting.periodDays) || setting.periodDays < 1 || setting.periodDays > 365) {
    return "修改周期需为 1-365 天";
  }
  return undefined;
}

export function validateClientNotificationSetting(setting: ClientNotificationSetting) {
  if (!setting.enabled) return undefined;
  if (!setting.title.trim()) return "公告标题不能为空";
  if (setting.title.trim().length > 40) return "公告标题最多 40 个字符";
  if (!setting.content.trim()) return "公告内容不能为空";
  if (setting.content.trim().length > 120) return "公告内容最多 120 个字符";
  return undefined;
}

export function normalizeClientAppVersionSetting(
  setting: ClientAppVersionSetting,
): ClientAppVersionSetting {
  return {
    ios: setting.ios.useCustomVersion
      ? { ...setting.ios, customVersion: setting.ios.customVersion?.trim() }
      : { ...setting.ios, customVersion: undefined },
    android: setting.android.useCustomVersion
      ? { ...setting.android, customVersion: setting.android.customVersion?.trim() }
      : { ...setting.android, customVersion: undefined },
  };
}

export function validateClientAppVersionSetting(setting: ClientAppVersionSetting) {
  const normalized = normalizeClientAppVersionSetting(setting);
  const platforms = [
    { name: "iOS", setting: normalized.ios },
    { name: "Android", setting: normalized.android },
  ];

  const invalidPlatform = platforms.find(
    ({ setting: platformSetting }) =>
      platformSetting.useCustomVersion && !platformSetting.customVersion,
  );

  if (invalidPlatform) return `${invalidPlatform.name} 自定义版本不能为空`;
  return undefined;
}

export function validateClientDepartments(departments: ClientDepartment[]) {
  const invalidDepartment = departments.find((department) => !department.name.trim());
  if (invalidDepartment) return "部门名称不能为空";
  return undefined;
}

export function validateClientCostCenters(costCenters: ClientCostCenter[]) {
  const invalidCostCenter = costCenters.find((costCenter) => !costCenter.name.trim());
  if (invalidCostCenter) return "成本中心名称不能为空";
  return undefined;
}

export function validateClientFieldSettings(fieldSettings: ClientFieldSettings) {
  const emailSetting = fieldSettings.fields.find((field) => field.key === "email");
  if (!emailSetting || emailSetting.requirement === "disabled") return undefined;

  const emailDomains = emailSetting.emailDomains ?? [];
  const invalidDomain = emailDomains.find(
    (domain) => !/^([A-Za-z0-9-]+\.)+[A-Za-z]{2,6}$/.test(domain),
  );
  if (invalidDomain) return "邮箱后缀格式不正确";

  const uniqueDomainCount = new Set(emailDomains).size;
  if (uniqueDomainCount !== emailDomains.length) return "邮箱后缀不能重复";
  if (emailDomains.length > 5) return "邮箱后缀最多 5 个";

  return undefined;
}
