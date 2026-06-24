import type { PaymentMethod } from "./Payment";

export type PaymentRepository = {
  listPaymentMethods(clientId: string): Promise<PaymentMethod[]>;
};
