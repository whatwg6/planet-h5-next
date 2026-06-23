import { useNavigate, useParams, useRouter } from "@tanstack/react-router";

import { routeModeState } from "@/app/router/historyState";
import type { RouteStackPageProps } from "@/app/router/RouteStack";
import { RouteModeSwitch } from "@/app/router/RouteModeSwitch";
import { useClientDetailQuery } from "@/features/client/queries/useClientDetailQuery";
import { ClientAppVersionSettingsView } from "@/features/client/views/ClientAppVersionSettingsView";
import { ClientCostCenterSettingsView } from "@/features/client/views/ClientCostCenterSettingsView";
import { ClientDepartmentSettingsView } from "@/features/client/views/ClientDepartmentSettingsView";
import { ClientDetailEditView } from "@/features/client/views/ClientDetailEditView";
import { ClientDetailView } from "@/features/client/views/ClientDetailView";
import { ClientFieldSettingsView } from "@/features/client/views/ClientFieldSettingsView";
import { ClientLoginSettingsView } from "@/features/client/views/ClientLoginSettingsView";
import { ClientManagerSettingsView } from "@/features/client/views/ClientManagerSettingsView";
import { ClientMealSettingsView } from "@/features/client/views/ClientMealSettingsView";
import { ClientMealPlansView } from "@/features/client/views/ClientMealPlansView";
import { ClientNameAndRemarkView } from "@/features/client/views/ClientNameAndRemarkView";
import { ClientNotificationSettingsView } from "@/features/client/views/ClientNotificationSettingsView";
import { ClientPasswordSettingsView } from "@/features/client/views/ClientPasswordSettingsView";
import { ClientSettingsView } from "@/features/client/views/ClientSettingsView";
import { ClientSupportSettingsView } from "@/features/client/views/ClientSupportSettingsView";
import { ErrorState, LoadingState } from "@/shared/ui/Feedback";
import { Page } from "@/shared/ui/Page";

export function ClientDetailRoute({ routeParams }: RouteStackPageProps) {
  const params = useParams({ strict: false, shouldThrow: false });
  const navigate = useNavigate();
  const router = useRouter();
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
    void navigate({
      to: "/ops/client/$clientId",
      params: { clientId: query.data.id },
      state: (state) => ({ ...state, ...routeModeState(mode) }),
    });
  };

  const openPlan = (planId: string) => {
    void navigate({
      to: "/ops/client/$clientId/plan/$planId",
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
        nameAndRemark: (
          <ClientNameAndRemarkView
            client={query.data}
            onBack={back}
            onEdit={() => enterMode("nameAndRemarkEdit")}
          />
        ),
        nameAndRemarkEdit: <ClientDetailEditView client={query.data} onClose={back} />,
        edit: <ClientDetailEditView client={query.data} onClose={back} />,
        support: <ClientSupportSettingsView client={query.data} onBack={back} />,
        loginSetting: <ClientLoginSettingsView client={query.data} onBack={back} />,
        passwordSetting: <ClientPasswordSettingsView client={query.data} onBack={back} />,
        notification: <ClientNotificationSettingsView client={query.data} onBack={back} />,
        appVersion: <ClientAppVersionSettingsView client={query.data} onBack={back} />,
        manager: <ClientManagerSettingsView client={query.data} onBack={back} />,
        department: <ClientDepartmentSettingsView client={query.data} onBack={back} />,
        costCenter: <ClientCostCenterSettingsView client={query.data} onBack={back} />,
        fieldSetting: <ClientFieldSettingsView client={query.data} onBack={back} />,
        mealPoint: <ClientMealSettingsView client={query.data} kind="mealPoint" onBack={back} />,
        mealType: <ClientMealSettingsView client={query.data} kind="mealType" onBack={back} />,
        mealGroup: <ClientMealSettingsView client={query.data} kind="mealGroup" onBack={back} />,
      }}
    />
  );
}
