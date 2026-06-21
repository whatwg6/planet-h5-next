import type { UpdateClientInput } from "@/domain/client/Client";
import type { ClientRepository } from "@/domain/client/ClientRepository";
import {
  normalizeClientAppVersionSetting,
  normalizeClientLoginSetting,
  uniqueClientSelectionIds,
  validateClientAppVersionSetting,
  validateClientCostCenters,
  validateClientDepartments,
  validateClientFieldSettings,
  validateClientName,
  validateClientNotificationSetting,
  validateClientPasswordSetting,
  validateClientRemark,
  validateClientSelection,
} from "@/domain/client/clientRules";

export function updateClient(repository: ClientRepository, input: UpdateClientInput) {
  if (!input.clientId.trim()) return Promise.reject(new Error("clientId is required"));

  const nameError =
    input.values.name === undefined ? undefined : validateClientName(input.values.name);
  if (nameError) return Promise.reject(new Error(nameError));

  const remarkError =
    input.values.remark === undefined ? undefined : validateClientRemark(input.values.remark);
  if (remarkError) return Promise.reject(new Error(remarkError));

  const departmentError =
    input.values.departments === undefined
      ? undefined
      : validateClientDepartments(input.values.departments);
  if (departmentError) return Promise.reject(new Error(departmentError));

  const costCenterError =
    input.values.costCenters === undefined
      ? undefined
      : validateClientCostCenters(input.values.costCenters);
  if (costCenterError) return Promise.reject(new Error(costCenterError));

  const fieldSettingError =
    input.values.fieldSettings === undefined
      ? undefined
      : validateClientFieldSettings(input.values.fieldSettings);
  if (fieldSettingError) return Promise.reject(new Error(fieldSettingError));

  const passwordSettingError =
    input.values.passwordSetting === undefined
      ? undefined
      : validateClientPasswordSetting(input.values.passwordSetting);
  if (passwordSettingError) return Promise.reject(new Error(passwordSettingError));

  const notificationError =
    input.values.notification === undefined
      ? undefined
      : validateClientNotificationSetting(input.values.notification);
  if (notificationError) return Promise.reject(new Error(notificationError));

  const appVersionError =
    input.values.appVersion === undefined
      ? undefined
      : validateClientAppVersionSetting(input.values.appVersion);
  if (appVersionError) return Promise.reject(new Error(appVersionError));

  if (input.values.mealPoint?.enabled) {
    const mealPointError = validateClientSelection({
      label: "餐点",
      optionIds: input.values.mealPoint.points.map((point) => point.id),
      selectedIds: input.values.mealPoint.selectedPointIds,
      disabledOptionIds: input.values.mealPoint.points
        .filter((point) => point.disabled)
        .map((point) => point.id),
    });
    if (mealPointError) return Promise.reject(new Error(mealPointError));
  }

  if (input.values.mealType) {
    const mealTypeError = validateClientSelection({
      label: "餐次",
      optionIds: input.values.mealType.mealTypes.map((mealType) => mealType.id),
      selectedIds: input.values.mealType.selectedMealTypeIds,
      disabledOptionIds: input.values.mealType.mealTypes
        .filter((mealType) => mealType.disabled)
        .map((mealType) => mealType.id),
    });
    if (mealTypeError) return Promise.reject(new Error(mealTypeError));
  }

  if (input.values.mealGroup) {
    const mealGroupError = validateClientSelection({
      label: "用餐组",
      optionIds: input.values.mealGroup.mealGroups.map((mealGroup) => mealGroup.id),
      selectedIds: input.values.mealGroup.selectedMealGroupIds,
      disabledOptionIds: input.values.mealGroup.mealGroups
        .filter((mealGroup) => mealGroup.disabled)
        .map((mealGroup) => mealGroup.id),
    });
    if (mealGroupError) return Promise.reject(new Error(mealGroupError));
  }

  return repository.updateClient({
    ...input,
    values: {
      ...input.values,
      ...(input.values.name === undefined ? {} : { name: input.values.name.trim() }),
      ...(input.values.remark === undefined ? {} : { remark: input.values.remark.trim() }),
      ...(input.values.login === undefined
        ? {}
        : { login: normalizeClientLoginSetting(input.values.login) }),
      ...(input.values.notification === undefined
        ? {}
        : {
            notification: {
              ...input.values.notification,
              title: input.values.notification.title.trim(),
              content: input.values.notification.content.trim(),
            },
          }),
      ...(input.values.appVersion === undefined
        ? {}
        : { appVersion: normalizeClientAppVersionSetting(input.values.appVersion) }),
      ...(input.values.mealPoint === undefined
        ? {}
        : {
            mealPoint: {
              ...input.values.mealPoint,
              selectedPointIds: input.values.mealPoint.enabled
                ? uniqueClientSelectionIds(input.values.mealPoint.selectedPointIds)
                : [],
            },
          }),
      ...(input.values.mealType === undefined
        ? {}
        : {
            mealType: {
              ...input.values.mealType,
              selectedMealTypeIds: uniqueClientSelectionIds(
                input.values.mealType.selectedMealTypeIds,
              ),
            },
          }),
      ...(input.values.mealGroup === undefined
        ? {}
        : {
            mealGroup: {
              ...input.values.mealGroup,
              selectedMealGroupIds: uniqueClientSelectionIds(
                input.values.mealGroup.selectedMealGroupIds,
              ),
            },
          }),
    },
  });
}
