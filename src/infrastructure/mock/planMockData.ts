import type { PlanDetailDto } from "@/infrastructure/repositories/plan/planDto";

export const planMockData: PlanDetailDto[] = [
  { id: "p1", client_id: "c1", name: "方案 A", fields: { owner: "运营 A" }, rules: [{ id: "r1", label: "规则 A", values: {} }], updated_at: "2026-06-13" },
  { id: "p2", client_id: "c2", name: "方案 B", fields: { owner: "运营 B" }, rules: [{ id: "r2", label: "规则 B", values: {} }], updated_at: "2026-06-12" },
];
