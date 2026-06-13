import type { MerchantDetailDto } from "@/infrastructure/repositories/merchant/merchantDto";

export const merchantMockData: MerchantDetailDto[] = [
  { id: "m1", name: "商户 A", city: "上海", fields: { contact: "联系人 A" } },
  { id: "m2", name: "商户 B", city: "杭州", fields: { contact: "联系人 B" } },
];
