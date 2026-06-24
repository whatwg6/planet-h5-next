import { useQuery } from "@tanstack/react-query";

import { listPaymentMethods } from "@/application/payment/listPaymentMethods";
import { queryKeys } from "@/infrastructure/query/queryKeys";
import { paymentRepository } from "@/infrastructure/repositories/payment";

export function usePaymentMethodsQuery(clientId: string) {
  return useQuery({
    queryKey: queryKeys.payment.methods(clientId),
    queryFn: () => listPaymentMethods(paymentRepository, clientId),
    enabled: clientId.length > 0,
  });
}
