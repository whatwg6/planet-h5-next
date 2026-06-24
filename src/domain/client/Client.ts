export type ClientStatus = "enabled" | "disabled" | "archived";

export type ClientSummary = {
  id: string;
  name: string;
  phone?: string;
  updatedAt?: string;
  isDeveloperTest?: boolean;
  status?: ClientStatus;
  ownerName?: string;
  settingCompletionText?: string;
};

export type ClientMealPlanSummary = {
  id: string;
  name: string;
  businessType: "groupDelivery" | "dineIn";
  updatedAt?: string;
};

export type ClientSettingSummary = {
  id: string;
  title: string;
  group: "basic" | "account" | "payment" | "address" | "advanced";
  value?: string;
  description?: string;
  mode?: string;
  disabled?: boolean;
};

export type ClientSupportSetting = {
  contactName: string;
  contactPhone: string;
};

export type ClientLoginSetting = {
  emailLoginEnabled: boolean;
  personalAccountBindingEnabled: boolean;
  passwordlessPersonalLoginEnabled: boolean;
  dapiLoginEnabled: boolean;
};

export type ClientPasswordSetting = {
  requiredEnabled: boolean;
  complexityRule: "default" | "custom";
  periodEnabled: boolean;
  periodDays: number;
};

export type ClientNotificationSetting = {
  enabled: boolean;
  title: string;
  content: string;
};

export type ClientAppVersionPlatformSetting = {
  defaultVersion: string;
  availableVersions: string[];
  useCustomVersion: boolean;
  customVersion?: string;
};

export type ClientAppVersionSetting = {
  ios: ClientAppVersionPlatformSetting;
  android: ClientAppVersionPlatformSetting;
};

export type ClientManager = {
  id: string;
  name: string;
  email: string;
};

export type ClientSettingOption = {
  id: string;
  name: string;
  description?: string;
  disabled?: boolean;
};

export type ClientMealPointSetting = {
  enabled: boolean;
  points: ClientSettingOption[];
  selectedPointIds: string[];
};

export type ClientMealTypeSetting = {
  mealTypes: ClientSettingOption[];
  selectedMealTypeIds: string[];
};

export type ClientMealGroupSetting = {
  mealGroups: ClientSettingOption[];
  selectedMealGroupIds: string[];
};

export type ClientDepartment = {
  id: string;
  name: string;
  parentId?: string;
  source: "manual" | "thirdParty";
  disabled?: boolean;
};

export type ClientCostCenter = {
  id: string;
  name: string;
  disabled?: boolean;
};

export type ClientFieldRequirement = "disabled" | "optional" | "required";

export type ClientFieldSettingKey =
  | "email"
  | "employeeNumber"
  | "name"
  | "department"
  | "costCenter";

export type ClientFieldSettingItem = {
  key: ClientFieldSettingKey;
  title: string;
  requirement: ClientFieldRequirement;
  emailDomains?: string[];
};

export type ClientFieldSettings = {
  fields: ClientFieldSettingItem[];
  enableDisplayRealName: boolean;
  enableEditRealName: boolean;
};

export type ClientSettings = {
  support: ClientSupportSetting;
  login: ClientLoginSetting;
  passwordSetting: ClientPasswordSetting;
  notification: ClientNotificationSetting;
  appVersion: ClientAppVersionSetting;
  managers: ClientManager[];
  departments: ClientDepartment[];
  costCenters: ClientCostCenter[];
  fieldSettings: ClientFieldSettings;
  mealPoint: ClientMealPointSetting;
  mealType: ClientMealTypeSetting;
  mealGroup: ClientMealGroupSetting;
};

export type ClientDetail = ClientSummary & {
  remark?: string;
  fields: Record<string, string>;
  mealPlans: ClientMealPlanSummary[];
  settings: ClientSettingSummary[];
  settingDetails?: ClientSettings;
};

export type ClientListParams = {
  keyword?: string;
  status?: ClientStatus | "all";
};

export type UpdateClientInput = {
  clientId: string;
  values: Partial<{
    name: string;
    remark: string;
    support: ClientSupportSetting;
    login: ClientLoginSetting;
    passwordSetting: ClientPasswordSetting;
    notification: ClientNotificationSetting;
    appVersion: ClientAppVersionSetting;
    managers: ClientManager[];
    departments: ClientDepartment[];
    costCenters: ClientCostCenter[];
    fieldSettings: ClientFieldSettings;
    mealPoint: ClientMealPointSetting;
    mealType: ClientMealTypeSetting;
    mealGroup: ClientMealGroupSetting;
  }>;
};
