import { useEffect, useState } from "react";

import type { ClientDetail, ClientLoginSetting } from "@/domain/client/Client";
import { normalizeClientLoginSetting } from "@/domain/client/clientRules";
import { useUpdateClientMutation } from "@/features/client/mutations/useUpdateClientMutation";
import { Button } from "@/shared/ui/Form";
import { Page } from "@/shared/ui/Page";

const loginSettingRows: Array<{
  key: keyof ClientLoginSetting;
  title: string;
  description?: string;
}> = [
  {
    key: "emailLoginEnabled",
    title: "邮箱登录",
    description: "用户需使用邮箱和密码登录",
  },
  {
    key: "personalAccountBindingEnabled",
    title: "允许绑定个人账号",
    description: "绑定后可使用个人余额消费",
  },
  {
    key: "passwordlessPersonalLoginEnabled",
    title: "个人账号联登免密",
    description: "关闭个人账号绑定时会自动关闭",
  },
  { key: "dapiLoginEnabled", title: "DAPI 登录" },
];

const emptyLoginSetting: ClientLoginSetting = {
  emailLoginEnabled: false,
  personalAccountBindingEnabled: false,
  passwordlessPersonalLoginEnabled: false,
  dapiLoginEnabled: false,
};

export function ClientLoginSettingsView({
  client,
  onBack,
}: {
  client: ClientDetail;
  onBack: () => void;
}) {
  const mutation = useUpdateClientMutation();
  const initialLogin = client.settingDetails?.login ?? emptyLoginSetting;
  const [login, setLogin] = useState<ClientLoginSetting>(initialLogin);

  useEffect(() => {
    setLogin(initialLogin);
  }, [client.id, initialLogin]);

  const setChecked = (key: keyof ClientLoginSetting, checked: boolean) => {
    setLogin((current) => normalizeClientLoginSetting({ ...current, [key]: checked }));
  };

  const save = () => {
    mutation.mutate({ clientId: client.id, values: { login } }, { onSuccess: onBack });
  };

  return (
    <Page
      title="登录方式"
      onBack={onBack}
      footer={
        <Button disabled={mutation.isPending} onClick={save}>
          保存
        </Button>
      }
    >
      <div className="overflow-hidden rounded-md border border-border-solid-line-2 bg-background-primary-container shadow-card">
        {loginSettingRows.map((row) => (
          <label
            key={row.key}
            className="flex items-center justify-between gap-4 border-b border-border-solid-line-2 px-3 py-4 last:border-b-0"
          >
            <span>
              <span className="block text-sm font-medium text-text-primary">{row.title}</span>
              {row.description ? (
                <span className="mt-1 block text-xs leading-5 text-text-secondary">
                  {row.description}
                </span>
              ) : null}
            </span>
            <input
              type="checkbox"
              checked={login[row.key]}
              onChange={(event) => setChecked(row.key, event.target.checked)}
              className="h-5 w-5 shrink-0 accent-functional-brand-foreground"
            />
          </label>
        ))}
      </div>
    </Page>
  );
}
