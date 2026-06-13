import type { ClientDetailDto } from "@/infrastructure/repositories/client/clientDto";

export const clientMockData: ClientDetailDto[] = [
  { id: "c1", name: "客户 A", phone: "13800000000", updated_at: "2026-06-13", fields: { owner: "负责人 A" }, plan_ids: ["p1"] },
  { id: "c2", name: "客户 B", phone: "13900000000", updated_at: "2026-06-12", fields: { owner: "负责人 B" }, plan_ids: ["p2"] },
];
