import { useRouter } from "@tanstack/react-router";

import { usePlanDetailQuery } from "@/features/plan/queries/usePlanDetailQuery";
import { InfoRow } from "@/shared/ui/DataDisplay";
import { ErrorState, LoadingState } from "@/shared/ui/Feedback";
import { Button } from "@/shared/ui/Form";
import { Page } from "@/shared/ui/Page";

export function PlanDetailView({
  clientId,
  planId,
  onOpenSettings,
}: {
  clientId: string;
  planId: string;
  onOpenSettings: () => void;
}) {
  const router = useRouter();
  const query = usePlanDetailQuery(clientId, planId);

  if (query.isLoading)
    return (
      <Page title="方案详情" onBack={() => router.history.back()}>
        <LoadingState />
      </Page>
    );
  if (query.isError || !query.data)
    return (
      <Page title="方案详情" onBack={() => router.history.back()}>
        <ErrorState title="加载失败" onRetry={() => query.refetch()} />
      </Page>
    );

  return (
    <Page title="方案详情" onBack={() => router.history.back()}>
      <div className="space-y-4">
        <div className="rounded-md border border-border-solid-line-2 bg-background-primary-container px-3 shadow-card">
          <InfoRow label="名称" value={query.data.name} />
          {Object.entries(query.data.fields).map(([key, value]) => (
            <InfoRow key={key} label={key} value={value} />
          ))}
        </div>
        <Button className="w-full" variant="secondary" onClick={onOpenSettings}>
          方案设置
        </Button>
        <div className="space-y-2">
          {query.data.rules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-md border border-border-solid-line-2 bg-background-primary-container p-3 text-sm shadow-card"
            >
              {rule.label}
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}
