import { usePlanDetailQuery } from "@/features/plan/queries/usePlanDetailQuery";
import { InfoRow } from "@/shared/ui/DataDisplay";
import { ErrorState, LoadingState } from "@/shared/ui/Feedback";
import { Page } from "@/shared/ui/Page";

export function PlanDetailView({ clientId, planId }: { clientId: string; planId: string }) {
  const query = usePlanDetailQuery(clientId, planId);

  if (query.isLoading) return <Page title="方案详情"><LoadingState /></Page>;
  if (query.isError || !query.data) return <Page title="方案详情"><ErrorState title="加载失败" onRetry={() => query.refetch()} /></Page>;

  return (
    <Page title="方案详情">
      <div className="space-y-4">
        <div className="rounded-md bg-white px-3">
          <InfoRow label="名称" value={query.data.name} />
          {Object.entries(query.data.fields).map(([key, value]) => <InfoRow key={key} label={key} value={value} />)}
        </div>
        <div className="space-y-2">
          {query.data.rules.map((rule) => <div key={rule.id} className="rounded-md border border-line bg-white p-3 text-sm">{rule.label}</div>)}
        </div>
      </div>
    </Page>
  );
}
