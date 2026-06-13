import { describe, expect, it } from "vitest";

import { mapPlanDetailDto } from "./planMapper";

describe("planMapper", () => {
  it("maps plan DTOs and preserves rule values as data", () => {
    expect(
      mapPlanDetailDto({
        id: "p1",
        client_id: "c1",
        name: "方案 A",
        fields: { owner: "运营" },
        rules: [{ id: "r1", label: "规则 A", values: { value: "1" } }],
        updated_at: "2026-06-13",
      }),
    ).toEqual({
      id: "p1",
      clientId: "c1",
      name: "方案 A",
      fields: { owner: "运营" },
      rules: [{ id: "r1", label: "规则 A", values: { value: "1" } }],
      updatedAt: "2026-06-13",
    });
  });
});
