import { useEffect, useState } from "react";

import type {
  ClientDetail,
  ClientFieldRequirement,
  ClientFieldSettingItem,
  ClientFieldSettings,
} from "@/domain/client/Client";
import { validateClientFieldSettings } from "@/domain/client/clientRules";
import { useUpdateClientMutation } from "@/features/client/mutations/useUpdateClientMutation";
import { Button, Field } from "@/shared/ui/Form";
import { Page } from "@/shared/ui/Page";

const requirementText: Record<ClientFieldRequirement, string> = {
  disabled: "关闭",
  optional: "选填",
  required: "必填",
};

const defaultFieldSettings: ClientFieldSettings = {
  fields: [],
  enableDisplayRealName: false,
  enableEditRealName: false,
};

export function ClientFieldSettingsView({
  client,
  onBack,
}: {
  client: ClientDetail;
  onBack: () => void;
}) {
  const mutation = useUpdateClientMutation();
  const fieldSettings = client.settingDetails?.fieldSettings ?? defaultFieldSettings;
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<ClientFieldSettings>(fieldSettings);
  const [emailDomainsText, setEmailDomainsText] = useState(getEmailDomainsText(fieldSettings));

  useEffect(() => {
    setDraft(fieldSettings);
    setEmailDomainsText(getEmailDomainsText(fieldSettings));
    setIsEditing(false);
  }, [client.id, fieldSettings]);

  const normalizedDraft = normalizeDraft(draft, emailDomainsText);
  const error = isEditing ? validateClientFieldSettings(normalizedDraft) : undefined;

  const updateRequirement = (
    key: ClientFieldSettingItem["key"],
    requirement: ClientFieldRequirement,
  ) => {
    setDraft((current) => ({
      ...current,
      fields: current.fields.map((field) =>
        field.key === key
          ? {
              ...field,
              requirement,
            }
          : field,
      ),
    }));
  };

  const toggleAdvanced = (key: "enableDisplayRealName" | "enableEditRealName", value: boolean) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const cancel = () => {
    setDraft(fieldSettings);
    setEmailDomainsText(getEmailDomainsText(fieldSettings));
    setIsEditing(false);
  };

  const save = () => {
    if (error) return;
    mutation.mutate(
      { clientId: client.id, values: { fieldSettings: normalizedDraft } },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  return (
    <Page
      title="字段设置"
      onBack={onBack}
      footer={
        isEditing ? (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={cancel}>
              取消
            </Button>
            <Button disabled={mutation.isPending || Boolean(error)} onClick={save}>
              保存
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="space-y-4">
        <p className="rounded-md bg-background-secondary-container px-3 py-2 text-sm leading-6 text-text-secondary">
          控制用餐人员资料字段是否开启，以及开启后为选填或必填。
        </p>
        {error ? <p className="text-sm text-functional-error-foreground">{error}</p> : null}
        {mutation.isError ? (
          <p className="text-sm text-functional-error-foreground">{mutation.error.message}</p>
        ) : null}
        <section className="space-y-2">
          <h2 className="px-1 text-xs font-medium text-text-tertiary">成员字段</h2>
          <div className="overflow-hidden rounded-md border border-border-solid-line-2 bg-background-primary-container shadow-card">
            {draft.fields.map((field) => (
              <div
                key={field.key}
                className="border-b border-border-solid-line-2 px-3 py-4 last:border-b-0"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-text-primary">{field.title}</span>
                  {isEditing ? (
                    <select
                      aria-label={`${field.title}填写类型`}
                      value={field.requirement}
                      onChange={(event) =>
                        updateRequirement(field.key, event.target.value as ClientFieldRequirement)
                      }
                      className="h-9 rounded-md border border-border-solid-line-2 bg-background-primary-container px-2 text-sm text-text-primary"
                    >
                      <option value="disabled">关闭</option>
                      <option value="optional">选填</option>
                      <option value="required">必填</option>
                    </select>
                  ) : (
                    <span className="text-sm text-text-secondary">
                      {requirementText[field.requirement]}
                    </span>
                  )}
                </div>
                {field.key === "email" && field.requirement !== "disabled" ? (
                  <div className="mt-3">
                    {isEditing ? (
                      <Field
                        label="邮箱后缀"
                        value={emailDomainsText}
                        placeholder="example.com, mc.com"
                        error={error}
                        onChange={(event) => setEmailDomainsText(event.target.value)}
                      />
                    ) : (
                      <p className="text-xs leading-5 text-text-secondary">
                        {field.emailDomains?.length
                          ? `指定邮箱后缀：${field.emailDomains.join(", ")}`
                          : "任意邮箱后缀"}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
        <section className="space-y-2">
          <h2 className="px-1 text-xs font-medium text-text-tertiary">高级设置</h2>
          <div className="overflow-hidden rounded-md border border-border-solid-line-2 bg-background-primary-container shadow-card">
            <BooleanSettingRow
              title="在 APP 显示取餐昵称"
              checked={draft.enableDisplayRealName}
              isEditing={isEditing}
              onChange={(checked) => toggleAdvanced("enableDisplayRealName", checked)}
            />
            <BooleanSettingRow
              title="允许用户编辑取餐昵称"
              checked={draft.enableEditRealName}
              isEditing={isEditing}
              onChange={(checked) => toggleAdvanced("enableEditRealName", checked)}
            />
          </div>
        </section>
        {isEditing ? null : (
          <Button className="w-full" onClick={() => setIsEditing(true)}>
            编辑字段设置
          </Button>
        )}
      </div>
    </Page>
  );
}

function BooleanSettingRow({
  title,
  checked,
  isEditing,
  onChange,
}: {
  title: string;
  checked: boolean;
  isEditing: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 border-b border-border-solid-line-2 px-3 py-4 last:border-b-0">
      <span className="text-sm font-medium text-text-primary">{title}</span>
      {isEditing ? (
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="h-5 w-5 shrink-0 accent-functional-brand-foreground"
        />
      ) : (
        <span className="text-sm text-text-secondary">{checked ? "已开启" : "已关闭"}</span>
      )}
    </label>
  );
}

function getEmailDomainsText(settings: ClientFieldSettings) {
  return settings.fields.find((field) => field.key === "email")?.emailDomains?.join(", ") ?? "";
}

function normalizeDraft(
  settings: ClientFieldSettings,
  emailDomainsText: string,
): ClientFieldSettings {
  const emailDomains = emailDomainsText
    .split(",")
    .map((domain) => domain.trim())
    .filter(Boolean);

  return {
    ...settings,
    fields: settings.fields.map((field) =>
      field.key === "email" && field.requirement !== "disabled"
        ? { ...field, emailDomains }
        : field.key === "email"
          ? { ...field, emailDomains: [] }
          : field,
    ),
  };
}
