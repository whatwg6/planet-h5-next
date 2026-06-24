import type { ClientListParams } from "@/domain/client/Client";
import type { McStaffSearchParams } from "@/domain/mc-staff/McStaff";
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
  mcStaffs: {
    all: ["mcStaffs"] as const,
    search: (keyword: McStaffSearchParams["keyword"]) => ["mcStaffs", "search", keyword] as const,
  },
  payment: {
    all: ["payment"] as const,
    methods: (clientId: string) => ["payment", "methods", clientId] as const,
  },
  plans: {
    all: ["plans"] as const,
    detail: (clientId: string, planId: string) => ["plans", "detail", clientId, planId] as const,
  },
  orders: {
    all: ["orders"] as const,
    detail: (clientId: string, planId: string, orderParams: string) =>
      ["orders", "detail", clientId, planId, orderParams] as const,
    memberList: (clientId: string, planId: string, orderParams: string) =>
      ["orders", "memberList", clientId, planId, orderParams] as const,
  },
};
