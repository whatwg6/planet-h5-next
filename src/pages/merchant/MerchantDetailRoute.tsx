import { useParams } from "@tanstack/react-router";

import { MerchantDetailView } from "@/features/merchant/views/MerchantDetailView";

export function MerchantDetailRoute() {
  const { merchantId } = useParams({ strict: false });
  return <MerchantDetailView merchantId={merchantId ?? ""} />;
}
