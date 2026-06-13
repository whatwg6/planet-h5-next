import type { ClientListParams } from "@/domain/client/Client";
import type { MerchantListParams } from "@/domain/merchant/Merchant";

export const queryKeys = {
  clients: {
    all: ["clients"] as const,
    list: (params: ClientListParams) => ["clients", "list", params] as const,
    detail: (clientId: string) => ["clients", "detail", clientId] as const,
  },
  merchants: {
    all: ["merchants"] as const,
    list: (params: MerchantListParams) => ["merchants", "list", params] as const,
    detail: (merchantId: string) => ["merchants", "detail", merchantId] as const,
  },
  plans: {
    all: ["plans"] as const,
    detail: (clientId: string, planId: string) => ["plans", "detail", clientId, planId] as const,
  },
};
