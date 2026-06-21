import type { ClientDetail } from "@/domain/client/Client";
import { Page } from "@/shared/ui/Page";
import { cn } from "@/shared/utils/cn";

export function ClientDetailView({
  client,
  onBack,
  onOpenMealPlans,
  onOpenSettings,
}: {
  client: ClientDetail;
  onBack: () => void;
  onOpenMealPlans: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <Page title="客户详情" onBack={onBack}>
      <div className="space-y-4">
        <section className="space-y-3 px-1 pt-2">
          <h1 className="text-xl font-semibold leading-7 text-text-primary">{client.name}</h1>
          {client.isDeveloperTest ? (
            <div className="rounded-md bg-functional-warning-background px-3 py-2 text-sm text-functional-warning-foreground">
              测试客户
            </div>
          ) : null}
          {client.remark ? (
            <p className="text-sm leading-6 text-text-secondary">{client.remark}</p>
          ) : null}
        </section>

        <div className="space-y-3">
          <ClientDetailEntry
            title="用餐计划"
            description="查看客户下的用餐方案"
            onClick={onOpenMealPlans}
          />
          <ClientDetailEntry
            title="客户设置"
            description="名称、账号、支付和高级设置"
            onClick={onOpenSettings}
          />
        </div>
      </div>
    </Page>
  );
}

function ClientDetailEntry({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-md border border-border-solid-line-2 bg-background-primary-container p-4 text-left shadow-card",
        "active:bg-background-primary-container--active",
      )}
    >
      <span>
        <span className="block text-base font-medium text-text-primary">{title}</span>
        <span className="mt-1 block text-sm text-text-secondary">{description}</span>
      </span>
      <span className="text-xl leading-none text-text-tertiary">›</span>
    </button>
  );
}
