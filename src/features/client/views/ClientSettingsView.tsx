import type { ClientDetail, ClientSettingSummary } from "@/domain/client/Client";
import { Page } from "@/shared/ui/Page";

const settingGroupTitle: Record<ClientSettingSummary["group"], string> = {
  basic: "基础设置",
  account: "账号设置",
  payment: "支付设置",
  address: "地址设置",
  advanced: "高级设置",
};

const settingGroups: ClientSettingSummary["group"][] = [
  "basic",
  "account",
  "payment",
  "address",
  "advanced",
];

export function ClientSettingsView({
  client,
  onBack,
  onOpenMode,
}: {
  client: ClientDetail;
  onBack: () => void;
  onOpenMode: (mode: string) => void;
}) {
  return (
    <Page title="客户设置" onBack={onBack}>
      <div className="space-y-4">
        {settingGroups.map((group) => {
          const settings = client.settings.filter((setting) => setting.group === group);
          if (settings.length === 0) return null;

          return (
            <section key={group} className="space-y-2">
              <h2 className="px-1 text-xs font-medium text-text-tertiary">
                {settingGroupTitle[group]}
              </h2>
              <div className="overflow-hidden rounded-md border border-border-solid-line-2 bg-background-primary-container shadow-card">
                {settings.map((setting) => (
                  <SettingRow
                    key={setting.id}
                    setting={setting}
                    onClick={setting.mode ? () => onOpenMode(setting.mode as string) : undefined}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Page>
  );
}

function SettingRow({ setting, onClick }: { setting: ClientSettingSummary; onClick?: () => void }) {
  const isClickable = Boolean(onClick) && !setting.disabled;

  return (
    <button
      type="button"
      disabled={!isClickable}
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 border-b border-border-solid-line-2 px-3 py-4 text-left last:border-b-0 enabled:active:bg-background-primary-container--active disabled:opacity-100"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-text-primary">{setting.title}</span>
        {setting.description ? (
          <span className="mt-1 block text-xs text-text-secondary">{setting.description}</span>
        ) : null}
      </span>
      <span className="flex shrink-0 items-center gap-2 text-sm text-text-secondary">
        {setting.value ? <span>{setting.value}</span> : null}
        {isClickable ? <span className="text-xl leading-none text-text-tertiary">›</span> : null}
      </span>
    </button>
  );
}
