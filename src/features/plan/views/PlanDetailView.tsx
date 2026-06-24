import { useRouter } from "@tanstack/react-router";

import { usePlanDetailQuery } from "@/features/plan/queries/usePlanDetailQuery";
import { formatPlanRuleValue } from "@/domain/plan/planRules";
import { ErrorState, LoadingState } from "@/shared/ui/Feedback";
import { Button } from "@/shared/ui/Form";
import { ListRow, ListSection } from "@/shared/ui/List";
import { Page } from "@/shared/ui/Page";

export function PlanDetailView({
  clientId,
  planId,
  onOpenSettings,
  onOpenOrder,
}: {
  clientId: string;
  planId: string;
  onOpenSettings: () => void;
  onOpenOrder: (orderParams: string) => void;
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
    <Page
      title={query.data.name}
      onBack={() => router.history.back()}
      navigationRight={
        <Button variant="ghost" onClick={onOpenSettings}>
          设置
        </Button>
      }
    >
      <div className="space-y-4">
        <ListSection title="基础信息">
          {Object.entries(query.data.fields).map(([key, value]) => (
            <ListRow key={key} title={key} value={value} />
          ))}
        </ListSection>
        <ListSection title="规则">
          {query.data.rules.map((rule) => (
            <ListRow key={rule.id} title={rule.label} value={formatPlanRuleValue(rule)} />
          ))}
        </ListSection>
        <Button className="w-full" onClick={() => onOpenOrder("CO20260621001-t1781971200000")}>
          查看订单
        </Button>
      </div>
    </Page>
  );
}
