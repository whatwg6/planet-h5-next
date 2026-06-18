import type { ClientDetail } from "@/domain/client/Client";

export const clientMockData: ClientDetail[] = [
  { id: "c1", name: "客户 A", phone: "13800000000", updatedAt: "2026-06-13", fields: { owner: "负责人 A" }, planIds: ["p1"] },
  { id: "c2", name: "客户 B", phone: "13900000000", updatedAt: "2026-06-12", fields: { owner: "负责人 B" }, planIds: ["p2"] },
];
