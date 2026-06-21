import { useNavigate, useParams, useRouter } from "@tanstack/react-router";

import { routeModeState } from "@/app/router/historyState";
import type { RouteStackPageProps } from "@/app/router/RouteStack";
import { RouteModeSwitch } from "@/app/router/RouteModeSwitch";
import { useClientDetailQuery } from "@/features/client/queries/useClientDetailQuery";
import { ClientDetailEditView } from "@/features/client/views/ClientDetailEditView";
import { ClientDetailView } from "@/features/client/views/ClientDetailView";
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

  const enterEdit = () => {
    void navigate({
      to: "/client/$clientId",
      params: { clientId: query.data.id },
      state: (state) => ({ ...state, ...routeModeState("edit") }),
    });
  };

  return (
    <RouteModeSwitch
      fallback={<ClientDetailView client={query.data} onBack={back} onEdit={enterEdit} />}
      modes={{
        edit: <ClientDetailEditView client={query.data} onClose={back} />,
      }}
    />
  );
}
