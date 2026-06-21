import { useNavigate, useParams, useRouter } from "@tanstack/react-router";

import { routeModeState } from "@/app/router/historyState";
import type { RouteStackPageProps } from "@/app/router/RouteStack";
import { RouteModeSwitch } from "@/app/router/RouteModeSwitch";
import { parseOrderParams } from "@/domain/order/orderRules";
import { ClientMemberOrderListView } from "@/features/order/views/ClientMemberOrderListView";
import { ClientOrderDetailView } from "@/features/order/views/ClientOrderDetailView";
import { ErrorState } from "@/shared/ui/Feedback";
import { Page } from "@/shared/ui/Page";

export function ClientOrderRoute({ routeParams }: RouteStackPageProps) {
  const params = useParams({ strict: false, shouldThrow: false });
  const router = useRouter();
  const navigate = useNavigate();
  const clientId = routeParams?.clientId ?? params?.clientId ?? "";
  const planId = routeParams?.planId ?? params?.planId ?? "";
  const rawOrderParams = routeParams?.orderParams ?? params?.orderParams ?? "";
  const parsed = parseOrderParams(rawOrderParams);
  const back = () => router.history.back();

  if (!parsed.ok) {
    return (
      <Page title="订单详情" onBack={back}>
        <ErrorState title={parsed.error} />
      </Page>
    );
  }

  const openMemberOrders = () => {
    void navigate({
      to: "/ops/client/$clientId/plan/$planId/order/$orderParams",
      params: { clientId, planId, orderParams: rawOrderParams },
      state: (state) => ({ ...state, ...routeModeState("list") }),
    });
  };

  return (
    <RouteModeSwitch
      defaultPage={
        <ClientOrderDetailView
          clientId={clientId}
          planId={planId}
          orderParams={parsed.value}
          onBack={back}
          onOpenMemberOrders={openMemberOrders}
        />
      }
      modes={{
        list: (
          <ClientMemberOrderListView
            clientId={clientId}
            planId={planId}
            orderParams={parsed.value}
            onBack={back}
          />
        ),
      }}
    />
  );
}
