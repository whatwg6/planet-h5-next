import { useEffect, useState } from "react";

import type {
  ClientAppVersionPlatformSetting,
  ClientAppVersionSetting,
  ClientDetail,
} from "@/domain/client/Client";
import {
  normalizeClientAppVersionSetting,
  validateClientAppVersionSetting,
} from "@/domain/client/clientRules";
import { useUpdateClientMutation } from "@/features/client/mutations/useUpdateClientMutation";
import { Button } from "@/shared/ui/Form";
import { Page } from "@/shared/ui/Page";

const defaultVersions = ["4.38.0", "4.39.0", "4.40.0"];

const emptyAppVersionSetting: ClientAppVersionSetting = {
  ios: {
    defaultVersion: "4.38.0",
    availableVersions: defaultVersions,
    useCustomVersion: false,
  },
  android: {
    defaultVersion: "4.38.0",
    availableVersions: defaultVersions,
    useCustomVersion: false,
  },
};

type PlatformDraft = {
  useCustomVersion: boolean;
  customVersion: string;
};

export function ClientAppVersionSettingsView({
  client,
  onBack,
}: {
  client: ClientDetail;
  onBack: () => void;
}) {
  const mutation = useUpdateClientMutation();
  const initialSetting = client.settingDetails?.appVersion ?? emptyAppVersionSetting;
  const [ios, setIos] = useState<PlatformDraft>(toDraft(initialSetting.ios));
  const [android, setAndroid] = useState<PlatformDraft>(toDraft(initialSetting.android));

  useEffect(() => {
    setIos(toDraft(initialSetting.ios));
    setAndroid(toDraft(initialSetting.android));
  }, [client.id, initialSetting]);

  const setting = normalizeClientAppVersionSetting({
    ios: toPlatformSetting(initialSetting.ios, ios),
    android: toPlatformSetting(initialSetting.android, android),
  });
  const error = validateClientAppVersionSetting(setting);

  const save = () => {
    if (error) return;
    mutation.mutate(
      { clientId: client.id, values: { appVersion: setting } },
      { onSuccess: onBack },
    );
  };

  return (
    <Page
      title="客户端最低版本"
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
        <p className="rounded-md bg-functional-brand-transparent px-3 py-2 text-xs leading-5 text-text-secondary">
          全部用餐人员将强制升级至以下版本，才可正常使用 App。
        </p>
        <PlatformVersionEditor
          title="iOS"
          setting={initialSetting.ios}
          draft={ios}
          onChange={setIos}
          error={error?.startsWith("iOS") ? error : undefined}
        />
        <PlatformVersionEditor
          title="Android"
          setting={initialSetting.android}
          draft={android}
          onChange={setAndroid}
          error={error?.startsWith("Android") ? error : undefined}
        />
        {mutation.isError ? (
          <p className="text-sm text-functional-error-foreground">保存失败，请重试</p>
        ) : null}
      </div>
    </Page>
  );
}

function toDraft(setting: ClientAppVersionPlatformSetting): PlatformDraft {
  return {
    useCustomVersion: setting.useCustomVersion,
    customVersion: setting.customVersion ?? setting.defaultVersion,
  };
}

function toPlatformSetting(
  setting: ClientAppVersionPlatformSetting,
  draft: PlatformDraft,
): ClientAppVersionPlatformSetting {
  return {
    ...setting,
    useCustomVersion: draft.useCustomVersion,
    customVersion: draft.customVersion,
  };
}

function PlatformVersionEditor({
  title,
  setting,
  draft,
  onChange,
  error,
}: {
  title: string;
  setting: ClientAppVersionPlatformSetting;
  draft: PlatformDraft;
  onChange: (draft: PlatformDraft) => void;
  error?: string;
}) {
  return (
    <section className="overflow-hidden rounded-md border border-border-solid-line-2 bg-background-primary-container shadow-card">
      <h2 className="border-b border-border-solid-line-2 px-3 py-2 text-xs font-medium text-text-tertiary">
        {title}
      </h2>
      <label className="flex items-center justify-between gap-3 border-b border-border-solid-line-2 px-3 py-4">
        <span className="text-sm font-medium text-text-primary">系统默认</span>
        <span className="flex items-center gap-2 text-sm text-text-secondary">
          {setting.defaultVersion}
          <input
            type="radio"
            name={`${title}-version-mode`}
            checked={!draft.useCustomVersion}
            onChange={() => onChange({ ...draft, useCustomVersion: false })}
            className="h-5 w-5 accent-functional-brand-foreground"
          />
        </span>
      </label>
      <label className="block px-3 py-4">
        <span className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-text-primary">自定义</span>
          <input
            type="radio"
            name={`${title}-version-mode`}
            checked={draft.useCustomVersion}
            onChange={() => onChange({ ...draft, useCustomVersion: true })}
            className="h-5 w-5 accent-functional-brand-foreground"
          />
        </span>
        <select
          aria-label={`${title} 自定义版本`}
          value={draft.customVersion}
          disabled={!draft.useCustomVersion}
          onChange={(event) => onChange({ ...draft, customVersion: event.target.value })}
          className="mt-2 h-10 w-full rounded-md border border-border-solid-line-2 bg-background-primary-container px-3 text-sm text-text-primary disabled:opacity-50"
        >
          <option value="">请选择版本</option>
          {setting.availableVersions.map((version) => (
            <option key={version} value={version}>
              {version}
            </option>
          ))}
        </select>
        {error ? (
          <span className="mt-1 block text-xs text-functional-error-foreground">{error}</span>
        ) : null}
      </label>
    </section>
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
