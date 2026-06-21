import { useEffect, useState } from "react";

import type { ClientDetail, ClientPasswordSetting } from "@/domain/client/Client";
import { validateClientPasswordSetting } from "@/domain/client/clientRules";
import { useUpdateClientMutation } from "@/features/client/mutations/useUpdateClientMutation";
import { Button } from "@/shared/ui/Form";
import { Page } from "@/shared/ui/Page";

const emptyPasswordSetting: ClientPasswordSetting = {
  requiredEnabled: false,
  complexityRule: "default",
  periodEnabled: false,
  periodDays: 90,
};

export function ClientPasswordSettingsView({
  client,
  onBack,
}: {
  client: ClientDetail;
  onBack: () => void;
}) {
  const mutation = useUpdateClientMutation();
  const initialSetting = client.settingDetails?.passwordSetting ?? emptyPasswordSetting;
  const [requiredEnabled, setRequiredEnabled] = useState(initialSetting.requiredEnabled);
  const [complexityRule, setComplexityRule] = useState<ClientPasswordSetting["complexityRule"]>(
    initialSetting.complexityRule,
  );
  const [periodEnabled, setPeriodEnabled] = useState(initialSetting.periodEnabled);
  const [periodDays, setPeriodDays] = useState(String(initialSetting.periodDays));

  useEffect(() => {
    setRequiredEnabled(initialSetting.requiredEnabled);
    setComplexityRule(initialSetting.complexityRule);
    setPeriodEnabled(initialSetting.periodEnabled);
    setPeriodDays(String(initialSetting.periodDays));
  }, [client.id, initialSetting]);

  const setting = buildPasswordSetting({
    requiredEnabled,
    complexityRule,
    periodEnabled,
    periodDays,
  });
  const error = validateClientPasswordSetting(setting);

  const save = () => {
    if (error) return;
    mutation.mutate(
      {
        clientId: client.id,
        values: { passwordSetting: setting },
      },
      { onSuccess: onBack },
    );
  };

  return (
    <Page
      title="密码策略设置"
      onBack={onBack}
      footer={
        <SettingsFooter
          onCancel={onBack}
          onSave={save}
          disabled={mutation.isPending || Boolean(error)}
        />
      }
    >
      <div className="space-y-4">
        <div className="overflow-hidden rounded-md border border-border-solid-line-2 bg-background-primary-container shadow-card">
          <ToggleRow
            title="成员必须设置密码"
            description="开启后，成员需设置密码后才可登录。"
            checked={requiredEnabled}
            onChange={setRequiredEnabled}
          />
          <label className="block border-b border-border-solid-line-2 px-3 py-4">
            <span className="block text-sm font-medium text-text-primary">密码组成规则</span>
            <select
              aria-label="密码组成规则"
              value={complexityRule}
              onChange={(event) =>
                setComplexityRule(event.target.value as ClientPasswordSetting["complexityRule"])
              }
              className="mt-2 h-10 w-full rounded-md border border-border-solid-line-2 bg-background-primary-container px-3 text-sm text-text-primary"
            >
              <option value="default">默认规则</option>
              <option value="custom">自定义规则</option>
            </select>
            <span className="mt-1 block text-xs leading-5 text-text-secondary">
              默认规则要求同时包含大小写字母和数字，长度为 8-40 位。
            </span>
          </label>
          <ToggleRow
            title="成员定期修改密码"
            description="开启后，成员需按配置周期更新密码。"
            checked={periodEnabled}
            onChange={setPeriodEnabled}
          />
          {periodEnabled ? (
            <label className="block px-3 py-4">
              <span className="block text-sm font-medium text-text-primary">修改周期（天）</span>
              <input
                aria-label="修改周期"
                type="number"
                min={1}
                max={365}
                value={periodDays}
                onChange={(event) => setPeriodDays(event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-border-solid-line-2 bg-background-primary-container px-3 text-sm text-text-primary"
              />
              {error ? (
                <span className="mt-1 block text-xs text-functional-error-foreground">{error}</span>
              ) : null}
            </label>
          ) : null}
        </div>
        {mutation.isError ? (
          <p className="text-sm text-functional-error-foreground">保存失败，请重试</p>
        ) : null}
      </div>
    </Page>
  );
}

function buildPasswordSetting({
  requiredEnabled,
  complexityRule,
  periodEnabled,
  periodDays,
}: {
  requiredEnabled: boolean;
  complexityRule: ClientPasswordSetting["complexityRule"];
  periodEnabled: boolean;
  periodDays: string;
}): ClientPasswordSetting {
  return {
    requiredEnabled,
    complexityRule,
    periodEnabled,
    periodDays: Number(periodDays),
  };
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 border-b border-border-solid-line-2 px-3 py-4">
      <span>
        <span className="block text-sm font-medium text-text-primary">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-text-secondary">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 shrink-0 accent-functional-brand-foreground"
      />
    </label>
  );
}

function SettingsFooter({
  onCancel,
  onSave,
  disabled,
}: {
  onCancel: () => void;
  onSave: () => void;
  disabled: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button variant="secondary" onClick={onCancel}>
        取消
      </Button>
      <Button disabled={disabled} onClick={onSave}>
        保存
      </Button>
    </div>
  );
}
