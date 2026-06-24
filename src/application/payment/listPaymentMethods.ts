import type { PaymentRepository } from "@/domain/payment/PaymentRepository";

export function listPaymentMethods(repository: PaymentRepository, clientId: string) {
  return repository.listPaymentMethods(clientId);
}
