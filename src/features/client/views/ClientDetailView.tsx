import type { ClientDetail } from "@/domain/client/Client";
import { SettingIcon } from "@/shared/assets/icons";
import { Button } from "@/shared/ui/Form";
import { Page } from "@/shared/ui/Page";
import { cn } from "@/shared/utils/cn";
import { useState } from "react";

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
  const [destinationMessage, setDestinationMessage] = useState("");

  return (
    <Page
      title="客户详情"
      onBack={onBack}
      navigationRight={
        <Button
          variant="ghost"
          className="h-10 w-10 px-0"
          aria-label="客户设置"
          onClick={onOpenSettings}
        >
          <SettingIcon className="h-5 w-5" aria-hidden="true" />
        </Button>
      }
    >
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
            title="目的地"
            description="查看企业地址及目的地配置"
            onClick={() => setDestinationMessage("此功能专为移动端设计，请移步 APP 继续使用。")}
          />
        </div>
        {destinationMessage ? (
          <div
            role="status"
            className="rounded-md bg-background-components px-3 py-2 text-sm text-text-secondary"
          >
            {destinationMessage}
          </div>
        ) : null}
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
