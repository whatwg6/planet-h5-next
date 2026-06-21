import { useNavigate, useParams, useRouter, useRouterState } from "@tanstack/react-router";

import { routeModeState } from "@/app/router/historyState";
import type { RouteStackPageProps } from "@/app/router/RouteStack";
import { RouteModeSwitch } from "@/app/router/RouteModeSwitch";
import { useClientDetailQuery } from "@/features/client/queries/useClientDetailQuery";
import { ClientDetailEditView } from "@/features/client/views/ClientDetailEditView";
import { ClientDetailView } from "@/features/client/views/ClientDetailView";
import { ClientMealPlansView } from "@/features/client/views/ClientMealPlansView";
import { ClientSettingsView } from "@/features/client/views/ClientSettingsView";
import { ErrorState, LoadingState } from "@/shared/ui/Feedback";
import { Page } from "@/shared/ui/Page";

export function ClientDetailRoute({ routeParams }: RouteStackPageProps) {
  const params = useParams({ strict: false, shouldThrow: false });
  const navigate = useNavigate();
  const router = useRouter();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const clientId = routeParams?.clientId ?? params?.clientId ?? "";
  const query = useClientDetailQuery(clientId);
  const back = () => router.history.back();

  if (query.isLoading)
    return (
      <Page title="客户详情" onBack={back}>
        <LoadingState />
      </Page>
    );
  if (query.isError || !query.data)
    return (
      <Page title="客户详情" onBack={back}>
        <ErrorState title="加载失败" onRetry={() => query.refetch()} />
      </Page>
    );

  const enterMode = (mode: string) => {
    const detailPath = pathname.startsWith("/ops/client")
      ? "/ops/client/$clientId"
      : "/client/$clientId";

    void navigate({
      to: detailPath,
      params: { clientId: query.data.id },
      state: (state) => ({ ...state, ...routeModeState(mode) }),
    });
  };

  const openPlan = (planId: string) => {
    const planPath = pathname.startsWith("/ops/client")
      ? "/ops/client/$clientId/plan/$planId"
      : "/client/$clientId/plans/$planId";

    void navigate({
      to: planPath,
      params: { clientId: query.data.id, planId },
    });
  };

  return (
    <RouteModeSwitch
      defaultPage={
        <ClientDetailView
          client={query.data}
          onBack={back}
          onOpenMealPlans={() => enterMode("plan")}
          onOpenSettings={() => enterMode("setting")}
        />
      }
      modes={{
        plan: <ClientMealPlansView client={query.data} onBack={back} onOpenPlan={openPlan} />,
        setting: <ClientSettingsView client={query.data} onBack={back} onOpenMode={enterMode} />,
        edit: <ClientDetailEditView client={query.data} onClose={back} />,
      }}
    />
  );
}
