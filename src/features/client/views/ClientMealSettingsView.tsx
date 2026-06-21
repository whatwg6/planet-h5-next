import { useEffect, useMemo, useState } from "react";

import type {
  ClientDetail,
  ClientMealGroupSetting,
  ClientMealPointSetting,
  ClientMealTypeSetting,
  ClientSettingOption,
} from "@/domain/client/Client";
import { validateClientSelection } from "@/domain/client/clientRules";
import { useUpdateClientMutation } from "@/features/client/mutations/useUpdateClientMutation";
import { Button } from "@/shared/ui/Form";
import { Page } from "@/shared/ui/Page";

type MealSettingKind = "mealPoint" | "mealType" | "mealGroup";

type MealSettingDraft = {
  enabled?: boolean;
  options: ClientSettingOption[];
  selectedIds: string[];
};

const titleByKind: Record<MealSettingKind, string> = {
  mealPoint: "餐点使用模式",
  mealType: "餐次卡片",
  mealGroup: "用餐组",
};

const selectionLabelByKind: Record<MealSettingKind, string> = {
  mealPoint: "餐点",
  mealType: "餐次",
  mealGroup: "用餐组",
};

export function ClientMealSettingsView({
  client,
  kind,
  onBack,
}: {
  client: ClientDetail;
  kind: MealSettingKind;
  onBack: () => void;
}) {
  const mutation = useUpdateClientMutation();
  const initialDraft = useMemo(() => createDraft(client, kind), [client, kind]);
  const [draft, setDraft] = useState(initialDraft);
  const [error, setError] = useState<string>();

  useEffect(() => {
    setDraft(initialDraft);
    setError(undefined);
  }, [initialDraft]);

  const toggleSelected = (optionId: string) => {
    setDraft((current) => ({
      ...current,
      selectedIds: current.selectedIds.includes(optionId)
        ? current.selectedIds.filter((id) => id !== optionId)
        : [...current.selectedIds, optionId],
    }));
    setError(undefined);
  };

  const save = () => {
    const nextError =
      kind === "mealPoint" && !draft.enabled
        ? undefined
        : validateClientSelection({
            label: selectionLabelByKind[kind],
            optionIds: draft.options.map((option) => option.id),
            selectedIds: draft.selectedIds,
            disabledOptionIds: draft.options
              .filter((option) => option.disabled)
              .map((option) => option.id),
          });
    setError(nextError);
    if (nextError) return;

    mutation.mutate(
      { clientId: client.id, values: createUpdateValue(kind, draft) },
      { onSuccess: onBack },
    );
  };

  const selectionDisabled = kind === "mealPoint" && !draft.enabled;

  return (
    <Page
      title={titleByKind[kind]}
      onBack={onBack}
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={onBack}>
            取消
          </Button>
          <Button disabled={mutation.isPending} onClick={save}>
            保存
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {kind === "mealPoint" ? (
          <label className="flex items-center justify-between gap-4 rounded-md border border-border-solid-line-2 bg-background-primary-container px-3 py-4 shadow-card">
            <span>
              <span className="block text-sm font-medium text-text-primary">启用餐点模式</span>
              <span className="mt-1 block text-xs text-text-secondary">
                关闭后不限制用餐人员可用餐点。
              </span>
            </span>
            <input
              type="checkbox"
              checked={Boolean(draft.enabled)}
              onChange={(event) => {
                setDraft((current) => ({ ...current, enabled: event.target.checked }));
                setError(undefined);
              }}
              className="h-5 w-5 shrink-0 accent-functional-brand-foreground"
            />
          </label>
        ) : null}

        <section className="overflow-hidden rounded-md border border-border-solid-line-2 bg-background-primary-container shadow-card">
          {draft.options.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-text-secondary">暂无可选项</p>
          ) : (
            draft.options.map((option) => {
              const checked = draft.selectedIds.includes(option.id);
              const disabled = option.disabled || selectionDisabled;

              return (
                <label
                  key={option.id}
                  className="flex items-center justify-between gap-4 border-b border-border-solid-line-2 px-3 py-4 last:border-b-0"
                >
                  <span>
                    <span className="block text-sm font-medium text-text-primary">
                      {option.name}
                    </span>
                    {option.description || option.disabled ? (
                      <span className="mt-1 block text-xs text-text-secondary">
                        {option.disabled ? "已停用，不可选择" : option.description}
                      </span>
                    ) : null}
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleSelected(option.id)}
                    className="h-5 w-5 shrink-0 accent-functional-brand-foreground disabled:opacity-50"
                  />
                </label>
              );
            })
          )}
        </section>

        {error ? <p className="text-sm text-functional-error-foreground">{error}</p> : null}
        {mutation.isError ? (
          <p className="text-sm text-functional-error-foreground">{mutation.error.message}</p>
        ) : null}
      </div>
    </Page>
  );
}

function createDraft(client: ClientDetail, kind: MealSettingKind): MealSettingDraft {
  const details = client.settingDetails;

  if (kind === "mealPoint") {
    const setting = details?.mealPoint ?? {
      enabled: false,
      points: [],
      selectedPointIds: [],
    };
    return {
      enabled: setting.enabled,
      options: setting.points,
      selectedIds: setting.selectedPointIds,
    };
  }

  if (kind === "mealType") {
    const setting = details?.mealType ?? { mealTypes: [], selectedMealTypeIds: [] };
    return {
      options: setting.mealTypes,
      selectedIds: setting.selectedMealTypeIds,
    };
  }

  const setting = details?.mealGroup ?? { mealGroups: [], selectedMealGroupIds: [] };
  return {
    options: setting.mealGroups,
    selectedIds: setting.selectedMealGroupIds,
  };
}

function createUpdateValue(kind: MealSettingKind, draft: MealSettingDraft) {
  if (kind === "mealPoint") {
    return {
      mealPoint: {
        enabled: Boolean(draft.enabled),
        points: draft.options,
        selectedPointIds: draft.enabled ? draft.selectedIds : [],
      } satisfies ClientMealPointSetting,
    };
  }

  if (kind === "mealType") {
    return {
      mealType: {
        mealTypes: draft.options,
        selectedMealTypeIds: draft.selectedIds,
      } satisfies ClientMealTypeSetting,
    };
  }

  return {
    mealGroup: {
      mealGroups: draft.options,
      selectedMealGroupIds: draft.selectedIds,
    } satisfies ClientMealGroupSetting,
  };
}
