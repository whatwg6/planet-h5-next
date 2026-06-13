import { describe, expect, it } from "vitest";

import { mapClientDetailDto, mapClientSummaryDto } from "./clientMapper";

describe("clientMapper", () => {
  it("maps DTO names without adding business meaning", () => {
    expect(mapClientSummaryDto({ id: "c1", name: "客户 A", phone: "13800000000", updated_at: "2026-06-13" })).toEqual({
      id: "c1",
      name: "客户 A",
      phone: "13800000000",
      updatedAt: "2026-06-13",
    });
  });

  it("maps detail fields as a generic record", () => {
    expect(mapClientDetailDto({ id: "c1", name: "客户 A", phone: "", updated_at: "", fields: { owner: "张三" }, plan_ids: ["p1"] })).toEqual({
      id: "c1",
      name: "客户 A",
      phone: "",
      updatedAt: "",
      fields: { owner: "张三" },
      planIds: ["p1"],
    });
  });
});
