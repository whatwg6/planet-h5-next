import { PlanBaseInfoEditor } from "@/features/plan/components/PlanBaseInfoEditor";
import { PlanOpenTimesEditor } from "@/features/plan/components/PlanOpenTimesEditor";
import { PlanSimpleSettingEditor } from "@/features/plan/components/PlanSimpleSettingEditor";
import { usePlanDetailQuery } from "@/features/plan/queries/usePlanDetailQuery";
import { ErrorState, LoadingState } from "@/shared/ui/Feedback";
import { Page } from "@/shared/ui/Page";

export function PlanSettingModeView({
  clientId,
  planId,
  mode,
  onBack,
}: {
  clientId: string;
  planId: string;
  mode: string;
  onBack: () => void;
}) {
  const query = usePlanDetailQuery(clientId, planId);

  if (query.isLoading) {
    return (
      <Page title="方案设置" onBack={onBack}>
        <LoadingState />
      </Page>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Page title="方案设置" onBack={onBack}>
        <ErrorState title="加载失败" onRetry={() => query.refetch()} />
      </Page>
    );
  }

  if (mode === "baseInfo") return <PlanBaseInfoEditor plan={query.data} onBack={onBack} />;
  if (mode === "openTimes") return <PlanOpenTimesEditor plan={query.data} onBack={onBack} />;

  return <PlanSimpleSettingEditor plan={query.data} settingId={mode} onBack={onBack} />;
}
