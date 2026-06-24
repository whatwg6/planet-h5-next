import { useParams } from "@tanstack/react-router";

import { RouteModeSwitch } from "@/app/router/RouteModeSwitch";
import { MerchantDetailView } from "@/features/merchant/views/MerchantDetailView";

export function MerchantDetailRoute() {
  const params = useParams({ strict: false, shouldThrow: false });
  const merchantId = params && "merchantId" in params ? String(params.merchantId ?? "") : "";
  return <RouteModeSwitch defaultPage={<MerchantDetailView merchantId={merchantId} />} />;
}
