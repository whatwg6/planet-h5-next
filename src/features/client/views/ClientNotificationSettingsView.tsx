import { useEffect, useState } from "react";

import type { ClientDetail, ClientNotificationSetting } from "@/domain/client/Client";
import { validateClientNotificationSetting } from "@/domain/client/clientRules";
import { useUpdateClientMutation } from "@/features/client/mutations/useUpdateClientMutation";
import { Button, Field } from "@/shared/ui/Form";
import { Page } from "@/shared/ui/Page";

const emptyNotificationSetting: ClientNotificationSetting = {
  enabled: false,
  title: "",
  content: "",
};

export function ClientNotificationSettingsView({
  client,
  onBack,
}: {
  client: ClientDetail;
  onBack: () => void;
}) {
  const mutation = useUpdateClientMutation();
  const initialSetting = client.settingDetails?.notification ?? emptyNotificationSetting;
  const [enabled, setEnabled] = useState(initialSetting.enabled);
  const [title, setTitle] = useState(initialSetting.title);
  const [content, setContent] = useState(initialSetting.content);

  useEffect(() => {
    setEnabled(initialSetting.enabled);
    setTitle(initialSetting.title);
    setContent(initialSetting.content);
  }, [client.id, initialSetting]);

  const setting: ClientNotificationSetting = { enabled, title, content };
  const error = validateClientNotificationSetting(setting);
  const titleError = error?.includes("标题") ? error : undefined;
  const contentError = error?.includes("内容") ? error : undefined;

  const save = () => {
    if (error) return;
    mutation.mutate(
      { clientId: client.id, values: { notification: setting } },
      { onSuccess: onBack },
    );
  };

  return (
    <Page
      title="企业公告"
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
        <label className="flex items-center justify-between gap-4 rounded-md border border-border-solid-line-2 bg-background-primary-container px-3 py-4 shadow-card">
          <span>
            <span className="block text-sm font-medium text-text-primary">展示企业公告</span>
            <span className="mt-1 block text-xs leading-5 text-text-secondary">
              开启后，用餐人员可在客户端看到公告。
            </span>
          </span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="h-5 w-5 shrink-0 accent-functional-brand-foreground"
          />
        </label>
        <Field
          label="公告标题"
          value={title}
          error={titleError}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="请输入公告标题"
        />
        <Field
          label="公告内容"
          value={content}
          error={contentError}
          onChange={(event) => setContent(event.target.value)}
          placeholder="请输入公告内容"
        />
        {mutation.isError ? (
          <p className="text-sm text-functional-error-foreground">保存失败，请重试</p>
        ) : null}
      </div>
    </Page>
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
