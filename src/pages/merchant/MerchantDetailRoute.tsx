import { useParams } from "@tanstack/react-router";

import type { RouteStackPageProps } from "@/app/router/RouteStack";
import { RouteModeSwitch } from "@/app/router/RouteModeSwitch";
import { MerchantDetailView } from "@/features/merchant/views/MerchantDetailView";

export function MerchantDetailRoute({ routeParams }: RouteStackPageProps) {
  const params = useParams({ strict: false, shouldThrow: false });
  return (
    <RouteModeSwitch
      fallback={
        <MerchantDetailView merchantId={routeParams?.merchantId ?? params?.merchantId ?? ""} />
      }
    />
  );
}
