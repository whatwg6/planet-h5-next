import type { PaymentRepository } from "@/domain/payment/PaymentRepository";
import { paymentMockData } from "@/infrastructure/mock/paymentMockData";

export const paymentRepositoryMock: PaymentRepository = {
  async listPaymentMethods(clientId) {
    return structuredClone(paymentMockData[clientId] ?? []);
  },
};
