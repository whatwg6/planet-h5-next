import type { PlanDetail } from "@/domain/plan/Plan";

export const planMockData: PlanDetail[] = [
  {
    id: "p1",
    clientId: "c1",
    name: "方案 A",
    fields: { owner: "运营 A" },
    rules: [{ id: "r1", label: "规则 A", values: {} }],
    updatedAt: "2026-06-13",
  },
  {
    id: "p2",
    clientId: "c2",
    name: "方案 B",
    fields: { owner: "运营 B" },
    rules: [{ id: "r2", label: "规则 B", values: {} }],
    updatedAt: "2026-06-12",
  },
];
