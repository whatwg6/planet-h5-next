import type {
  ClientDetail,
  ClientFieldSettingItem,
  ClientSettingSummary,
  ClientSettings,
} from "@/domain/client/Client";

const baseSettings: ClientSettingSummary[] = [
  { id: "nameAndRemark", title: "名称与备注", group: "basic", mode: "nameAndRemark" },
  { id: "notification", title: "企业公告", group: "basic", mode: "notification" },
  { id: "mealType", title: "餐次卡片", group: "basic", mode: "mealType" },
  { id: "mealGroup", title: "用餐组", group: "basic", mode: "mealGroup" },
  {
    id: "loginSetting",
    title: "登录方式",
    group: "account",
    value: "手机号",
    mode: "loginSetting",
  },
  { id: "fieldSetting", title: "字段设置", group: "account", mode: "fieldSetting" },
  {
    id: "passwordSetting",
    title: "密码策略设置",
    group: "account",
    value: "已开启",
    mode: "passwordSetting",
  },
  { id: "department", title: "部门", group: "account", mode: "department" },
  { id: "costCenter", title: "成本中心", group: "account", mode: "costCenter" },
  { id: "paymentMethod", title: "客户支付方式", group: "payment", value: "2 个", disabled: true },
  { id: "mealPoint", title: "餐点使用模式", group: "payment", mode: "mealPoint" },
  { id: "address", title: "企业地址及目的地配置", group: "address", disabled: true },
  { id: "manager", title: "管理权限", group: "advanced", value: "2 人", mode: "manager" },
  { id: "support", title: "客户支持", group: "advanced", value: "专属客服", mode: "support" },
  { id: "appVersion", title: "客户端最低版本", group: "advanced", mode: "appVersion" },
];

export function createDefaultClientSettings(
  overrides: Partial<ClientSettings> = {},
): ClientSettings {
  return {
    support: {
      contactName: "专属客服",
      contactPhone: "400-000-0000",
      ...overrides.support,
    },
    login: {
      emailLoginEnabled: true,
      personalAccountBindingEnabled: true,
      passwordlessPersonalLoginEnabled: false,
      dapiLoginEnabled: false,
      ...overrides.login,
    },
    passwordSetting: {
      requiredEnabled: true,
      complexityRule: "default",
      periodEnabled: false,
      periodDays: 90,
      ...overrides.passwordSetting,
    },
    notification: {
      enabled: true,
      title: "午餐预订提醒",
      content: "请在 10:30 前完成当天午餐预订。",
      ...overrides.notification,
    },
    appVersion: {
      ios: {
        defaultVersion: "4.38.0",
        availableVersions: ["4.38.0", "4.39.0", "4.40.0"],
        useCustomVersion: false,
        ...overrides.appVersion?.ios,
      },
      android: {
        defaultVersion: "4.38.0",
        availableVersions: ["4.38.0", "4.39.0", "4.40.0"],
        useCustomVersion: false,
        ...overrides.appVersion?.android,
      },
    },
    managers: overrides.managers ?? [
      { id: "m1", name: "负责人 A", email: "owner-a@example.com" },
      { id: "m2", name: "运营 A", email: "ops-a@example.com" },
    ],
    departments: overrides.departments ?? [
      { id: "d1", name: "总部", source: "manual" },
      { id: "d2", name: "研发部", parentId: "d1", source: "manual" },
      { id: "d3", name: "第三方销售部", source: "thirdParty", disabled: true },
    ],
    costCenters: overrides.costCenters ?? [
      { id: "cc1", name: "总部成本中心" },
      { id: "cc2", name: "研发预算" },
      { id: "cc3", name: "停用项目", disabled: true },
    ],
    fieldSettings: overrides.fieldSettings ?? {
      fields: createDefaultFieldSettingItems(),
      enableDisplayRealName: true,
      enableEditRealName: false,
    },
    mealPoint: overrides.mealPoint ?? {
      enabled: false,
      points: [
        { id: "mp1", name: "早餐餐点" },
        { id: "mp2", name: "午餐餐点" },
        { id: "mp3", name: "晚餐餐点", disabled: true },
      ],
      selectedPointIds: ["mp2"],
    },
    mealType: overrides.mealType ?? {
      mealTypes: [
        { id: "mt1", name: "早餐" },
        { id: "mt2", name: "午餐" },
        { id: "mt3", name: "晚餐" },
        { id: "mt4", name: "夜宵", disabled: true },
      ],
      selectedMealTypeIds: ["mt2"],
    },
    mealGroup: overrides.mealGroup ?? {
      mealGroups: [
        { id: "mg1", name: "默认用餐组" },
        { id: "mg2", name: "研发用餐组" },
        { id: "mg3", name: "历史用餐组", disabled: true },
      ],
      selectedMealGroupIds: ["mg1"],
    },
  };
}

function createDefaultFieldSettingItems(): ClientFieldSettingItem[] {
  return [
    { key: "email", title: "邮箱", requirement: "required", emailDomains: ["example.com"] },
    { key: "employeeNumber", title: "登录名", requirement: "optional" },
    { key: "name", title: "取餐昵称", requirement: "optional" },
    { key: "department", title: "部门", requirement: "optional" },
    { key: "costCenter", title: "成本中心", requirement: "disabled" },
  ];
}

export function summarizeClientLoginSetting(setting: ClientSettings["login"]) {
  const enabledCount = [
    setting.emailLoginEnabled,
    setting.personalAccountBindingEnabled,
    setting.passwordlessPersonalLoginEnabled,
    setting.dapiLoginEnabled,
  ].filter(Boolean).length;

  return enabledCount === 0 ? "未开启" : `${enabledCount} 项已开启`;
}

export function summarizeClientPasswordSetting(setting: ClientSettings["passwordSetting"]) {
  return setting.requiredEnabled ? "已开启" : "未开启";
}

export function summarizeClientNotificationSetting(setting: ClientSettings["notification"]) {
  return setting.enabled ? "展示中" : "已关闭";
}

export function summarizeClientAppVersionSetting(setting: ClientSettings["appVersion"]) {
  const iosVersion = setting.ios.useCustomVersion
    ? setting.ios.customVersion
    : setting.ios.defaultVersion;
  const androidVersion = setting.android.useCustomVersion
    ? setting.android.customVersion
    : setting.android.defaultVersion;

  return iosVersion === androidVersion
    ? (iosVersion ?? "系统默认")
    : `iOS ${iosVersion} / Android ${androidVersion}`;
}

export function summarizeClientMealPointSetting(setting: ClientSettings["mealPoint"]) {
  if (!setting.enabled) return "已关闭";
  return setting.selectedPointIds.length === 0
    ? "未选择"
    : `${setting.selectedPointIds.length} 个餐点`;
}

export function summarizeClientMealTypeSetting(setting: ClientSettings["mealType"]) {
  return setting.selectedMealTypeIds.length === 0
    ? "未选择"
    : `${setting.selectedMealTypeIds.length} 个餐次`;
}

export function summarizeClientMealGroupSetting(setting: ClientSettings["mealGroup"]) {
  return setting.selectedMealGroupIds.length === 0
    ? "未选择"
    : `${setting.selectedMealGroupIds.length} 个用餐组`;
}

export function buildClientSettingSummaries(
  client: Pick<ClientDetail, "name" | "isDeveloperTest" | "settingDetails">,
): ClientSettingSummary[] {
  const settingDetails = client.settingDetails ?? createDefaultClientSettings();
  const settings = baseSettings.map((setting) => {
    if (setting.id === "nameAndRemark") return { ...setting, value: client.name };
    if (setting.id === "loginSetting") {
      return { ...setting, value: summarizeClientLoginSetting(settingDetails.login) };
    }
    if (setting.id === "passwordSetting") {
      return { ...setting, value: summarizeClientPasswordSetting(settingDetails.passwordSetting) };
    }
    if (setting.id === "notification") {
      return { ...setting, value: summarizeClientNotificationSetting(settingDetails.notification) };
    }
    if (setting.id === "appVersion") {
      return { ...setting, value: summarizeClientAppVersionSetting(settingDetails.appVersion) };
    }
    if (setting.id === "mealPoint") {
      return { ...setting, value: summarizeClientMealPointSetting(settingDetails.mealPoint) };
    }
    if (setting.id === "mealType") {
      return { ...setting, value: summarizeClientMealTypeSetting(settingDetails.mealType) };
    }
    if (setting.id === "mealGroup") {
      return { ...setting, value: summarizeClientMealGroupSetting(settingDetails.mealGroup) };
    }
    if (setting.id === "manager")
      return { ...setting, value: `${settingDetails.managers.length} 人` };
    if (setting.id === "support") return { ...setting, value: settingDetails.support.contactName };
    if (setting.id === "department") {
      const manualCount = settingDetails.departments.filter(
        (department) => department.source === "manual",
      ).length;
      return { ...setting, value: `${manualCount} 个` };
    }
    if (setting.id === "costCenter")
      return { ...setting, value: `${settingDetails.costCenters.length} 个` };
    if (setting.id === "fieldSetting") {
      const enabledCount = settingDetails.fieldSettings.fields.filter(
        (field) => field.requirement !== "disabled",
      ).length;
      return { ...setting, value: `${enabledCount} 项已开启` };
    }
    return setting;
  });

  if (!client.isDeveloperTest) return settings;

  return [
    ...settings,
    {
      id: "testClientNotify",
      title: "用餐人员接收邮件和短信",
      group: "advanced",
      value: "当前不允许",
      description: "测试客户专属配置",
      disabled: true,
    },
  ];
}

export const clientMockData: ClientDetail[] = [
  {
    id: "c1",
    name: "客户 A",
    phone: "13800000000",
    updatedAt: "2026-06-13",
    isDeveloperTest: true,
    remark: "总部试点客户，优先验证 4.0 客户详情流程。",
    fields: { owner: "负责人 A", status: "跟进中", source: "线索池", city: "上海" },
    settingDetails: createDefaultClientSettings({
      support: { contactName: "客服小美", contactPhone: "400-100-0001" },
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
          { id: "mt3", name: "晚餐" },
          { id: "mt4", name: "夜宵", disabled: true },
        ],
        selectedMealTypeIds: ["mt1", "mt2"],
      },
      mealGroup: {
        mealGroups: [
          { id: "mg1", name: "默认用餐组" },
          { id: "mg2", name: "研发用餐组" },
          { id: "mg3", name: "历史用餐组", disabled: true },
        ],
        selectedMealGroupIds: ["mg1", "mg2"],
      },
      departments: [
        { id: "d1", name: "总部", source: "manual" },
        { id: "d2", name: "研发部", parentId: "d1", source: "manual" },
        { id: "d3", name: "市场部", parentId: "d1", source: "manual" },
        { id: "d4", name: "飞书同步部门", source: "thirdParty", disabled: true },
      ],
    }),
    mealPlans: [
      {
        id: "p1",
        name: "方案 A",
        businessType: "groupDelivery",
        updatedAt: "2026-06-13",
      },
    ],
    settings: [],
  },
  {
    id: "c2",
    name: "客户 B",
    phone: "13900000000",
    updatedAt: "2026-06-12",
    remark: "稳定运行客户。",
    fields: { owner: "负责人 B", status: "已成交", source: "老客转介绍", city: "杭州" },
    settingDetails: createDefaultClientSettings({
      login: {
        emailLoginEnabled: false,
        personalAccountBindingEnabled: true,
        passwordlessPersonalLoginEnabled: true,
        dapiLoginEnabled: false,
      },
      managers: [{ id: "m3", name: "负责人 B", email: "owner-b@example.com" }],
      departments: [{ id: "d5", name: "一级部门", source: "manual" }],
      costCenters: [{ id: "cc4", name: "门店预算" }],
      fieldSettings: {
        fields: [
          { key: "email", title: "邮箱", requirement: "optional", emailDomains: [] },
          { key: "employeeNumber", title: "登录名", requirement: "required" },
          { key: "name", title: "取餐昵称", requirement: "optional" },
          { key: "department", title: "部门", requirement: "disabled" },
          { key: "costCenter", title: "成本中心", requirement: "optional" },
        ],
        enableDisplayRealName: false,
        enableEditRealName: true,
      },
    }),
    mealPlans: [
      {
        id: "p2",
        name: "方案 B",
        businessType: "dineIn",
        updatedAt: "2026-06-12",
      },
    ],
    settings: [],
  },
  {
    id: "c3",
    name: "星河便利店",
    phone: "13612880001",
    updatedAt: "2026-06-11",
    fields: {
      owner: "李娜",
      status: "待回访",
      source: "地推拜访",
      city: "深圳",
      industry: "零售便利",
    },
    settingDetails: createDefaultClientSettings({
      departments: [],
      costCenters: [],
      mealPoint: {
        enabled: false,
        points: [
          { id: "mp1", name: "早餐餐点" },
          { id: "mp2", name: "午餐餐点" },
          { id: "mp3", name: "晚餐餐点", disabled: true },
        ],
        selectedPointIds: [],
      },
      mealType: {
        mealTypes: [
          { id: "mt1", name: "早餐" },
          { id: "mt2", name: "午餐" },
          { id: "mt3", name: "晚餐" },
          { id: "mt4", name: "夜宵", disabled: true },
        ],
        selectedMealTypeIds: [],
      },
      mealGroup: {
        mealGroups: [
          { id: "mg1", name: "默认用餐组" },
          { id: "mg2", name: "研发用餐组" },
          { id: "mg3", name: "历史用餐组", disabled: true },
        ],
        selectedMealGroupIds: [],
      },
    }),
    mealPlans: [],
    settings: [],
  },
  {
    id: "c4",
    name: "晨光咖啡",
    phone: "13712880002",
    updatedAt: "2026-06-10",
    fields: {
      owner: "周明",
      status: "方案确认",
      source: "小程序咨询",
      city: "广州",
      industry: "餐饮",
    },
    settingDetails: createDefaultClientSettings(),
    mealPlans: [],
    settings: [],
  },
  {
    id: "c5",
    name: "远航生鲜",
    phone: "13512880003",
    updatedAt: "2026-06-09",
    fields: {
      owner: "王珊",
      status: "已签约",
      source: "平台招商",
      city: "宁波",
      industry: "生鲜超市",
    },
    settingDetails: createDefaultClientSettings(),
    mealPlans: [],
    settings: [],
  },
  {
    id: "c6",
    name: "青橙健身",
    phone: "13412880004",
    updatedAt: "2026-06-08",
    fields: {
      owner: "陈晨",
      status: "需求收集",
      source: "活动报名",
      city: "成都",
      industry: "健身服务",
    },
    settingDetails: createDefaultClientSettings(),
    mealPlans: [],
    settings: [],
  },
  {
    id: "c7",
    name: "云朵亲子乐园",
    phone: "13312880005",
    updatedAt: "2026-06-07",
    fields: {
      owner: "赵阳",
      status: "待报价",
      source: "门店扫码",
      city: "苏州",
      industry: "亲子娱乐",
    },
    settingDetails: createDefaultClientSettings(),
    mealPlans: [],
    settings: [],
  },
  {
    id: "c8",
    name: "墨色书店",
    phone: "13212880006",
    updatedAt: "2026-06-06",
    isDeveloperTest: true,
    fields: {
      owner: "林雪",
      status: "暂停跟进",
      source: "展会名片",
      city: "南京",
      industry: "文化零售",
    },
    settingDetails: createDefaultClientSettings(),
    mealPlans: [],
    settings: [],
  },
  {
    id: "c9",
    name: "蓝湾民宿",
    phone: "13112880007",
    updatedAt: "2026-06-05",
    fields: {
      owner: "吴迪",
      status: "跟进中",
      source: "官网留资",
      city: "厦门",
      industry: "住宿服务",
    },
    settingDetails: createDefaultClientSettings(),
    mealPlans: [],
    settings: [],
  },
  {
    id: "c10",
    name: "拾味小馆",
    phone: "13012880008",
    updatedAt: "2026-06-04",
    fields: { owner: "何佳", status: "试用中", source: "朋友推荐", city: "武汉", industry: "餐饮" },
    settingDetails: createDefaultClientSettings(),
    mealPlans: [],
    settings: [],
  },
  {
    id: "c11",
    name: "北辰美业",
    phone: "15612880009",
    updatedAt: "2026-06-03",
    fields: {
      owner: "刘璐",
      status: "待签约",
      source: "短视频投放",
      city: "北京",
      industry: "美业",
    },
    settingDetails: createDefaultClientSettings(),
    mealPlans: [],
    settings: [],
  },
  {
    id: "c12",
    name: "麦田烘焙",
    phone: "15512880010",
    updatedAt: "2026-06-02",
    fields: { owner: "孙可", status: "已流失", source: "社群活动", city: "长沙", industry: "烘焙" },
    settingDetails: createDefaultClientSettings(),
    mealPlans: [],
    settings: [],
  },
];

clientMockData.forEach((client) => {
  client.settings = buildClientSettingSummaries(client);
});
