import { RouteModeSwitch } from "@/app/router/RouteModeSwitch";
import { MerchantListView } from "@/features/merchant/views/MerchantListView";

export function MerchantListRoute() {
  return <RouteModeSwitch fallback={<MerchantListView />} />;
}
