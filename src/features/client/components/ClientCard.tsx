import type { ClientSummary } from "@/domain/client/Client";
import { formatClientStatus } from "@/domain/client/clientRules";

export function ClientCard({ client, onClick }: { client: ClientSummary; onClick: () => void }) {
  return (
    <button
      type="button"
      className="w-full rounded-md border border-border-solid-line-2 bg-background-primary-container p-4 text-left shadow-card"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-text-primary">{client.name}</h2>
          <p className="mt-1 text-xs text-text-secondary">负责人：{client.ownerName ?? "未分配"}</p>
        </div>
        <span className="shrink-0 rounded-full bg-background-components px-2 py-1 text-xs text-text-secondary">
          {formatClientStatus(client.status ?? "enabled")}
        </span>
      </div>
      <div className="mt-3 space-y-1 text-xs text-text-secondary">
        {client.phone ? <p>电话：{client.phone}</p> : null}
        <p>{client.settingCompletionText ?? "配置待确认"}</p>
        {client.isDeveloperTest ? (
          <p className="text-functional-warning-foreground">测试客户</p>
        ) : null}
      </div>
    </button>
  );
}
