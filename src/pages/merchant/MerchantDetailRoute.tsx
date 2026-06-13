import { useParams } from "@tanstack/react-router";

import type { RouteStackPageProps } from "@/app/router/RouteStack";
import { MerchantDetailView } from "@/features/merchant/views/MerchantDetailView";

export function MerchantDetailRoute({ routeParams }: RouteStackPageProps) {
  const params = useParams({ strict: false, shouldThrow: false });
  return <MerchantDetailView merchantId={routeParams?.merchantId ?? params?.merchantId ?? ""} />;
}
